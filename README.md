# ATELIER — web trgovina odjeće

Projekt iz kolegija Web programiranje. Monorepo sa zajedničkim backendom i React
aplikacijom za kupce.

| Dio | Tehnologije | Adresa (dev) |
| --- | --- | --- |
| `server/` | Express.js, TypeScript, MongoDB (Mongoose), JWT | http://localhost:4000 |
| `client/` | Vite, React, TypeScript, Tailwind CSS v4, Zustand | http://localhost:5173 |

Trenutno stanje: registracija i prijava, katalog proizvoda, košarica, naplata i
praćenje narudžbi. Plaćanje karticom i admin panel dolaze u sljedećim koracima.

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
npm install                          # instalira server i klijent (npm workspaces)
cp server/.env.example server/.env   # postavke poslužitelja
npm run seed                         # 14 demo proizvoda + 2 korisnika
npm run dev                          # pokreće API i klijent odjednom
```

Zatim otvorite **http://localhost:5173**.

Pojedinačno: `npm run dev:server`, `npm run dev:client`.

Ako klijent radi na drugoj adresi ili API na drugom portu, kopirajte
`client/.env.example` u `client/.env` i podesite `VITE_API_URL`.

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
- **Naplata** — adresa dostave i sažetak; iznosi se računaju na poslužitelju
- **Profil** — popis narudžbi s vizualnim praćenjem statusa i uređivanje osobnih podataka

### Statusi narudžbe

`Potvrđeno` → `U pripremi` → `Isporučeno` → `Preuzeto`

Interni status `Čeka plaćanje` koristi se dok plaćanje nije dovršeno.
Svaka promjena zapisuje se u povijest narudžbe.

> Plaćanje je zasad simulirano — narudžba se stvara normalno, a potvrđuje se pri
> povratku na stranicu uspjeha. Naplata karticom dolazi u sljedećem koraku.

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
| POST | `/api/orders` | prijavljen | stvaranje narudžbe iz košarice |
| GET | `/api/orders/mine` | prijavljen | vlastite narudžbe |
| GET | `/api/orders/:id` | vlasnik/admin | detalji narudžbe |
| POST | `/api/orders/:id/confirm` | vlasnik | potvrda plaćanja |
| GET | `/api/orders` | admin | sve narudžbe (filtri, pretraga) |
| PATCH | `/api/orders/:id/status` | admin | promjena statusa |

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

## Ostale naredbe

```bash
npm run build       # produkcijski build poslužitelja i klijenta
npm run typecheck   # TypeScript provjera bez emitiranja
npm run seed        # ponovno puni bazu demo podacima (briše postojeće)
```
