# Waste Warrior: API Keys & Environment Variables Migration Guide

This document provides a comprehensive inventory and migration roadmap for all API keys, secrets, and environment variables during the migration from Supabase to the PostgreSQL (Prisma) + Node.js/Express backend architecture.

---

## 1. Master Migration Key Matrix

| Key / Variable | Layer & Target File | Status / Action | Purpose / Usage in Codebase |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Frontend (`.env`) | **Deprecate / Remove** | Supabase Project URL in [`client.ts`](file:///d:/Waste-Warrior/src/integrations/supabase/client.ts) |
| `VITE_SUPABASE_ANON_KEY` | Frontend (`.env`) | **Deprecate / Remove** | Supabase Anon Key in [`client.ts`](file:///d:/Waste-Warrior/src/integrations/supabase/client.ts) |
| `DATABASE_PASSWORD` | Legacy Root (`.env.example`) | **Remove from Client** | Supabase DB Password in [`.env.example`](file:///d:/Waste-Warrior/.env.example) |
| `VITE_MAPBOX_PUBLIC_TOKEN` | Frontend (`.env`) | **Retain / Standardize** | Mapbox GL rendering in [`MapTracking.jsx`](file:///d:/Waste-Warrior/src/components/admin/sections/MapTracking.jsx) |
| `VITE_API_URL` | Frontend (`.env`) | **New (Add)** | Base URL for Express REST API in [`api.js`](file:///d:/Waste-Warrior/src/lib/api.js) (`http://localhost:5000/api`) |
| `DATABASE_URL` | Backend (`backend/.env`) | **New (Add)** | PostgreSQL connection string for Prisma in [`schema.prisma`](file:///d:/Waste-Warrior/backend/prisma/schema.prisma) |
| `JWT_SECRET` | Backend (`backend/.env`) | **New (Add)** | Token signing secret in [`jwt.js`](file:///d:/Waste-Warrior/backend/src/utils/jwt.js) |
| `JWT_EXPIRES_IN` | Backend (`backend/.env`) | **New (Add)** | Expiration timeframe in [`jwt.js`](file:///d:/Waste-Warrior/backend/src/utils/jwt.js) (default: `7d`) |
| `COOKIE_NAME` | Backend (`backend/.env`) | **New (Add)** | HTTP-only cookie name in [`auth.controller.js`](file:///d:/Waste-Warrior/backend/src/controllers/auth.controller.js) |
| `PORT` | Backend (`backend/.env`) | **New (Add)** | Express server port in [`server.js`](file:///d:/Waste-Warrior/backend/src/server.js) (default: `5000`) |
| `NODE_ENV` | Backend (`backend/.env`) | **New (Add)** | Server environment mode (`development` / `production`) |
| `FRONTEND_URL` | Backend (`backend/.env`) | **New (Add)** | CORS allowed origin in [`app.js`](file:///d:/Waste-Warrior/backend/src/app.js) (`http://localhost:5173`) |
| *Cloud Storage Credentials* | Backend (`backend/.env`) | **New (Step 5+)** | Cloudinary or AWS S3 credentials (replacing Supabase Storage `waste-reports`) |

---

## 2. Detailed Breakdown by Category

### A. Legacy Keys to Retire (Supabase Client-Side)
These keys must be completely removed from the frontend client environment once all API interactions are migrated to Express:
* **`VITE_SUPABASE_URL`**: Used by `@supabase/supabase-js` to initialize the client.
* **`VITE_SUPABASE_ANON_KEY`**: Client public JWT key used to communicate with PostgREST.
* **`DATABASE_PASSWORD`**: Found in the legacy root [`.env.example`](file:///d:/Waste-Warrior/.env.example); should never be stored on or exposed to the client.

### B. Frontend Client Keys (New Architecture)
* **`VITE_API_URL`**: Configures the base endpoint for the [`fetchApi`](file:///d:/Waste-Warrior/src/lib/api.js) utility to communicate with the Express backend (e.g. `http://localhost:5000/api`).
* **`VITE_MAPBOX_PUBLIC_TOKEN`**: Public token used by Mapbox GL for interactive map rendering in [`MapTracking.jsx`](file:///d:/Waste-Warrior/src/components/admin/sections/MapTracking.jsx). Centralized in `.env` rather than hardcoded fallbacks.

### C. Backend Core Keys & Secrets (Node/Express + Prisma)
* **`DATABASE_URL`**: Direct connection string to the PostgreSQL instance for Prisma ORM.
  * Format: `postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?schema=public`
* **`JWT_SECRET`**: High-entropy secret key used for signing and verifying JSON Web Tokens (HMAC-SHA256).
* **`JWT_EXPIRES_IN`**: Token lifespan before renewal (e.g., `7d`, `24h`).
* **`COOKIE_NAME`**: Name of the HTTP-only cookie carrying the JWT (e.g., `waste_warrior_token`).
* **`PORT`** & **`NODE_ENV`**: Server port and runtime configuration (`development`, `production`, or `test`).
* **`FRONTEND_URL`**: Whitelisted origin for CORS middleware (e.g., `http://localhost:5173`).

### D. File Storage Keys for Waste Report Uploads (Step 5+)
Supabase Storage bucket `waste-reports` will be handled on the backend via Multer. Depending on the storage strategy chosen:
* **Option 1: Cloudinary**
  * `CLOUDINARY_CLOUD_NAME`
  * `CLOUDINARY_API_KEY`
  * `CLOUDINARY_API_SECRET`
* **Option 2: AWS S3 / Compatible Object Storage**
  * `AWS_ACCESS_KEY_ID`
  * `AWS_SECRET_ACCESS_KEY`
  * `AWS_REGION`
  * `AWS_S3_BUCKET_NAME`
* **Option 3: Local Filesystem**
  * `UPLOAD_PATH=./uploads` (No external API keys required; served statically or streamed through an Express route)

---

## 3. Environment Templates

### Frontend `.env.example` (Root)
```env
# Backend REST API
VITE_API_URL=http://localhost:5000/api

# Mapbox GL Public Token
VITE_MAPBOX_PUBLIC_TOKEN=your_mapbox_public_token_here
```

### Backend `.env.example` (`backend/`)
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# PostgreSQL Database (Prisma)
DATABASE_URL=postgresql://postgres:password@localhost:5432/waste_warrior

# Authentication & Security
JWT_SECRET=replace_with_secure_secret_key
JWT_EXPIRES_IN=7d
COOKIE_NAME=waste_warrior_token

# (Optional) Cloud Storage for waste photos (Step 5+)
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
```
