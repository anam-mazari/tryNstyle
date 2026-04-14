# tryNstyle — project layout

High-level map of the repo (excluding `node_modules`, `.next`, `dist`). **~400+** tracked source files total; rough TS/TSX/Python counts per app below.

## Top-level folders

| Folder | Role | Notes |
|--------|------|--------|
| **`e-store-front-end/`** | **Primary Next.js 16 storefront** | App Router, Redux Toolkit, Tailwind 4. Use this for active dev unless you maintain a duplicate. |
| **`e-store-back-end/`** | **Primary NestJS API** | Products, orders, payments (Stripe), auth, Cloudinary. |
| **`e-store-ai/`** | **FastAPI + TensorFlow** | Face shape, landmarks, skin tone; `best_model.keras`. |
| **`backend/e-store-back-end/`** | Copy of Nest backend | Kept in sync with fixes (e.g. Stripe serializer). Prefer **`e-store-back-end/`** as single source of truth when possible. |
| **`backend (2)/e-store-back-end/`** | Another Nest copy | Same idea — avoid editing three backends long-term; consolidate. |
| **`front-end/e-store-front-end/`** | Alternate Next copy | Slightly different (e.g. `get-api-base-url`, `/api/nest` rewrites). **~96** TS/TSX files vs **~82** in primary `e-store-front-end`. |
| **`frames/`** | Static / asset folder | Small ancillary content. |
| **`URLS.md`** | Local URLs & ports | Service URLs and env hints. |
| **`README.md`** | One-line project blurb | |

## Primary frontend (`e-store-front-end/`)

| Area | Path pattern |
|------|----------------|
| Routes | `app/(customer)/`, `app/(admin)/` |
| Layout / fonts | `app/layout.tsx`, `app/globals.css` |
| Redux | `src/store/` (`store.ts`, `api/*.ts`, `slices/`) |
| Features | `src/features/*` (home, products, cart, admin, auth, orders) |
| UI | `src/components/` (layout, TryOn, FaceDetector, ui) |
| Types | `src/types/`, `src/features/auth/types/` |

## Primary backend (`e-store-back-end/`)

| Area | Path pattern |
|------|----------------|
| Entry | `src/main.ts`, `src/app.module.ts` |
| Features | `src/feature/*` (product, order, payment, user, auth, …) |
| Services | `src/core/services/` |
| Entities / DB | `src/core/db/entities/`, `migrations/` |
| Stripe helpers | `src/core/config/stripe.config.ts`, `src/core/utils/serialize-order-for-api.util.ts` |
| Docker | `Dockerfile`, `docker-compose.yml` (postgres, redis, backend **4000→3000**, ai **8000**) |

## AI service (`e-store-ai/`)

- `main.py` — FastAPI app, loads `best_model.keras`, routes `/detect-face-shape`, `/get-face-landmarks`, `/analyze-skin-tone`.
- `Dockerfile`, `requirements.txt`.

## What to run locally (typical)

- **Storefront:** `e-store-front-end` → `npm run dev` (Turbopack).
- **API:** `e-store-back-end` → Nest on **3000** (or Docker host **4000**).
- **AI:** `e-store-ai` → **8000** or Docker `ai-service`.

## Duplicate trees

You currently have **multiple** copies of the same apps (`backend/`, `backend (2)/`, `front-end/`). Edits do not automatically stay in sync—pick **one** frontend and **one** backend as canonical, or merge/delete duplicates to reduce drift.
