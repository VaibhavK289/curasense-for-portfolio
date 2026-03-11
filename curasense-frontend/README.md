# CuraSense Frontend

Next.js 16 frontend for the CuraSense AI-powered healthcare platform.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.0.6 | React framework (App Router + Turbopack) |
| React | 19.2.0 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| Framer Motion | 12.x | Animations and transitions |
| Zustand | 5.x | Global state management |
| Prisma | 7.x | Database ORM (NeonDB PostgreSQL) |
| Radix UI | Latest | Accessible UI primitives |
| Recharts | 3.x | Data visualization |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Access to a NeonDB PostgreSQL instance (or any PostgreSQL)
- Backend services running (see root `README.md`)

### Installation

```bash
npm install
```

### Environment Setup

Create `.env.development` with:

```env
# Database
DATABASE_URL="postgresql://user:pass@host/neondb?sslmode=require"

# Auth
JWT_SECRET="your-64-char-secret"
JWT_REFRESH_SECRET="your-64-char-refresh-secret"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Backend Services (localhost)
BACKEND_API_URL="http://localhost:8000"
BACKEND_VISION_URL="http://localhost:8001"
MEDICINE_API_URL="http://127.0.0.1:8002"
NEXT_PUBLIC_ML_API_URL="http://localhost:8000"
NEXT_PUBLIC_VISION_API_URL="http://localhost:8001"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Database Setup

```bash
npx prisma generate       # Generate Prisma client
npx prisma db push        # Push schema to database
npm run db:seed           # Seed demo accounts (optional)
```

### Run Development Server

```bash
npm run dev
```

Opens at **http://localhost:3000**

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed database with demo accounts |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## Pages

### Public Pages

| Route | Description |
|---|---|
| `/` | Landing page with hero, features, and CTA |
| `/login` | User authentication |
| `/register` | New user registration |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset form |

### Protected Pages

| Route | Description |
|---|---|
| `/diagnosis` | AI diagnosis (text input, PDF upload, X-ray analysis) |
| `/medicine` | Medicine Hub dashboard (search, cabinet, categories, activity) |
| `/medicine/lookup` | Medicine lookup with detailed info cards |
| `/medicine/advisor` | Symptom-based medicine advisor with clickable tags |
| `/medicine/interactions` | Drug-drug interaction checker |
| `/medicine/compare` | Side-by-side medicine comparison |
| `/medicine/scanner` | Medicine image scanner (AI-powered identification) |
| `/reports` | Report history and management |
| `/analytics` | Usage analytics dashboard |
| `/profile` | User profile management |
| `/settings` | Application settings |
| `/history` | Activity history |
| `/help` | Help and documentation |

---

## Architecture

### API Proxy Routes

All backend calls are proxied through Next.js API routes (never direct browser-to-backend):

| API Route | Env Variable | Backend |
|---|---|---|
| `/api/diagnose/text` | `BACKEND_API_URL` | CuraSense ML (:8000) |
| `/api/diagnose/pdf` | `BACKEND_API_URL` | CuraSense ML (:8000) |
| `/api/chat` | `BACKEND_API_URL` | CuraSense ML (:8000) |
| `/api/compare` | `BACKEND_API_URL` | CuraSense ML (:8000) |
| `/api/vision/upload` | `BACKEND_VISION_URL` | ML-FastAPI (:8001) |
| `/api/vision/query` | `BACKEND_VISION_URL` | ML-FastAPI (:8001) |
| `/api/vision/answer` | `BACKEND_VISION_URL` | ML-FastAPI (:8001) |
| `/api/medicine/[name]` | `MEDICINE_API_URL` | Medicine Model (:8002) |
| `/api/medicine/recommend` | `MEDICINE_API_URL` | Medicine Model (:8002) |
| `/api/medicine/interaction` | `MEDICINE_API_URL` | Medicine Model (:8002) |
| `/api/medicine/compare` | `MEDICINE_API_URL` | Medicine Model (:8002) |
| `/api/medicine/analyze-image` | `MEDICINE_API_URL` | Medicine Model (:8002) |

### Authentication

- JWT-based with access tokens (15m) and refresh tokens (7d)
- Middleware protects routes — redirects to `/login` if unauthenticated
- Guest mode available for limited exploration
- `useAuth()` hook provides user state, tokens, and auth methods

### State Management

- **Zustand** — Global state (reports, chat history, sidebar, theme)
- **React Context** — Auth state (user, tokens, login/logout methods)
- **localStorage** — Medicine cabinet, recent searches, activity feed

### Design System

The frontend uses a comprehensive CSS custom property system in `globals.css` (2000+ lines):

- **Brand colors**: Primary (teal 168), Secondary (purple 262), Medicine (green 152)
- **Semantic colors**: Success, Warning, Error, Info
- **Glassmorphism**: `backdrop-blur` + semi-transparent backgrounds
- **Premium components**: SpotlightCard, GlowingBorder, TiltCard, AuroraBackground, FloatingOrb, GridPattern, HeartbeatDivider, AnimatedCounter
- **Animation tokens**: Spring presets (snappy, smooth, bouncy), stagger configs, micro-interactions

---

## Medicine Hub Features

The Medicine Hub is a multi-page experience at `/medicine/*`:

1. **Hub Dashboard** (`/medicine`) — Hero with parallax, bento grid feature cards, smart search autocomplete, medicine cabinet, category quick-access, activity feed, emergency card, batch interaction matrix, health tips
2. **Medicine Lookup** (`/medicine/lookup`) — Search and view detailed medicine info with "Add to Cabinet" action
3. **Symptom Advisor** (`/medicine/advisor`) — Describe symptoms with clickable tags, get AI recommendations
4. **Interaction Checker** (`/medicine/interactions`) — Check drug pairs with "Select from Cabinet" button
5. **Medicine Compare** (`/medicine/compare`) — Side-by-side comparison with cabinet integration
6. **Medicine Scanner** (`/medicine/scanner`) — Upload medicine images for AI identification via Gemini Vision

All pages track activity, support URL query parameters for cross-navigation, and save reports with `saveReport()`.

---

## Production Build

```bash
npm run build    # Creates optimized production build
npm run start    # Serves production build on port 3000
```

The build uses `output: "standalone"` in `next.config.ts` for self-contained deployment.

---

## Related Documentation

- [Root README](../README.md) — Full project overview and setup
- [BACKEND_DOCUMENTATION.md](../BACKEND_DOCUMENTATION.md) — Backend API reference
- [DATABASE_DOCUMENTATION.md](../DATABASE_DOCUMENTATION.md) — Database schema
- [FRONTEND_DOCUMENTATION.md](../FRONTEND_DOCUMENTATION.md) — Detailed frontend architecture
