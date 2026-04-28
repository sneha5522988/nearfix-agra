# NearFix

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](tsconfig.json)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](package.json)

**NearFix** is a hyperlocal services marketplace that connects users with trusted service providers — electricians, plumbers, tutors, beauticians, and more — in their neighbourhood. Built with a modern full-stack TypeScript architecture, NearFix features real-time location-aware discovery, role-based dashboards, a complete booking flow, and an admin panel for platform management.

🌐 **Live:** [[nearfix-agra.onrender.com](https://nearfix-agra.onrender.com/)

---

## Features

### For Customers
- **Location-aware discovery** — GPS and IP-based location detection with reverse geocoding to surface nearby providers
- **Smart search & filters** — Filter by category, availability, rating, price range, and distance; sort by relevance
- **Provider profiles** — Detailed profiles with services, pricing, portfolio, reviews, and real-time availability calendars
- **Booking flow** — End-to-end service selection → scheduling → contact details → payment → confirmation
- **Customer dashboard** — Track upcoming and past bookings, manage saved providers, export or delete account data

### For Providers
- **Provider onboarding** — Guided registration with business details, service area, category, pricing, and consent management
- **Application lifecycle** — Draft → Pending Review → Approved/Rejected workflow with admin review notes
- **Provider dashboard** — Manage incoming job requests, track earnings (weekly/monthly), view schedule, and respond to reviews

### For Admins
- **User management** — View all platform users, assign roles, approve/reject provider applications
- **Metadata controls** — Update roles, toggle dual-role access, add review notes, manage provider statuses
- **Platform overview** — User counts, provider growth metrics, and system health monitoring

### Platform
- **Authentication** — Clerk-powered sign-in/sign-up with session management and role-based access control
- **6-state viewer model** — `visitor → signed_in → customer → provider_draft → provider → admin` for granular UI/API gating
- **Geocoding service** — Server-side Nominatim proxy for reverse and forward geocoding (no browser CORS issues)
- **Cookie consent** — GDPR-compliant analytics consent banner with localStorage persistence
- **Notification centre** — Role-aware notifications with read/unread state, bulk actions, and localStorage sync

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, React Router 7, TanStack Query |
| **UI** | Tailwind CSS, Radix UI, shadcn/ui components, Framer Motion |
| **Backend** | Node.js 22, Express 5, file-based API routing (`vite-plugin-api-routes`) |
| **Database** | PostgreSQL, Drizzle ORM |
| **Auth** | Clerk (React SDK + Backend SDK) |
| **Validation** | Zod (shared schemas across client and server) |
| **Testing** | Vitest, Testing Library, jsdom |
| **Tooling** | ESLint, Prettier, PostCSS, esbuild |

---

## Architecture

```mermaid
flowchart TB
    subgraph Browser ["Client (React SPA)"]
        direction TB
        UI["Pages & Components<br/><i>React 19 + React Router 7</i>"]
        State["State Management<br/><i>TanStack Query · Zustand · localStorage</i>"]
        ClerkSDK["Auth State<br/><i>Clerk React SDK</i>"]
    end

    subgraph Server ["Node.js Server (Express 5)"]
        direction TB
        Static["Static Asset Server<br/><i>Hashed assets with immutable caching</i>"]
        APIRoutes["API Layer (/api/*)<br/><i>File-based routing · 11 endpoints</i>"]
        AuthMiddleware["Auth Middleware<br/><i>JWT verification · Role assertions</i>"]
        GeoProxy["Geocode Proxy<br/><i>Nominatim reverse & forward</i>"]
        ORM["Data Access Layer<br/><i>Drizzle ORM</i>"]
    end

    DB[("PostgreSQL<br/><i>Bookings · Provider Profiles<br/>Reviews · Saved Providers</i>")]
    Clerk["Clerk API<br/><i>Users · Sessions · Metadata</i>"]
    OSM["OpenStreetMap<br/><i>Nominatim Geocoding</i>"]

    UI -- "fetch /api/*<br/><i>+ location headers</i>" --> APIRoutes
    UI -- "Static assets" --> Static
    ClerkSDK <-- "Sessions & tokens" --> Clerk
    APIRoutes --> AuthMiddleware
    AuthMiddleware -- "Verify tokens<br/>Resolve viewer" --> Clerk
    APIRoutes --> ORM
    ORM --> DB
    APIRoutes --> GeoProxy
    GeoProxy --> OSM
    State -.- UI
    ClerkSDK -.- UI
```

### How It Works

**Single-origin monolith** — In production, a single Node.js process serves both the built React SPA and the `/api/*` endpoints on the same origin. No separate API server, no CORS configuration needed.

**File-based API routing** — API endpoints are defined as `src/server/api/**/{GET,POST}.ts` files. The `vite-plugin-api-routes` plugin automatically discovers and mounts them as Express handlers.

**Authentication flow** — The browser obtains a session token from Clerk, attaches it as a Bearer token to API requests, and the server verifies it against Clerk's backend SDK. User roles and permissions are stored in Clerk's metadata and resolved into a typed `Viewer` object on every authenticated request.

**Location pipeline** — The client resolves the user's location through a multi-strategy pipeline (GPS → IP fallback), reverse-geocodes it through the server-side Nominatim proxy, and persists the result to localStorage. Every API call automatically includes location headers for server-side context.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 22
- **PostgreSQL** database ([Neon](https://neon.tech), [Supabase](https://supabase.com), or local)
- **Clerk** account ([clerk.com](https://clerk.com)) — create an application and get your API keys

### Installation

```bash
git clone https://github.com/tarunkauxhik/NearFix.git
cd NearFix
cp env.example .env
```

Edit `.env` and configure the required variables:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Install dependencies and push the database schema:

```bash
npm install
npx drizzle-kit push
```

Start the development server:

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key (exposed to browser) |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key (server-only) |
| `VITE_PUBLIC_URL` | Production | Public URL of the deployed app |
| `ADMIN_EMAILS` | Optional | Comma-separated emails for bootstrap admin access |
| `ADMIN_USERNAMES` | Optional | Comma-separated Clerk usernames for admin access |
| `ADMIN_USER_IDS` | Optional | Comma-separated Clerk user IDs for admin access |
| `NOMINATIM_EMAIL` | Optional | Contact email for Nominatim usage policy |
| `PORT` | Optional | Server port (default: `5173` dev, `3000` prod) |

See [`env.example`](env.example) for the full list with documentation.

---

## Database

The schema is defined in [`src/server/db/schema.ts`](src/server/db/schema.ts) using Drizzle ORM.

**Tables:**

| Table | Purpose |
|---|---|
| `bookings` | Service bookings with scheduling, pricing, and status lifecycle |
| `provider_profiles` | Provider registration data with application review workflow |
| `reviews` | Customer reviews linked to bookings and providers |
| `saved_providers` | Customer-saved provider favourites (unique per user-provider pair) |

**Commands:**

```bash
npx drizzle-kit push        # Apply schema directly to the database
npx drizzle-kit generate    # Generate versioned SQL migrations
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Vite + API routes) |
| `npm run build` | Build production client bundle + server bundle |
| `npm start` | Run production server |
| `npm run preview` | Preview production build locally |
| `npm run type-check` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run test` | Run test suite with Vitest |
| `npm run test:coverage` | Run tests with coverage report |

---

## Deployment

### Standard Deployment

```bash
npm ci
npm run build
npm start
```

Set `PORT` on your host — `npm start` automatically maps it to the internal server port.

### Docker

```bash
docker compose up --build
```

This spins up PostgreSQL and the NearFix app. The app is available at **http://localhost:8080**.

> **Note:** Run `npx drizzle-kit push` against the compose database on first setup to create the schema.

### Production Hosts

NearFix is designed to deploy on any Node.js hosting platform:

- **[Render](https://render.com)** — Set build command to `npm ci && npm run build`, start command to `npm start`
- **[Railway](https://railway.app)** — Auto-detected via `package.json`
- **Docker** — Use the included `Dockerfile` and `docker-compose.yml`

---

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui component library (42 components)
│   │   ├── auth/            # Auth guards (RequireRole, RequireOnboarding)
│   │   ├── admin/           # Admin-specific components
│   │   └── location/        # Location UI (UseMyLocationButton)
│   ├── pages/               # Route page components
│   │   ├── admin/           # Admin dashboard & user management
│   │   ├── auth/            # Sign-in, sign-up, post-auth
│   │   ├── booking/         # Booking flow & confirmation
│   │   ├── dashboard/       # Customer & provider dashboards
│   │   └── provider/        # Provider profile & registration
│   ├── layouts/             # Layout components (Root, Website, Dashboard)
│   ├── lib/                 # Shared client libraries
│   │   ├── access.ts        # Role system, permissions, Zod schemas
│   │   ├── api-client.ts    # Typed API fetch helpers
│   │   ├── nearfix-location-*.ts  # Location resolution pipeline
│   │   └── provider-discovery.ts  # Filter/sort engine
│   ├── data/                # Provider & notification data
│   ├── server/
│   │   ├── api/             # API endpoints (file-based routing)
│   │   │   ├── auth/me/     # GET — Resolve authenticated viewer
│   │   │   ├── user/role/   # POST — Set user role
│   │   │   ├── provider/profile/  # GET/POST — Provider profile CRUD
│   │   │   ├── admin/users/ # GET — List users; POST metadata updates
│   │   │   ├── geocode/     # Reverse & forward geocoding proxy
│   │   │   ├── account/     # Data export & account deletion
│   │   │   └── health/      # Health check
│   │   ├── db/              # Drizzle schema, client, queries
│   │   └── lib/             # Server utilities (Clerk, env, location)
│   ├── styles/              # Global CSS & design tokens
│   └── test/                # Test setup
├── drizzle/                 # Generated SQL migrations
├── scripts/                 # Production entry point
├── public/                  # Static assets
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## Contributing

Contributions are welcome. For bug fixes and minor improvements, feel free to open a PR directly. For larger changes or new features, please open an issue first to discuss the approach.

---

## License

MIT — see [LICENSE](LICENSE).
