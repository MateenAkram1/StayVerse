# StayVerse

StayVerse is a full-stack **MERN** accommodation booking platform (Airbnb-style) built for semester project requirements, with separate flows for **guests**, **hosts**, and **admin**.

It includes authentication, property CRUD, booking management, recommendations, analytics, notifications, blog, contact page with map, PDF receipts, and demo payments.

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Redux Toolkit, Tailwind CSS, Framer Motion, React Router, Recharts, Leaflet
- **Backend:** Node.js, Express, Mongoose, JWT, bcrypt, Multer, PDFKit
- **Database:** MongoDB
- **AI (optional):** Google Gemini API (`@google/generative-ai`)
- **Maps:** Leaflet + OpenStreetMap tiles (no paid map key required)

## Project Structure

```text
StayVerse/
  client/        # React app (Vite + TS)
  server/        # Express API + MongoDB models
  .envexample
  package.json   # root scripts
```

## Features

- Secure auth (register, login, role-based routes, password update/reset flow)
- Dashboard with sidebar/navbar and responsive UI
- Property listing CRUD with image upload
- Search and filtering (city, price, type, dates)
- Booking lifecycle (request, confirm, cancel)
- Demo payment flow (no real charges)
- Cashflow statements (credit/debit transactions)
- Notification system
- Host analytics and admin platform stats
- Blog system (create/read/update/delete, categories, search)
- Contact form + map location view
- PDF booking receipt generation
- AI-powered recommendations with fallback when no Gemini key

## Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB (local or Atlas free tier)

## Environment Setup

1. Copy `.envexample` to `.env` in project root.
2. Fill at least:
   - `MONGODB_URI`
   - `JWT_SECRET`
3. Optional:
   - `GEMINI_API_KEY` for AI ranking
   - `VITE_API_URL` for production frontend API base

See `API_KEYS.md` for where to get keys and free-tier guidance.

## Installation

From root:

```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

## Running the Project

### 1) Seed demo data (optional but recommended)

```bash
npm run seed
```

This creates demo users/listings/blog post for quick testing.

### 2) Start both frontend and backend (development)

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Root Scripts

- `npm run dev` - Run client + server concurrently
- `npm run build` - Build frontend
- `npm run start` - Start backend
- `npm run seed` - Seed database

## API Overview

Base URL: `/api`

- Auth: `/auth/*`
- Users: `/users/*`
- Properties: `/properties/*`
- Bookings: `/bookings/*`
- Payments: `/payments/demo`
- Cashflow: `/cashflow`
- Notifications: `/notifications/*`
- Blog: `/blog/*`
- Analytics: `/analytics/*`
- Contact: `/contact`
- Health: `/health`

## Notes

- Demo payments are intentionally simulated for zero-cost project usage.
- Maps use OpenStreetMap tiles via Leaflet.
- If `GEMINI_API_KEY` is missing, recommendation API still works with fallback ranking.

## Troubleshooting

- **Mongo connection error:** verify `MONGODB_URI` and that MongoDB is running.
- **401 / auth issues:** verify token flow and `JWT_SECRET`.
- **Image upload not showing:** ensure backend is running and `/uploads` static route is accessible.
- **No recommendations:** configure `GEMINI_API_KEY` or use fallback behavior.

## License

Academic project / coursework use.

