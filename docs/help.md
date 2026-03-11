# 🎯 Medicine Hub — Complete Help & Support Documentation

> **Aesthetic. Deep. Comprehensive.**  
> Your single source of truth for deploying, operating, and scaling the Medicine Hub application.

---

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Version](https://img.shields.io/badge/version-1.0.0-green.svg) ![Status](https://img.shields.io/badge/status-Active-success.svg)

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Quick Start Tutorials](#quick-start-tutorials)
4. [Deep Dive Tutorials](#deep-dive-tutorials)
5. [Troubleshooting Guides](#troubleshooting-guides)
6. [API Reference](#api-reference)
7. [Environment Variables](#environment-variables)
8. [Security & Compliance](#security--compliance)
9. [Monitoring & Logging](#monitoring--logging)
10. [Performance Optimization](#performance-optimization)
11. [FAQ - Frequently Asked Questions](#faq---frequently-asked-questions)
12. [Glossary](#glossary)
13. [Contributing](#contributing)
14. [Support Channels](#support-channels)

---

## 1. Introduction

### 1.1 What is Medicine Hub?

Medicine Hub is a comprehensive healthcare platform that combines AI-powered diagnosis, medicine analysis, and prescription interpretation. The system consists of four main services:

| Service | Description | Port |
|---------|-------------|------|
| **Frontend** | Next.js UI for user interactions | 3000 |
| **ML API** | CrewAI-powered diagnosis engine | 8000 |
| **Vision API** | Image analysis & OCR capabilities | 8001 |
| **Medicine API** | Medicine database & interaction checker | 8002 |

### 1.2 Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Next.js 14 (App Router)  •  React 18  •  TypeScript   │   │
│  │  Tailwind CSS  •  Prisma ORM  •  NextAuth.js          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐     │
│  │  ML API      │  │  Vision API  │  │  Medicine API    │     │
│  │  (FastAPI)   │  │  (FastAPI)   │  │  (FastAPI)       │     │
│  │  CrewAI      │  │  Gemini AI   │  │  Sentence-Trans. │     │
│  │  PyTorch     │  │  Groq        │  │  ChromaDB        │     │
│  └──────────────┘  └──────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  NeonDB (PostgreSQL)  •  ChromaDB (Vector Store)       │   │
│  │  HuggingFace Models  •  Google Gemini API              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Key Features

- 🤖 **AI-Powered Diagnosis** — Text and PDF-based medical diagnosis using CrewAI
- 📸 **Vision Analysis** — Image-based medicine recognition and prescription OCR
- 💊 **Medicine Database** — Comprehensive medicine information, interactions, and recommendations
- 🔒 **Secure** — Environment-based secrets, no hardcoded credentials
- 🚀 **Production-Ready** — Dockerized, health-checked, monitoring-ready

---

## 2. Architecture Overview

### 2.1 System Architecture

```
                           ┌─────────────────────┐
                           │     Internet        │
                           └──────────┬──────────┘
                                      │
                           ┌──────────▼──────────┐
                           │   EC2 t3.xlarge    │
                           │   (AWS us-east-1)  │
                           └──────────┬──────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
           ┌────────▼────────┐ ┌──────▼──────┐ ┌───────▼───────┐
           │  Frontend       │ │  ML API     │ │  Vision API   │
           │  (Next.js)      │ │  (FastAPI)  │ │  (FastAPI)     │
           │  Port: 3000     │ │  Port: 8000 │ │  Port: 8001   │
           └────────┬────────┘ └──────┬───────┘ └───────┬───────┘
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      │
                           ┌──────────▼──────────┐
                           │  Medicine API      │
                           │  (FastAPI)          │
                           │  Port: 8002        │
                           └──────────┬──────────┘
                                      │
                           ┌──────────▼──────────┐
                           │   NeonDB PostgreSQL │
                           │   (Cloud Managed)   │
                           └─────────────────────┘
```

### 2.2 Data Flow

```
USER ACTION
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  1. User submits diagnosis request                            │
│  2. API Route validates input                                 │
│  3. Proxies to appropriate backend service                   │
└──────────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND SERVICES                            │
│  • ML API: Processes text/PDF with CrewAI + Medical-NER     │
│  • Vision API: Analyzes images with Gemini + Groq           │
│  • Medicine API: Queries medicine DB + ChromaDB             │
└──────────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│                    EXTERNAL APIs                             │
│  • Google Gemini AI: Advanced reasoning & vision            │
│  • Groq: Fast LLM inference                                 │
│  • HuggingFace: Medical NER models                          │
│  • NeonDB: Persistent data storage                          │
└──────────────────────────────────────────────────────────────┘
     │
     ▼
RESPONSE BACK TO USER
```

### 2.3 Service Dependencies

```
┌─────────────────┐
│   Frontend     │──────┐
│   (Port 3000)  │      │
└─────────────────┘      │ depends on
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   ML API      │ │  Vision API   │ │ Medicine API  │
│  (Port 8000)  │ │  (Port 8001)  │ │  (Port 8002)  │
│   /health     │ │    /ping      │ │    /health    │
└───────────────┘ └───────────────┘ └───────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │     NeonDB          │
              │   (PostgreSQL)     │
              └─────────────────────┘
```

---

## 3. Quick Start Tutorials

### Tutorial 1: First-Time Deployment on AWS EC2

> **Estimated Time:** 30-45 minutes  
> **Difficulty:** Beginner  
> **Prerequisites:** AWS Account, SSH Client

#### Step 1: Launch EC2 Instance

1. Navigate to AWS Console → EC2 → Instances
2. Click **Launch Instance**
3. Configure:
   - **Name:** `curasense-prod`
   - **AMI:** Amazon Linux 2023 (HVM)
   - **Instance Type:** `t3.xlarge`
   - **Key Pair:** Create or select `curasense-key`
   - **Storage:** 30 GB gp3

#### Step 2: Configure Security Group

| Port | Protocol | Source | Description |
|------|----------|--------|-------------|
| 22 | TCP | Your IP | SSH Access |
| 3000 | TCP | 0.0.0.0/0 | Frontend |

#### Step 3: Connect to Instance

```bash
ssh -i "path/to/curasense-key.pem" ec2-user@<your-ec2-public-ip>
```

#### Step 4: Install Dependencies

```bash
# Update system
sudo dnf update -y

# Install Docker
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Step 5: Clone Repository

```bash
cd /home/ec2-user
git clone https://github.com/VaibhavK289/curasense-architecture.git
cd curasense-architecture
```

#### Step 6: Configure Environment

```bash
cp .env.example .env
nano .env  # Add your API keys
```

Required environment variables:
```bash
# API Keys
GOOGLE_API_KEY=your_google_api_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
HF_TOKEN=your_huggingface_token

# Database
DATABASE_URL=your_neondb_connection_string

# Secrets
JWT_SECRET=your_jwt_secret
CRON_SECRET=your_cron_secret
```

#### Step 7: Start Services

```bash
docker-compose up -d
```

#### Step 8: Verify Deployment

```bash
# Check container status
docker-compose ps

# Test health endpoints
curl -sS http://localhost:3000
curl -sS http://localhost:8000/health
curl -sS http://localhost:8001/ping
curl -sS http://localhost:8002/health
```

**🎉 Congratulations!** Your Medicine Hub is now live at `http://<your-ec2-public-ip>:3000`

---

### Tutorial 2: Stopping and Starting the Application

> **Estimated Time:** 5 minutes  
> **Difficulty:** Beginner

#### Option A: Stop Containers Only (Instance Keeps Running)

```bash
cd /home/ec2-user/curasense-architecture
docker-compose stop
```

**Use when:**
- Taking a short break (few hours)
- You want quick restart without waiting for EC2 boot

#### Option B: Stop and Restart Containers

```bash
cd /home/ec2-user/curasense-architecture

# Stop all services
docker-compose down

# Restart all services
docker-compose up -d
```

**Use when:**
- Applying code updates
- Troubleshooting issues

#### Option C: Stop EC2 Instance (Saves Costs)

```bash
# From your LOCAL machine
aws ec2 stop-instances --instance-ids <your-instance-id> --region us-east-1
```

**⚠️ Important:**
- EC2 will stop billing for compute, but EBS storage still costs ~$3/month
- Public IP may change on restart

#### Option D: Restart EC2 Instance

```bash
# From your LOCAL machine
aws ec2 start-instances --instance-ids <your-instance-id> --region us-east-1

# SSH back in after instance starts
ssh -i "path/to/curasense-key.pem" ec2-user@<new-public-ip>

# Restart containers
cd /home/ec2-user/curasense-architecture
docker-compose up -d
```

---

### Tutorial 3: Accessing Logs

> **Estimated Time:** 2 minutes  
> **Difficulty:** Beginner

#### View All Logs

```bash
docker-compose logs
```

#### View Logs for Specific Service

```bash
# Frontend logs
docker-compose logs frontend

# ML API logs
docker-compose logs ml-api

# Vision API logs
docker-compose logs vision-api

# Medicine API logs
docker-compose logs medicine-api
```

#### Real-Time Log Streaming

```bash
# All services
docker-compose logs -f

# Specific service with follow
docker-compose logs -f frontend
```

#### Limit Log Lines

```bash
# Last 100 lines
docker-compose logs --tail 100

# Last 50 lines of specific service
docker-compose logs --tail 50 ml-api
```

#### Save Logs to File

```bash
docker-compose logs > app-logs.txt
```

---

### Tutorial 4: Checking Service Health

> **Estimated Time:** 1 minute  
> **Difficulty:** Beginner

#### Method 1: Docker Compose PS

```bash
docker-compose ps
```

Expected output:
```
NAME                    IMAGE                          STATUS                   PORTS
curasense-frontend      curasense-frontend:latest     Up (healthy)   0.0.0.0:3000->3000/tcp
curasense-ml-api        curasense-ml-api:latest        Up (healthy)   0.0.0.0:8000->8000/tcp
curasense-vision-api    curasense-vision-api:latest   Up (healthy)   0.0.0.0:8001->8001/tcp
curasense-medicine-api  curasense-medicine-api:latest  Up (healthy)   0.0.0.0:8002->8002/tcp
```

#### Method 2: Health Check Endpoints

```bash
# Test all services
curl -sS http://localhost:8000/health   # ML API
curl -sS http://localhost:8001/ping      # Vision API
curl -sS http://localhost:8002/health   # Medicine API
```

#### Method 3: Docker Inspect

```bash
docker inspect curasense-frontend --format='{{.State.Health.Status}}'
docker inspect curasense-ml-api --format='{{.State.Health.Status}}'
docker inspect curasense-vision-api --format='{{.State.Health.Status}}'
docker inspect curasense-medicine-api --format='{{.State.Health.Status}}'
```

---

## 4. Deep Dive Tutorials

### Tutorial 5: Understanding the Frontend Architecture

> **Estimated Time:** 20 minutes  
> **Difficulty:** Intermediate

#### 4.1 Project Structure

```
curasense-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes (Proxies)
│   │   │   ├── diagnose/      # Diagnosis endpoints
│   │   │   ├── medicine/      # Medicine endpoints
│   │   │   └── ...
│   │   ├── page.tsx           # Main landing page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React Components
│   │   ├── ui/               # Reusable UI components
│   │   └── ...               # Feature-specific components
│   ├── lib/                  # Utilities & Helpers
│   │   ├── api.ts            # API client functions
│   │   ├── prisma.ts         # Prisma client (lazy)
│   │   └── ...
│   └── types/                # TypeScript definitions
├── public/                   # Static assets
├── prisma/                   # Database schema
├── Dockerfile               # Container definition
└── next.config.ts           # Next.js configuration
```

#### 4.2 Key Files Explained

##### `src/lib/api.ts` — API Client

This file contains all the API client functions that interface with the backend services:

```typescript
// Key functions in api.ts

// Extract markdown from backend response
export function extractMarkdownFromReport(report: any): string {
  // Handles various response formats
  // Returns clean markdown string
}

// Diagnosis functions
export async function diagnoseText(symptoms: string): Promise<DiagnosisResult>
export async function diagnosePDF(file: File): Promise<DiagnosisResult>

// Medicine functions
export async function getMedicine(name: string): Promise<MedicineData>
export async function recommendMedicines(symptoms: string): Promise<Medicine[]>
export async function checkInteractions(medicines: string[]): Promise<Interaction[]>
```

##### `src/lib/prisma.ts` — Lazy Prisma Client

The Prisma client is lazily initialized to prevent startup failures when DATABASE_URL is missing:

```typescript
// Lazy Prisma initialization pattern
const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!prismaInstance) {
      prismaInstance = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        }
      });
    }
    return prismaInstance[prop as keyof PrismaClient];
  }
});

export { prisma };
```

##### API Routes (Proxies)

All backend communication goes through Next.js API routes:

| Route | Backend Service | Purpose |
|-------|-----------------|---------|
| `/api/diagnose/text` | ML API (8000) | Text-based diagnosis |
| `/api/diagnose/pdf` | ML API (8000) | PDF upload & diagnosis |
| `/api/diagnose/analyze-image` | Vision API (8001) | Image analysis |
| `/api/medicine/[name]` | Medicine API (8002) | Medicine lookup |
| `/api/medicine/recommend` | Medicine API (8002) | Recommendations |
| `/api/medicine/interaction` | Medicine API (8002) | Interaction check |

#### 4.3 Frontend-to-Backend Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  src/app/api/diagnose/text/route.ts                        │
│  - Validates request body                                  │
│  - Sets timeout (300s for ML processing)                  │
│  - Proxies to http://ml-api:8000/diagnose/text            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend Response Processing                               │
│  - Receives JSON from backend                             │
│  - Calls extractMarkdownFromReport()                      │
│  - Returns formatted response to UI                       │
└─────────────────────────────────────────────────────────────┘
```

---

### Tutorial 6: Backend Services Deep Dive

> **Estimated Time:** 30 minutes  
> **Difficulty:** Advanced

#### 4.1 ML API (Port 8000)

**Purpose:** AI-powered medical diagnosis using CrewAI

**Key Components:**
- **CrewAI Framework:** Multi-agent AI system for diagnosis
- **Medical-NER Model:** HuggingFace model for entity extraction
- **PyTorch:** CPU-based inference

**Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/diagnose/text` | POST | Text-based diagnosis |
| `/diagnose/pdf` | POST | PDF-based diagnosis |

**Request Example:**
```bash
curl -X POST http://localhost:8000/diagnose/text \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "headache, fever, fatigue"}'
```

**Response Example:**
```json
{
  "status": "ok",
  "report": {
    "diagnosis": "Common Flu",
    "recommendations": ["Rest", "Hydration", "Consult doctor if symptoms persist"],
    "markdown": "# Diagnosis Report\n\n## Symptoms\n- Headache\n- Fever\n- Fatigue\n\n## Diagnosis\nCommon Flu"
  }
}
```

#### 4.2 Vision API (Port 8001)

**Purpose:** Image analysis, OCR, and vision-based medicine recognition

**Key Components:**
- **Google Gemini:** Vision AI for image understanding
- **Groq:** Fast LLM inference
- **ChromaDB:** Vector storage for embeddings

**Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ping` | GET | Health check |
| `/analyze` | POST | Analyze image |
| `/ocr` | POST | Extract text from image |

**Request Example:**
```bash
curl -X POST http://localhost:8001/analyze \
  -F "image=@medicine.jpg"
```

#### 4.3 Medicine API (Port 8002)

**Purpose:** Medicine database, recommendations, and interaction checking

**Key Components:**
- **Sentence Transformers:** Medical similarity matching
- **ChromaDB:** Medicine embeddings storage
- **PyTorch:** CPU-based embeddings

**Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/medicine/{name}` | GET | Get medicine info |
| `/recommend` | POST | Recommend medicines |
| `/interaction` | POST | Check interactions |
| `/compare` | POST | Compare medicines |

---

### Tutorial 7: Docker & Container Management

> **Estimated Time:** 25 minutes  
> **Difficulty:** Intermediate

#### 5.1 Understanding docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: ./curasense-frontend
    container_name: curasense-frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      ml-api:
        condition: service_healthy
      vision-api:
        condition: service_healthy
      medicine-api:
        condition: service_healthy

  ml-api:
    build: ./curasense-ml
    container_name: curasense-ml-api
    ports:
      - "8000:8000"
    environment:
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - TAVILY_API_KEY=${TAVILY_API_KEY}
      - HF_TOKEN=${HF_TOKEN}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ... other services
```

#### 5.2 Rebuilding Containers

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build
```

#### 5.3 Scaling Services

```bash
# Scale ML API to 2 instances (requires load balancer)
docker-compose up -d --scale ml-api=2
```

#### 5.4 Container Resource Management

```bash
# View resource usage
docker stats

# View specific container stats
docker stats curasense-frontend

# Set memory limits in docker-compose.yml
services:
  frontend:
    mem_limit: 1g
    mem_reservation: 512m
    cpus: 1.0
```

---

### Tutorial 8: Environment Configuration

> **Estimated Time:** 15 minutes  
> **Difficulty:** Beginner

#### Required Environment Variables

| Variable | Service | Description | Required |
|----------|---------|-------------|----------|
| `GOOGLE_API_KEY` | ML API | Google AI API key | Yes |
| `GEMINI_API_KEY` | Medicine API | Gemini API key | Yes |
| `GROQ_API_KEY` | All APIs | Groq API key | Yes |
| `TAVILY_API_KEY` | ML API | Tavily search API | Yes |
| `HF_TOKEN` | ML/Vision API | HuggingFace token | Yes |
| `GOOGLE_CREDENTIALS_BASE64` | Vision API | GCP service account (base64) | Optional |
| `DATABASE_URL` | Frontend | NeonDB connection string | Yes |
| `JWT_SECRET` | Frontend | JWT signing secret | Yes |
| `CRON_SECRET` | Frontend | Cron job secret | Yes |

#### Getting API Keys

1. **Google AI Studio:** https://aistudio.google.com/app/apikey
2. **Groq Console:** https://console.groq.com/keys
3. **Tavily AI:** https://tavily.com/api/
4. **HuggingFace:** https://huggingface.co/settings/tokens
5. **NeonDB:** https://neon.tech/

#### .env File Example

```bash
# AI API Keys
GOOGLE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database
DATABASE_URL=postgres://user:password@ep-xxx.us-east-1.neon.tech/curasense?sslmode=require

# Secrets
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CRON_SECRET=your-cron-secret-key

# Optional
GOOGLE_CREDENTIALS_BASE64=eyJxxxxxxxxxxxx
```

---

## 5. Troubleshooting Guides

### Issue 1: Frontend Not Loading

#### Symptoms
- Browser shows "Connection Refused"
- Page doesn't load
- Timeout errors

#### Diagnosis Steps

```bash
# Step 1: Check if container is running
docker-compose ps

# Step 2: Check container logs
docker-compose logs frontend

# Step 3: Verify port is exposed
docker port curasense-frontend

# Step 4: Test locally from EC2
curl -sS http://localhost:3000
```

#### Solutions

**Solution A: Container not running**
```bash
docker-compose up -d frontend
```

**Solution B: Port conflict**
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process or change port in docker-compose.yml
```

**Solution C: Restart frontend**
```bash
docker-compose restart frontend
```

---

### Issue 2: Backend API Timeouts

#### Symptoms
- Diagnosis requests hang
- Loading indicators never complete
- 504 Gateway Timeout errors

#### Diagnosis Steps

```bash
# Step 1: Check backend health
curl -sS http://localhost:8000/health
curl -sS http://localhost:8001/ping
curl -sS http://localhost:8002/health

# Step 2: Check backend logs
docker-compose logs ml-api

# Step 3: Check resource usage
docker stats
```

#### Solutions

**Solution A: ML API processing takes too long**
- Default timeout is 300 seconds
- Check if Medical-NER model is downloading
- First request is always slower (model loading)

**Solution B: Container out of memory**
```bash
# Increase memory in docker-compose.yml
services:
  ml-api:
    mem_limit: 4g
```

**Solution C: Restart backend services**
```bash
docker-compose restart ml-api vision-api medicine-api
```

---

### Issue 3: Database Connection Failures

#### Symptoms
- "Connection refused" errors
- Prisma initialization failures
- Slow query responses

#### Diagnosis Steps

```bash
# Step 1: Test database connectivity
docker-compose exec frontend sh -c 'nc -zv $DATABASE_URL_HOST $DATABASE_URL_PORT'

# Step 2: Check DATABASE_URL format
echo $DATABASE_URL

# Step 3: Test from container
docker-compose exec frontend sh -c 'curl -sS $DATABASE_URL'
```

#### Solutions

**Solution A: NeonDB suspended**
- NeonDB auto-suspends after 5 minutes of inactivity
- First request may fail, retry after a few seconds

**Solution B: Invalid connection string**
```bash
# Verify DATABASE_URL format
# Should be: postgres://user:password@host/neon?sslmode=require
```

**Solution C: Firewall issues**
- Ensure NeonDB IP whitelist includes your EC2 IP

---

### Issue 4: API Key Errors

#### Symptoms
- "Invalid API key" messages
- 401 Unauthorized errors
- AI responses failing

#### Diagnosis Steps

```bash
# Step 1: Check environment variables
docker-compose exec ml-api env | grep API

# Step 2: Verify keys are not empty
docker-compose exec ml-api sh -c 'echo $GOOGLE_API_KEY'
```

#### Solutions

**Solution A: Missing API key**
- Add key to `.env` file
- Restart containers: `docker-compose down && docker-compose up -d`

**Solution B: Invalid API key**
- Regenerate key from provider
- Update `.env` file
- Restart containers

---

### Issue 5: High Memory Usage

#### Symptoms
- Container restarts
- OOM (Out of Memory) errors
- Slow response times

#### Diagnosis Steps

```bash
# Step 1: Check container stats
docker stats

# Step 2: Check memory usage per container
docker inspect curasense-ml-api --format='{{.MemoryStats}}'
```

#### Solutions

**Solution A: Limit container memory**
```yaml
services:
  ml-api:
    mem_limit: 4g
    mem_reservation: 2g
```

**Solution B: Restart container to free memory**
```bash
docker-compose restart ml-api
```

**Solution C: Upgrade EC2 instance**
- Current: t3.xlarge (16GB RAM)
- Consider: r3.xlarge (memory-optimized)

---

## 6. API Reference

### Frontend API Routes

#### Diagnosis Endpoints

##### POST /api/diagnose/text
Text-based medical diagnosis

**Request:**
```typescript
{
  symptoms: string;      // Comma-separated symptoms
  medicalHistory?: string; // Optional medical history
}
```

**Response:**
```typescript
{
  status: "ok" | "error";
  report: {
    diagnosis: string;
    recommendations: string[];
    markdown: string;
  };
}
```

##### POST /api/diagnose/pdf
PDF-based medical diagnosis

**Request:**
```typescript
FormData:
  file: File;  // PDF file
```

**Response:**
```typescript
{
  status: "ok" | "error";
  report: {
    diagnosis: string;
    recommendations: string[];
    markdown: string;
  };
}
```

##### POST /api/diagnose/analyze-image
Analyze medicine/image

**Request:**
```typescript
FormData:
  image: File;  // Image file
```

**Response:**
```typescript
{
  status: "ok" | "error";
  analysis: {
    medicines: string[];
    dosage: string;
    instructions: string;
  };
}
```

#### Medicine Endpoints

##### GET /api/medicine/[name]
Get medicine information

**Response:**
```typescript
{
  name: string;
  genericName: string;
  manufacturer: string;
  dosage: string;
  sideEffects: string[];
  interactions: string[];
}
```

##### POST /api/medicine/recommend
Recommend medicines

**Request:**
```typescript
{
  symptoms: string;
  conditions?: string[];
}
```

##### POST /api/medicine/interaction
Check drug interactions

**Request:**
```typescript
{
  medicines: string[];
}
```

---

## 7. Environment Variables Reference

| Variable | Service | Type | Required | Description |
|----------|---------|------|----------|-------------|
| `NODE_ENV` | Frontend | string | Yes | production/development |
| `PORT` | All | number | No | Override default port |
| `DATABASE_URL` | Frontend | string | Yes | NeonDB connection |
| `JWT_SECRET` | Frontend | string | Yes | JWT signing key |
| `CRON_SECRET` | Frontend | string | Yes | Cron job auth |
| `GOOGLE_API_KEY` | ML API | string | Yes | Google AI access |
| `GEMINI_API_KEY` | Medicine API | string | Yes | Gemini access |
| `GROQ_API_KEY` | All APIs | string | Yes | Groq LLM access |
| `TAVILY_API_KEY` | ML API | string | Yes | Web search |
| `HF_TOKEN` | ML/Vision | string | Yes | HuggingFace access |
| `GOOGLE_CREDENTIALS_BASE64` | Vision API | string | No | GCP service account |

---

## 8. Security & Compliance

### 8.1 Security Best Practices

✅ **Do:**
- Store secrets in environment variables
- Use strong JWT_SECRET (minimum 32 characters)
- Enable HTTPS in production
- Regularly rotate API keys
- Restrict SSH access to your IP

❌ **Don't:**
- Commit secrets to Git
- Use default passwords
- Expose sensitive ports to 0.0.0.0/0
- Run containers as root (unless necessary)

### 8.2 Network Security

```bash
# Recommended security group rules
- Port 22:    Your IP Only (SSH)
- Port 3000:  0.0.0.0/0 (Frontend)
- Port 8000:  Your IP Only (Admin)
- Port 8001:  Your IP Only (Admin)
- Port 8002:  Your IP Only (Admin)
```

### 8.3 Data Privacy

- No PHI (Protected Health Information) stored locally
- All AI processing happens via secure API calls
- NeonDB connection uses SSL/TLS
- API keys never exposed to client-side

---

## 9. Monitoring & Logging

### 9.1 Built-in Health Checks

Each service exposes a health endpoint:

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| Frontend | `/` | HTML response |
| ML API | `/health` | `{"status": "ok"}` |
| Vision API | `/ping` | `PONG` |
| Medicine API | `/health` | `{"status": "ok"}` |

### 9.2 Log Aggregation

```bash
# View all logs
docker-compose logs

# Filter logs by keyword
docker-compose logs | grep ERROR

# Export logs for analysis
docker-compose logs > logs-$(date +%Y%m%d).txt
```

### 9.3 Resource Monitoring

```bash
# Real-time stats
docker stats

# Detailed container info
docker inspect curasense-frontend

# Container processes
docker top curasense-frontend
```

---

## 10. Performance Optimization

### 10.1 Frontend Performance

- **Static Generation:** Use ISR for static pages
- **Image Optimization:** Use next/image
- **API Caching:** Implement caching for frequent queries
- **CDN:** Consider CloudFront for static assets

### 10.2 Backend Performance

- **Model Caching:** Models load once, stay in memory
- **Connection Pooling:** Prisma handles this automatically
- **Async Processing:** Use queues for heavy tasks

### 10.3 Infrastructure

- **EC2 Size:** t3.xlarge (4 vCPU, 16 GB) is sufficient
- **Storage:** 30 GB gp3 (sufficient for images/logs)
- **Docker:** Use build cache for faster rebuilds

---

## 11. FAQ - Frequently Asked Questions

### Q1: How much does it cost to run?

**Answer:**
- EC2 t3.xlarge: ~$150/month (on-demand)
- EBS 30GB: ~$3/month
- NeonDB: Free tier (0.5GB)
- **Total: ~$153/month** (or ~₹2,000/month with spot/premium)

### Q2: Can I use a free tier EC2?

**Answer:**
Not recommended. The ML services require significant resources:
- ML API: ~4.5GB RAM
- Medicine API: ~2.8GB RAM
- Vision API: ~1.2GB RAM
- Frontend: ~300MB RAM

Total: ~9GB RAM minimum

### Q3: How do I get a fixed IP?

**Answer:**
1. Allocate Elastic IP in AWS Console
2. Associate with your EC2 instance
3. Update DNS if using a domain

### Q4: Can I add HTTPS?

**Answer:**
Yes! Options:
1. **Quick:** Use Cloudflare free SSL
2. **Medium:** Install nginx and use Let's Encrypt
3. **Production:** Use AWS ALB with ACM certificates

### Q5: What if NeonDB suspends?

**Answer:**
- NeonDB auto-suspends after 5 minutes of inactivity
- First request after suspension takes 1-3 seconds
- App automatically reconnects
- To prevent: Add a cron job to run a simple query every 5 minutes

### Q6: How do I backup my data?

**Answer:**
- **NeonDB:** Built-in point-in-time recovery
- **ChromaDB:** Vector data is ephemeral (in-memory)
- **App code:** Already in GitHub

### Q7: Can I run this locally?

**Answer:**
Yes! Just ensure you have:
- Docker Desktop
- 16GB+ RAM
- Run `docker-compose up -d` in the project root

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **EC2** | Elastic Compute Cloud - AWS virtual server |
| **Docker** | Containerization platform |
| **Docker Compose** | Multi-container orchestration tool |
| **NeonDB** | Serverless PostgreSQL database |
| **CrewAI** | Multi-agent AI framework |
| **FastAPI** | Python async web framework |
| **Next.js** | React full-stack framework |
| **Prisma** | TypeScript ORM for databases |
| **ChromaDB** | Vector database for embeddings |
| **Health Check** | HTTP endpoint to verify service status |
| **Health Status** | Docker container's current health state |

---

## 13. Contributing

We welcome contributions! Please see our contribution guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Coding Standards

- TypeScript: Strict mode enabled
- Python: Black formatter, isort
- Docker: Multi-stage builds, minimal image size

---

## 14. Support Channels

### 📧 Email Support
For urgent issues: support@curasense.health

### 🐛 Issue Tracker
https://github.com/VaibhavK289/curasense-architecture/issues

### 📚 Documentation
https://curasense.docs.health

### 💬 Community
Join our Discord: https://discord.gg/curasense

---

## 📊 Quick Reference Card

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Restart
docker-compose restart

# Rebuild
docker-compose up -d --build

# Health Check
curl -sS http://localhost:8000/health
curl -sS http://localhost:8001/ping
curl -sS http://localhost:8002/health
```

---

<div align="center">

**Made with ❤️ by the CuraSense Team**

*Version 1.0.0 | Last Updated: March 2026*

</div>
