# CuraSense - AI-Powered Healthcare Platform

An intelligent healthcare platform that combines AI-driven medical diagnosis, X-ray analysis, medicine intelligence, and a real-time chat assistant into a unified web application.

---

## Architecture Overview

CuraSense is a **4-service microservices architecture** running on localhost:

```
                         http://localhost:3000
                    ┌─────────────────────────────┐
                    │     Next.js 16 Frontend      │
                    │     (App Router + Turbopack)  │
                    └──────────┬──────────────────┘
                               │  API Routes (/api/*)
              ┌────────────────┼──────────────────────┐
              │                │                      │
              v                v                      v
 ┌────────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
 │   CuraSense ML     │ │  ML-FastAPI      │ │   Medicine Model     │
 │   Port 8000        │ │  Vision          │ │   Port 8002          │
 │                    │ │  Port 8001       │ │                      │
 │  - Text Diagnosis  │ │  - X-Ray AI      │ │  - Medicine Lookup   │
 │  - PDF Analysis    │ │  - Medical Image │ │  - Drug Interactions │
 │  - AI Chat         │ │  - RAG Search    │ │  - Medicine Compare  │
 │  - Medicine Compare│ │  - LangGraph     │ │  - Symptom Advisor   │
 │                    │ │    Workflows     │ │  - Medicine Scanner  │
 │  CrewAI + Groq +   │ │  Gemini 2.5 +   │ │  Gemini 2.5 Flash +  │
 │  Gemini + Tavily   │ │  Llama 4 Scout  │ │  Groq + Tavily +     │
 │                    │ │  + ChromaDB     │ │  ChromaDB            │
 └────────────────────┘ └──────────────────┘ └──────────────────────┘
              │                │                      │
              └────────────────┼──────────────────────┘
                               v
                    ┌─────────────────────────────┐
                    │       NeonDB (PostgreSQL)    │
                    │       Serverless Database    │
                    └─────────────────────────────┘
```

---

## Features

### AI Diagnosis Engine
- **Text Diagnosis** - Paste medical reports or symptoms for AI analysis
- **PDF Analysis** - Upload prescription PDFs for automated extraction and diagnosis
- **CrewAI Pipeline** - 6-stage diagnosis: NER extraction, validation, preliminary diagnosis, best practices search, report compilation
- **AI Chat Assistant** - Context-aware medical Q&A powered by Groq LLM

### Medical Imaging
- **X-Ray Analysis** - Upload chest X-rays for dual-model AI analysis (Gemini + Llama)
- **Medical Image Q&A** - Ask follow-up questions about uploaded images
- **Iterative Refinement** - Provide feedback to improve analysis results

### Medicine Hub (Multi-Page Dashboard)
- **Medicine Lookup** - Search any medicine for detailed info (uses, side effects, composition, alternatives)
- **Symptom Advisor** - Describe symptoms to get medicine recommendations with clickable symptom tags
- **Interaction Checker** - Check drug-drug interactions with risk level assessment
- **Medicine Compare** - Side-by-side comparison of two medicines
- **Medicine Scanner** - Upload medicine images (labels, packaging) for AI-powered identification
- **My Medicine Cabinet** - Save medicines you're taking (localStorage) with quick access from any page
- **Smart Search Autocomplete** - Debounced suggestions from common medicines, recent searches, and cabinet
- **Category Quick-Access** - Browse medicines by condition (Pain Relief, Diabetes, Blood Pressure, etc.)
- **Recent Activity Feed** - Track your last 5 medicine-related activities
- **Emergency Medicine Card** - Copy your full medicine list for emergencies
- **Batch Interaction Matrix** - Check all pairwise interactions for your cabinet medicines

### Platform Features
- **JWT Authentication** - Secure login with refresh tokens and guest mode
- **Report Management** - Save, view, and manage all AI-generated reports
- **Analytics Dashboard** - Usage statistics and confidence metrics
- **Dark/Light Theme** - System-aware theme switching
- **Responsive Design** - Desktop sidebar + mobile bottom navigation
- **Accessibility** - Skip navigation, keyboard nav, ARIA labels, focus indicators

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Framer Motion |
| **UI** | Radix UI, Lucide Icons, Recharts, Custom Aceternity components |
| **State** | Zustand (global), React Context (auth), localStorage (medicine cabinet) |
| **Database** | PostgreSQL (NeonDB Serverless) via Prisma 7 ORM |
| **ML Backend** | FastAPI, CrewAI, Groq (Llama 3.3/4), Google Gemini, Tavily Search |
| **Vision Backend** | FastAPI, LangGraph, Gemini 2.5 Flash, Llama 4 Scout, ChromaDB |
| **Medicine Backend** | FastAPI, Gemini 2.5 Flash, Groq, Tavily, ChromaDB, Sentence-Transformers |
| **Auth** | bcrypt (password hashing), JWT (access + refresh tokens) |

---

## Project Structure

```
final_curasense/
├── start_servers.bat              # Launches all 4 services
├── README.md                      # This file
├── PROJECT_ROADMAP.md             # Strategic roadmap
├── BACKEND_DOCUMENTATION.md       # Backend API reference
├── FRONTEND_DOCUMENTATION.md      # Frontend architecture
├── DATABASE_DOCUMENTATION.md      # Database schema & ORM
│
├── curasense-frontend/            # Next.js 16 frontend (port 3000)
│   ├── src/
│   │   ├── app/                   # App Router pages
│   │   │   ├── api/               # API proxy routes
│   │   │   │   ├── auth/          # Authentication endpoints
│   │   │   │   ├── diagnose/      # Diagnosis proxy (text, pdf)
│   │   │   │   ├── chat/          # Chat proxy
│   │   │   │   ├── compare/       # Medicine comparison proxy
│   │   │   │   ├── medicine/      # Medicine hub proxy (5 routes)
│   │   │   │   ├── vision/        # Vision proxy (upload, query, answer)
│   │   │   │   ├── reports/       # Report CRUD
│   │   │   │   └── user/          # User profile
│   │   │   ├── medicine/          # Medicine Hub pages
│   │   │   │   ├── page.tsx       # Hub dashboard
│   │   │   │   ├── lookup/        # Medicine lookup
│   │   │   │   ├── advisor/       # Symptom advisor
│   │   │   │   ├── interactions/  # Interaction checker
│   │   │   │   ├── compare/       # Medicine compare
│   │   │   │   └── scanner/       # Medicine scanner
│   │   │   ├── diagnosis/         # AI diagnosis page
│   │   │   ├── reports/           # Report history
│   │   │   └── analytics/         # Analytics dashboard
│   │   ├── components/
│   │   │   ├── ui/                # UI components (aceternity, premium)
│   │   │   ├── medicine/          # Medicine components
│   │   │   ├── layout/            # Sidebar, Header, MobileNav
│   │   │   └── motion/            # Animation wrappers
│   │   ├── lib/
│   │   │   ├── api.ts             # API client functions
│   │   │   ├── medicine-types.ts  # Medicine TypeScript types
│   │   │   ├── medicine-cabinet.ts# localStorage medicine utilities
│   │   │   ├── auth-context.tsx   # Auth provider
│   │   │   ├── store.ts           # Zustand store
│   │   │   └── prisma.ts          # Database client
│   │   └── styles/tokens/         # Animation tokens
│   ├── prisma/                    # Database schema & migrations
│   └── package.json
│
├── curasense-ml/                  # ML Diagnosis Backend (port 8000)
│   ├── app.py                     # FastAPI entry point
│   ├── flow.py                    # CrewAI diagnosis pipeline
│   ├── src/
│   │   ├── pdf_parser.py          # PDF text extraction
│   │   ├── hugging_face_ner.py    # Medical NER
│   │   └── crew/                  # CrewAI agent definitions
│   ├── frontend/                  # Built-in test dashboard
│   ├── .env                       # API keys
│   └── requirements.txt
│
├── ml-fastapi/                    # Vision/X-ray Backend (port 8001)
│   ├── main.py                    # FastAPI entry point
│   ├── config/
│   │   ├── vision_graph.py        # X-ray LangGraph
│   │   ├── main_graph.py          # Diagnosis LangGraph
│   │   ├── rag.py                 # RAG pipeline
│   │   └── vectordb.py            # ChromaDB operations
│   ├── .env                       # API keys
│   └── requirements.txt
│
└── curasense-database/            # Database package
    ├── prisma/schema.prisma
    └── docs/

E:\medicine_model_curasense/       # Medicine Intelligence Backend (port 8002)
├── app/
│   ├── main.py                    # FastAPI entry point
│   ├── api/routes.py              # All medicine endpoints
│   ├── services/
│   │   ├── medicine_insight.py    # Medicine lookup service
│   │   ├── vision.py              # Gemini Vision extraction
│   │   ├── vision_rag.py          # Vision + RAG chain
│   │   ├── rag_service.py         # RAG with ChromaDB
│   │   ├── retrieval.py           # Web search retrieval
│   │   └── chat_service.py        # Medicine chat
│   ├── schemas/medicine.py        # Pydantic models
│   └── core/config.py             # Settings
├── .env                           # API keys
└── requirements.txt
```

---

## Prerequisites

- **Python 3.10+** with Conda (Miniconda or Anaconda)
- **Node.js 20+** with npm
- **Git**

### Required Conda Environments

| Environment | Purpose | Key Packages |
|---|---|---|
| `curasense_env` | ML diagnosis backend | fastapi, crewai, groq, tavily, transformers |
| `curasense_vision_env` | Vision/X-ray backend | fastapi, langgraph, google-generativeai, chromadb |
| `curasense_medicine_env` | Medicine intelligence | fastapi, sentence-transformers, chromadb, tavily |

### Required API Keys

Each backend has its own `.env` file with these keys:

| Key | Used By | Provider |
|---|---|---|
| `GOOGLE_API_KEY` | curasense-ml, ml-fastapi | [Google AI Studio](https://aistudio.google.com/) |
| `GROQ_API_KEY` | All 3 backends | [Groq Console](https://console.groq.com/) |
| `TAVILY_API_KEY` | curasense-ml, medicine_model | [Tavily](https://tavily.com/) |
| `HF_TOKEN` | ml-fastapi, medicine_model | [HuggingFace](https://huggingface.co/settings/tokens) |
| `GEMINI_API_KEY` | medicine_model | [Google AI Studio](https://aistudio.google.com/) |

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/VaibhavK289/curasense-architecture.git
cd curasense-architecture
```

### 2. Set Up Conda Environments

```bash
# ML Diagnosis Backend
conda create -n curasense_env python=3.10 -y
conda activate curasense_env
pip install -r curasense-ml/requirements.txt

# Vision/X-ray Backend
conda create -n curasense_vision_env python=3.10 -y
conda activate curasense_vision_env
pip install -r ml-fastapi/requirements.txt

# Medicine Intelligence Backend
conda create -n curasense_medicine_env python=3.10 -y
conda activate curasense_medicine_env
pip install -r E:\medicine_model_curasense\requirements.txt
```

### 3. Set Up Environment Variables

Create `.env` files in each backend directory with the required API keys (see Prerequisites above).

Create `curasense-frontend/.env.development`:

```env
DATABASE_URL="postgresql://your_user:your_pass@your_host/neondb?sslmode=require"
JWT_SECRET="your-64-char-jwt-secret"
JWT_REFRESH_SECRET="your-64-char-refresh-secret"
BACKEND_API_URL="http://localhost:8000"
BACKEND_VISION_URL="http://localhost:8001"
MEDICINE_API_URL="http://127.0.0.1:8002"
NEXT_PUBLIC_ML_API_URL="http://localhost:8000"
NEXT_PUBLIC_VISION_API_URL="http://localhost:8001"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Install Frontend Dependencies

```bash
cd curasense-frontend
npm install
```

### 5. Set Up Database

```bash
cd curasense-frontend
npx prisma generate
npx prisma db push
npm run db:seed    # Optional: creates demo accounts
```

### 6. Launch All Services

**Option A: Use the launcher script (Windows)**

```bash
start_servers.bat
```

This opens 4 terminal windows, one per service.

**Option B: Start manually in separate terminals**

```bash
# Terminal 1: ML Diagnosis Backend (port 8000)
cd curasense-ml
conda activate curasense_env
uvicorn app:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: Vision/X-ray Backend (port 8001)
cd ml-fastapi
conda activate curasense_vision_env
uvicorn main:app --reload --host 127.0.0.1 --port 8001

# Terminal 3: Medicine Model (port 8002) — takes 60-120s to start
cd E:\medicine_model_curasense
conda activate curasense_medicine_env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8002

# Terminal 4: Next.js Frontend (port 3000)
cd curasense-frontend
npm run dev
```

### 7. Open the Application

Navigate to **http://localhost:3000** in your browser.

Demo accounts (after running `db:seed`):
- Admin: `admin@curasense.com` / `admin123!`
- Doctor: `doctor@curasense.com` / `doctor123!`
- Patient: `patient@curasense.com` / `patient123!`

---

## Port Assignments

| Service | Port | Conda Env | Entry Point | Directory |
|---|---|---|---|---|
| CuraSense ML | 8000 | `curasense_env` | `uvicorn app:app` | `curasense-ml/` |
| ML-FastAPI Vision | 8001 | `curasense_vision_env` | `uvicorn main:app` | `ml-fastapi/` |
| Medicine Model | 8002 | `curasense_medicine_env` | `uvicorn app.main:app` | `E:\medicine_model_curasense/` |
| Next.js Frontend | 3000 | Node.js (npm) | `npm run dev` | `curasense-frontend/` |

> **Note:** If port 8000 is blocked (ghost socket), use port 8003 and update `BACKEND_API_URL` and `NEXT_PUBLIC_ML_API_URL` in `.env.development`.

---

## API Route Mapping

The Next.js frontend proxies all backend calls through its own API routes:

| Frontend Route | Backend Service | Backend Port |
|---|---|---|
| `/api/diagnose/text` | CuraSense ML | 8000 |
| `/api/diagnose/pdf` | CuraSense ML | 8000 |
| `/api/chat` | CuraSense ML | 8000 |
| `/api/compare` | CuraSense ML | 8000 |
| `/api/vision/upload` | ML-FastAPI Vision | 8001 |
| `/api/vision/query` | ML-FastAPI Vision | 8001 |
| `/api/vision/answer` | ML-FastAPI Vision | 8001 |
| `/api/medicine/[name]` | Medicine Model | 8002 |
| `/api/medicine/recommend` | Medicine Model | 8002 |
| `/api/medicine/interaction` | Medicine Model | 8002 |
| `/api/medicine/compare` | Medicine Model | 8002 |
| `/api/medicine/analyze-image` | Medicine Model | 8002 |

---

## Health Checks

Verify each service is running:

```bash
# CuraSense ML — returns HTML dashboard
curl http://127.0.0.1:8000/

# ML-FastAPI Vision — returns HTML page
curl http://127.0.0.1:8001/

# Medicine Model — returns {"status":"ok"}
curl http://127.0.0.1:8002/health

# Frontend — returns 200 (redirects to /login if not authenticated)
curl -o /dev/null -w "%{http_code}" http://localhost:3000/
```

---

## Frontend Scripts

```bash
npm run dev        # Start development server (port 3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:seed    # Seed database with demo data
npm run db:studio  # Open Prisma Studio GUI
```

---

## Documentation

| Document | Description |
|---|---|
| [FRONTEND_DOCUMENTATION.md](FRONTEND_DOCUMENTATION.md) | Frontend architecture, components, state management |
| [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md) | All 3 backend APIs, pipelines, data flows |
| [DATABASE_DOCUMENTATION.md](DATABASE_DOCUMENTATION.md) | Prisma schema, models, auth flow |
| [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) | Strategic roadmap and AWS migration plan |

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Port 8000 blocked | Use port 8003; update `BACKEND_API_URL` in `.env.development` |
| Medicine model slow to start | Normal — loads sentence-transformers model (~60-120s on first start) |
| `Unable to acquire lock` on `npm run dev` | Delete `curasense-frontend/.next/dev/lock` and kill stale node processes |
| `GROQ_API_KEY not found` | Add key to the `.env` file in the relevant backend directory |
| Database connection error | Verify `DATABASE_URL` in `.env.development` points to a valid NeonDB instance |
| `conda activate` fails in bat file | Run `conda init cmd.exe` once, then restart your terminal |

---

## Authors

- CuraSense Team
- [GitHub Repository](https://github.com/VaibhavK289/curasense-architecture)

## License

MIT
#   c u r a s e n s e _ b e f o r e _ d e p l o y m e n t  
 #   c u r a s e n s e - f o r - p o r t f o l i o  
 