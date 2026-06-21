# Chronos Moments

> Capturing Timeless Memories, Preserving Every Moment.

A wedding photography & cinematography platform with portfolio, blog, packages, and online booking. This monorepo contains:

- `server/` — Node.js + Express + MongoDB API (JWT auth, roles: `user` / `admin`)
- `client/` — React + Vite + Tailwind frontend (Login, Register, Admin Dashboard)

## 1. Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) — or a MongoDB Atlas URI

## 2. Backend setup

```bash
cd server
copy .env.example .env        # then edit values
npm install
npm run dev                   # http://localhost:5000
```

Create the first admin user:

```bash
npm run seed
# default phone: +8801700000000  password: Admin@12345
```

Health check: <http://localhost:5000/api/health>

## 3. Frontend setup

```bash
cd client
copy .env.example .env        # VITE_API_URL=/api  (default)
npm install
npm run dev                   # http://localhost:5173
```

Vite is configured to proxy `/api/*` to the backend, so cookies & same-origin
just work in development.

## 4. Auth endpoints

| Method | Path                | Body / Notes                                       |
|-------:|---------------------|----------------------------------------------------|
| POST   | `/api/auth/register`| `{ name, phone, email?, password }`                |
| POST   | `/api/auth/login`   | `{ phone, password }` — sets `httpOnly` cookie      |
| POST   | `/api/auth/logout`  | clears cookie                                      |
| GET    | `/api/auth/me`      | requires `Bearer` token or cookie                  |

Phone numbers are normalized to E.164 (e.g. `+8801XXXXXXXXX`).

## 5. Brand tokens

| Token            | Value     |
|------------------|-----------|
| Primary button   | `#D429F3` |
| Background       | `#E6D9E8` |
| Font — body      | Poppins / Plus Jakarta Sans |
| Font — wordmark  | Great Vibes (cursive) |
