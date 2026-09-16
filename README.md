# 🛍️ ATELIER | Web trgovina odjeće

**Projekt iz kolegija: Web programiranje**

ATELIER je full-stack web trgovina odjeće s dvije odvojene React aplikacije nad
zajedničkim API-jem: trgovina za kupce i administratorski panel za vođenje
asortimana i narudžbi. Kupac pretražuje katalog, puni košaricu i plaća karticom,
a administrator u stvarnom vremenu prati prihod, zalihe i status svake narudžbe.

---

## 🚀 Ključne Funkcionalnosti

- **Katalog s pametnim filtrima:** Pretraga, filtriranje po kategoriji, veličini i
  cijeni, sortiranje i paginacija — stanje filtara pamti se u URL-u pa se pretraga
  može podijeliti poveznicom.
- **Košarica koja pamti:** Sadržaj ostaje spremljen u pregledniku (`localStorage`),
  uz praćenje koliko nedostaje do besplatne dostave.
- **Plaćanje karticom (Stripe Checkout):** Naplata preko Stripeove stranice, uz
  potvrdu plaćanja webhookom i provjerom sesije — iznosi se uvijek računaju na
  poslužitelju, nikad iz košarice korisnika.
- **Praćenje narudžbe:** Kupac u profilu vidi svaku narudžbu i njezin put kroz
  statuse: `Potvrđeno` → `U pripremi` → `Isporučeno` → `Preuzeto`.
- **Admin nadzorna ploča:** Prihod, broj narudžbi, kupci, raspodjela po statusima
  i upozorenje na proizvode s niskom zalihom.
- **Upravljanje asortimanom:** Dodavanje, uređivanje i brisanje proizvoda uz
  učitavanje slika povlačenjem datoteke ili unosom URL-a.
- **User Dashboard:** Registracija, prijava (JWT) i uređivanje osobnih podataka,
  s odvojenom prijavom za administratore.

---

## 🛠 Tech Stack

### Frontend (Client + Admin)

- **React (Vite)** – Core framework za brzo i reaktivno sučelje.
- **TypeScript** – Sigurnost koda i lakše održavanje.
- **Tailwind CSS v4** – Moderni "utility-first" CSS za responzivni dizajn.
- **React Router** – Navigacija i zaštićene rute za prijavljene korisnike.
- **Zustand** – Lagano upravljanje stanjem košarice i prijave.

### Backend (Server)

- **Node.js** – Runtime okruženje za izvršavanje JavaScripta na poslužitelju.
- **Express** – Framework za kreiranje API ruta i obradu podataka.
- **MongoDB + Mongoose** – Baza podataka za proizvode, korisnike i narudžbe.
- **JWT + bcrypt** – Prijava korisnika i sigurno čuvanje lozinki.
- **Stripe** – Naplata karticom preko Stripe Checkouta.
- **Multer + Cloudinary** – Učitavanje i trajno čuvanje slika proizvoda.

---

## 💻 Pokretanje Projekta Lokalno

Da biste pokrenuli projekt, pobrinite se da imate instaliran **Node.js 20+** i
**MongoDB**. Projekt koristi npm workspaces, pa se sve tri aplikacije instaliraju
jednom naredbom iz korijena projekta.

### 1. Pokretanje baze podataka

MongoDB mora raditi prije pokretanja poslužitelja. Otvorite terminal i pokrenite:

```bash
brew services start mongodb-community
```

Ili, ako koristite Docker, iz korijena projekta:

```bash
docker compose up -d
```

### 2. Instalacija i priprema

Iz korijena projekta pokrenite:

```bash
npm install
cp server/.env.example server/.env
npm run seed
```

`npm run seed` puni bazu s 14 demo proizvoda i dva korisnika.

### 3. Pokretanje Servera (Backend)

Otvorite novi terminal i pokrenite:

```bash
npm run dev:server
```

Poslužitelj radi na **http://localhost:4000**

### 4. Pokretanje Klijenta (Frontend)

Otvorite novi terminal i pokrenite:

```bash
npm run dev:client
```

Trgovina se otvara na **http://localhost:5173**

### 5. Pokretanje Admin Panela

Otvorite novi terminal i pokrenite:

```bash
npm run dev:admin
```

Admin panel se otvara na **http://localhost:5174**

> 💡 Sve tri aplikacije odjednom: umjesto koraka 3–5 dovoljno je `npm run dev`.

### 🔑 Demo računi

| Uloga         | E-mail              | Lozinka       |
| ------------- | ------------------- | ------------- |
| Administrator | `admin@trgovina.hr` | `admin123`    |
| Kupac         | `ana@primjer.hr`    | `korisnik123` |

### 💳 Plaćanje

Bez Stripe ključa aplikacija radi u **demo načinu** — narudžba se stvara normalno,
a plaćanje se simulira, pa se cijeli tok može isprobati bez Stripe računa.

Za pravo plaćanje upišite svoj testni ključ u `server/.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Testna kartica: `4242 4242 4242 4242`, bilo koji budući datum i CVC.

### 🖼 Slike proizvoda

Bez Cloudinary podataka slike se spremaju na **lokalni disk** (`server/uploads/`),
što je dovoljno za razvoj. Za objavljenu verziju upišite podatke iz Cloudinary
Dashboarda u `server/.env` pa slike idu u oblak i preživljavaju ponovni deploy:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Slike se pritom pretvaraju u WEBP i smanjuju na najviše 1600 px širine.
Pri pokretanju poslužitelj ispisuje koji način koristi:
`[api] slike: Cloudinary` ili `[api] slike: lokalni disk (server/uploads)`.

---

## 📡 API

| Metoda              | Ruta                       | Pristup       | Opis                                             |
| ------------------- | -------------------------- | ------------- | ------------------------------------------------ |
| POST                | `/api/auth/register`       | javno         | registracija kupca                               |
| POST                | `/api/auth/login`          | javno         | prijava kupca                                    |
| POST                | `/api/auth/admin/login`    | javno         | prijava u admin panel                            |
| GET / PUT           | `/api/auth/me`             | prijavljen    | dohvat i izmjena profila                         |
| GET                 | `/api/products`            | javno         | popis (filtri, pretraga, sortiranje, paginacija) |
| GET                 | `/api/products/categories` | javno         | kategorije s brojem proizvoda                    |
| GET                 | `/api/products/:idOrSlug`  | javno         | proizvod + povezani proizvodi                    |
| POST / PUT / DELETE | `/api/products/:id`        | admin         | upravljanje proizvodima                          |
| POST                | `/api/uploads`             | admin         | učitavanje slika (multipart)                     |
| POST                | `/api/orders`              | prijavljen    | stvaranje narudžbe i pokretanje plaćanja         |
| GET                 | `/api/orders/mine`         | prijavljen    | vlastite narudžbe                                |
| GET                 | `/api/orders/:id`          | vlasnik/admin | detalji narudžbe                                 |
| POST                | `/api/orders/:id/confirm`  | vlasnik       | potvrda plaćanja po povratku sa Stripea          |
| GET                 | `/api/orders`              | admin         | sve narudžbe (filtri, pretraga)                  |
| PATCH               | `/api/orders/:id/status`   | admin         | promjena statusa                                 |
| GET                 | `/api/stats`               | admin         | podaci za nadzornu ploču                         |
| POST                | `/api/stripe/webhook`      | Stripe        | potvrda plaćanja                                 |

---

## 🧰 Ostale naredbe

```bash
npm run build       # produkcijski build sve tri aplikacije
npm run typecheck   # TypeScript provjera bez emitiranja
npm run seed        # ponovno puni bazu demo podacima (briše postojeće)
```

### Stranica se nalazi na https://atelier-trgovina.onrender.com/
