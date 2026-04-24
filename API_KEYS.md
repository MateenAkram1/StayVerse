# Environment variables and free-tier APIs (StayVerse)

This app is designed so you can run it **without paying** and **without adding a card** for the services below. You still need internet for Gemini (if you use it) and for map tiles (OpenStreetMap, free).

---

## 1. Where to put the `.env` file

1. Copy `.envexample` to **`.env`** in the project root: `d:\StayVerse\.env` (next to `package.json`).
2. The **Express** server uses `dotenv` from `index.js` and reads variables when you start the server from the `server` folder, as long as you run the documented npm scripts (which set the working directory correctly). If you run `node index.js` manually, run it from the `server` directory **or** point `DOTENV` to the root `.env`.

**Minimum required for the backend:**

| Variable         | Purpose                                      |
| ---------------- | -------------------------------------------- |
| `MONGODB_URI`    | MongoDB connection string                    |
| `JWT_SECRET`     | Secret for signing session tokens (required) |
| `CLIENT_ORIGIN`  | Vite app URL (default `http://localhost:5173`) |

`GEMINI_API_KEY` is **optional**; if missing, the server falls back to a simple heuristic for “recommended” properties.

**Client (Vite):**

| Variable         | Purpose                                                                 |
| ---------------- | ----------------------------------------------------------------------- |
| `VITE_API_URL`   | Base URL for API calls. **Leave empty in local dev** (proxy in `client/vite.config.ts` forwards to port 5000). Use `https://your-api.example.com/api` in production. |

---

## 2. MongoDB (no credit card)

**Free options:**

- **Local:** Install MongoDB Community and use  
  `mongodb://127.0.0.1:27017/stayverse`
- **Atlas free tier (M0):** Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Many regions allow M0 without a card; the UI may ask for verification depending on account.

Copy the SRV or standard URI into `MONGODB_URI`.

---

## 3. JWT secret (no service)

Generate locally — no third-party key:

```bash
# Linux / macOS / Git Bash
openssl rand -hex 32
```

On Windows (PowerShell):

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | % {[char]$_})
```

Put the result in `JWT_SECRET`. Never commit `.env`.

---

## 4. Google Gemini (AI recommendations) — free tier, no card for AI Studio

Used for: ordering property IDs for `/api/recommendations`.

1. Open **[Google AI Studio](https://aistudio.google.com/apikey)**.
2. Create an API key (log in with a Google account).
3. Set `GEMINI_API_KEY` in `.env` to that key.  
4. The SDK in this project uses `@google/generative-ai` with a model like `gemini-1.5-flash` (overridable via `GEMINI_MODEL`).

**When the key is missing:** the app still works; the server returns a **fallback** ordering based on listing data.

> Always check the latest [Google AI / Gemini](https://ai.google.dev/gemini-api/docs) pricing and quota pages for the current free limits.

---

## 5. Maps — no API key in this build

The proposal mentioned Google Maps. To avoid **billing accounts and map product keys**, StayVerse uses **Leaflet** + **OpenStreetMap** tiles (no key).  
You only use coordinates on each property (`lat` / `lng`).

- Tile policy: [OpenStreetMap copyright](https://www.openstreetmap.org/copyright)
- Nominatim (geocoding) is *not* required for the shipped flows; hosts enter coordinates in the listing form.

If you must use Google Maps later, that is a **separate** Google Cloud project and often involves billing; it is not required for this repo to function.

---

## 6. Payments — demo only (no Payfast keys)

Real **Payfast** (or other gateways) usually require a merchant and production credentials. This project uses a **demo payment** route (`POST /api/payments/demo`) that simulates a successful charge, updates `paymentStatus` to `mock_paid`, and posts **debit / credit** rows for the cashflow view.

**No API keys** are required for payments in this implementation.

---

## 7. Subdomain (class template)

Deploying a real subdomain (e.g. `app.yourdomain.com`) is done in **DNS and hosting** (Vercel, Netlify, Cloudflare, a VPS, etc.), not in this repository. Point `A` or `CNAME` records to your host and set `VITE_API_URL` + `CLIENT_ORIGIN` in production.

---

## 8. First run

1. Install dependencies: from repo root, `npm install` in root, `server`, and `client` (or use workspace if you add it).
2. Start MongoDB locally or use Atlas.
3. Copy `.envexample` → `.env` and set at least `MONGODB_URI` and `JWT_SECRET`.
4. Seed demo data: `npm run seed` from the repo root (runs `node server/src/seed/seed.js` — needs env loaded; ensure `MONGODB_URI` is set. You may set `MONGODB_URI` in a `.env` in the server folder for seed, or run:  
   `set MONGODB_URI=...& node server/src/seed/seed.js` on Windows.
5. `npm run dev` — client on **5173**, API on **5000**.

Demo logins after seed: see terminal output (e.g. `admin@stayverse.app` / `admin123`).
