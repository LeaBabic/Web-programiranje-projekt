# ATELIER — web trgovina odjeće

Projekt iz kolegija Web programiranje. Monorepo sa zajedničkim backendom i React
aplikacijom za kupce.

| Dio | Tehnologije | Adresa (dev) |
| --- | --- | --- |
| `server/` | Express.js, TypeScript, MongoDB (Mongoose), JWT | http://localhost:4000 |
| `client/` | Vite, React, TypeScript, Tailwind CSS v4, Zustand | http://localhost:5173 |

Trenutno stanje: registracija, prijava i odjava korisnika. Katalog proizvoda,
košarica i naplata dolaze u sljedećim koracima.

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
npm run dev                          # pokreće API i klijent odjednom
```

Zatim otvorite **http://localhost:5173** — vidjet ćete početnu stranicu s gumbima
za registraciju i prijavu. Nakon registracije zaglavlje prikazuje vaše ime i gumb
za odjavu.

Pojedinačno: `npm run dev:server`, `npm run dev:client`.

Ako klijent radi na drugoj adresi ili API na drugom portu, kopirajte
`client/.env.example` u `client/.env` i podesite `VITE_API_URL`.

## API

| Metoda | Ruta | Pristup | Opis |
| --- | --- | --- | --- |
| GET | `/api/health` | javno | provjera rada poslužitelja |
| POST | `/api/auth/register` | javno | registracija kupca |
| POST | `/api/auth/login` | javno | prijava kupca |
| POST | `/api/auth/admin/login` | javno | prijava u admin panel (uloga `admin`) |
| GET | `/api/auth/me` | prijavljen | podaci o prijavljenom korisniku |
| PUT | `/api/auth/me` | prijavljen | izmjena profila |

Lozinke se spremaju hashirane (bcrypt), a prijava vraća JWT token koji klijent
čuva u `localStorage` i šalje u zaglavlju `Authorization: Bearer <token>`.

```bash
# registracija bez sučelja
curl -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana Anić","email":"ana@primjer.hr","password":"korisnik123"}'
```
