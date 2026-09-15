# ATELIER — web trgovina odjeće

Projekt iz kolegija Web programiranje. Monorepo s jednim zajedničkim backendom i
dvije odvojene React aplikacije.

| Dio | Tehnologije | Adresa (dev) |
| --- | --- | --- |
| `server/` | Express.js, TypeScript, MongoDB (Mongoose), JWT | http://localhost:4000 |
| `client/` | Vite, React, TypeScript, Tailwind CSS v4, Zustand | http://localhost:5173 |
| `admin/` | Vite, React, TypeScript, Tailwind CSS v4 | http://localhost:5174 |

Baza i API su **zajednički** za obje aplikacije. Trenutno stanje: cijela trgovina za
kupce te admin panel s upravljanjem proizvodima. Pregled narudžbi i nadzorna ploča
dolaze u sljedećem koraku.

## Preduvjeti

- Node.js 20+ i npm 10+
- MongoDB koji radi na `mongodb://127.0.0.1:27017`

```bash
# macOS (Homebrew)
brew services start mongodb-community

# ili Docker (iz korijena projekta)
docker compose up -d
```

## Pokretanje

```bash
npm install                          # instalira sve tri aplikacije (npm workspaces)
cp server/.env.example server/.env   # postavke poslužitelja
npm run seed                         # 14 demo proizvoda + 2 korisnika
npm run dev                          # pokreće API + klijent + admin odjednom
```

Pojedinačno: `npm run dev:server`, `npm run dev:client`, `npm run dev:admin`.

Trgovina je na **http://localhost:5173**, a admin panel na **http://localhost:5174**.

Ako API radi na drugom portu, kopirajte `client/.env.example` u `client/.env`
(odnosno `admin/.env.example` u `admin/.env`) i podesite `VITE_API_URL`.

### Demo računi

| Uloga | E-mail | Lozinka |
| --- | --- | --- |
| Administrator | `admin@trgovina.hr` | `admin123` |
| Kupac | `ana@primjer.hr` | `korisnik123` |

## Funkcionalnosti

- **Početna** — hero, kategorije, izdvojeni proizvodi, editorijal, recenzije
- **O nama** — priča brenda, vrijednosti, vremenska crta
- **Registracija i prijava** (JWT, token u `localStorage`)
- **Trgovina** — filtriranje po kategoriji, veličini i cijeni, pretraga, sortiranje
  i paginacija; stanje filtara čuva se u URL-u
- **Stranica proizvoda** — galerija slika, odabir veličine i količine, povezani proizvodi
- **Košarica** — trajna (`localStorage`), izmjena količina, praćenje praga za besplatnu dostavu
- **Naplata** — adresa dostave + plaćanje karticom (Stripe Checkout)
- **Profil** — popis narudžbi s vizualnim praćenjem statusa i uređivanje osobnih podataka

### Admin (`admin/`)

- Prijava odvojena od trgovine — pristup samo za ulogu `admin`
- **Proizvodi** — popis s pretragom i filtrima, dodavanje, uređivanje, brisanje (uz potvrdu)
  - proizvod: naziv, naslovna slika, opis, ostale slike, cijena, stara cijena,
    kategorija, veličine, boje, zaliha, vidljivost
  - slike: učitavanje povlačenjem/odabirom datoteke ili unosom URL-a

### Statusi narudžbe

`Potvrđeno` → `U pripremi` → `Isporučeno` → `Preuzeto`

Interni status `Čeka plaćanje` koristi se dok plaćanje nije dovršeno i administrator
ga ne može postaviti. Svaka promjena zapisuje se u povijest narudžbe.

## Plaćanje (Stripe)

Bez Stripe ključa aplikacija radi u **DEMO načinu**: narudžba se stvara normalno,
a plaćanje se simulira na stranici uspjeha. Tako se cijeli tok može isprobati bez računa.

Za pravo plaćanje upišite ključ u `server/.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # bez tajne se webhook ne koristi (potpis je obavezan)
```

Nakon toga naplata koristi **Stripe Checkout** (preusmjeravanje na Stripeovu stranicu).
Testna kartica: `4242 4242 4242 4242`, bilo koji budući datum i CVC.

Za webhook lokalno:

```bash
stripe listen --forward-to localhost:4000/api/stripe/webhook
```

Narudžba se označava plaćenom na dva neovisna načina (oba su idempotentna):
webhookom `checkout.session.completed` i provjerom sesije pri povratku kupca u trgovinu —
pa plaćanje radi i kad webhook nije postavljen.

Webhook prihvaća samo događaje s ispravnim Stripe potpisom; bez `STRIPE_WEBHOOK_SECRET`
vraća `503`. Pri potvrdi se sesija dohvaća sa Stripea po ID-u spremljenom uz narudžbu te
se provjerava da iznos i valuta odgovaraju narudžbi — `session_id` iz URL-a se ne koristi.

## API

| Metoda | Ruta | Pristup | Opis |
| --- | --- | --- | --- |
| GET | `/api/health` | javno | provjera rada poslužitelja |
| POST | `/api/auth/register` | javno | registracija kupca |
| POST | `/api/auth/login` | javno | prijava kupca |
| POST | `/api/auth/admin/login` | javno | prijava u admin panel (uloga `admin`) |
| GET | `/api/auth/me` | prijavljen | podaci o prijavljenom korisniku |
| PUT | `/api/auth/me` | prijavljen | izmjena profila |
| GET | `/api/products` | javno | popis (filtri, pretraga, sortiranje, paginacija) |
| GET | `/api/products/categories` | javno | kategorije s brojem proizvoda |
| GET | `/api/products/:idOrSlug` | javno | proizvod + povezani proizvodi |
| POST / PUT / DELETE | `/api/products/:id` | admin | upravljanje proizvodima |
| POST | `/api/uploads` | admin | učitavanje slika (multipart) |
| POST | `/api/orders` | prijavljen | stvaranje narudžbe iz košarice |
| GET | `/api/orders/mine` | prijavljen | vlastite narudžbe |
| GET | `/api/orders/:id` | vlasnik/admin | detalji narudžbe |
| POST | `/api/orders/:id/confirm` | vlasnik | potvrda plaćanja po povratku sa Stripea |
| GET | `/api/orders` | admin | sve narudžbe (filtri, pretraga) |
| PATCH | `/api/orders/:id/status` | admin | promjena statusa |
| POST | `/api/stripe/webhook` | Stripe | potvrda plaćanja |

Cijene i iznosi uvijek se računaju na poslužitelju — podacima iz košarice se ne vjeruje.

Lozinke se spremaju hashirane (bcrypt), a prijava vraća JWT token koji klijent
čuva u `localStorage` i šalje u zaglavlju `Authorization: Bearer <token>`.

```bash
# pretraga po nazivu, najjeftinije prvo
curl 'http://localhost:4000/api/products?search=majica&sort=price_asc'

# filtriranje po kategoriji, veličini i cijeni uz paginaciju
curl 'http://localhost:4000/api/products?category=Jakne&size=M&maxPrice=150&page=1&limit=12'
```

Dopuštene vrijednosti za `sort`: `newest`, `price_asc`, `price_desc`, `name_asc`.

Učitane slike spremaju se u `server/uploads/` i poslužuju na `/uploads/<datoteka>`.

## Ostale naredbe

```bash
npm run build       # produkcijski build sve tri aplikacije
npm run typecheck   # TypeScript provjera bez emitiranja
npm run seed        # ponovno puni bazu demo podacima (briše postojeće)
```
