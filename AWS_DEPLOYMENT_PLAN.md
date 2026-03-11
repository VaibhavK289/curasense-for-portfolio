# CuraSense AWS Deployment Plan

> **Version**: 1.0 | **Date**: March 2026
> **Services**: 4 (3 Python backends + 1 Next.js frontend)
> **Target**: AWS ECS Fargate (containerized, serverless compute)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [AWS Services Used](#2-aws-services-used)
3. [Pre-Deployment Prerequisites](#3-pre-deployment-prerequisites)
4. [Phase 1: Foundation (VPC, ECR, Secrets, Database)](#4-phase-1-foundation)
5. [Phase 2: Dockerize All Services](#5-phase-2-dockerize-all-services)
6. [Phase 3: Deploy Backends to ECS Fargate](#6-phase-3-deploy-backends-to-ecs-fargate)
7. [Phase 4: Deploy Frontend to ECS Fargate](#7-phase-4-deploy-frontend-to-ecs-fargate)
8. [Phase 5: Networking (ALB, Route 53, ACM)](#8-phase-5-networking)
9. [Phase 6: CDN and Static Assets](#9-phase-6-cdn-and-static-assets)
10. [Phase 7: CI/CD Pipeline](#10-phase-7-cicd-pipeline)
11. [Environment Variables Reference](#11-environment-variables-reference)
12. [Cost Estimate](#12-cost-estimate)
13. [Critical Issues to Fix Before Deployment](#13-critical-issues-to-fix-before-deployment)
14. [Scaling Strategy](#14-scaling-strategy)
15. [Monitoring and Observability](#15-monitoring-and-observability)
16. [Security Checklist](#16-security-checklist)

---

## 1. Architecture Overview

```
                           ┌──────────────────────────┐
                           │       Route 53           │
                           │   curasense.example.com  │
                           └────────────┬─────────────┘
                                        │
                           ┌────────────▼─────────────┐
                           │   CloudFront (CDN)       │
                           │   - Static assets cache  │
                           │   - SSL termination      │
                           └────────────┬─────────────┘
                                        │
                           ┌────────────▼─────────────┐
                           │   Application Load       │
                           │   Balancer (ALB)         │
                           │   - Path-based routing   │
                           │   - Health checks        │
                           │   - Idle timeout: 300s   │
                           └────┬────┬────┬────┬──────┘
                                │    │    │    │
            ┌───────────────────┘    │    │    └───────────────────┐
            ▼                        ▼    ▼                        ▼
┌───────────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  ECS: Frontend    │  │ ECS: ML API  │  │ ECS: Vision  │  │ ECS: Medicine    │
│  (Next.js)        │  │ (curasense-  │  │ API          │  │ API              │
│  Port 3000        │  │  ml)         │  │ (ml-fastapi) │  │ (medicine_model) │
│  1 vCPU / 2 GB    │  │ Port 8000    │  │ Port 8001    │  │ Port 8002        │
│                   │  │ 4 vCPU / 8 GB│  │ 1 vCPU / 2 GB│  │ 2 vCPU / 4 GB   │
└───────┬───────────┘  └──────────────┘  └──────────────┘  └──────────────────┘
        │
        ▼
┌───────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│  NeonDB           │     │  AWS Secrets Manager  │     │  ECR (Container     │
│  (PostgreSQL)     │     │  (API Keys, JWT)      │     │   Registry)         │
│  us-east-2        │     │                       │     │  4 repositories     │
└───────────────────┘     └──────────────────────┘     └─────────────────────┘
```

### Why ECS Fargate (Not EC2, Lambda, or EKS)?

| Option | Verdict | Reason |
|---|---|---|
| **ECS Fargate** | **CHOSEN** | No server management, per-second billing, supports long-running tasks (300s diagnosis), supports containers up to 16 vCPU/120 GB, simple to set up |
| EC2 | Rejected | Over-provisioning waste (you'd need 4 instances or a large one always running), manual scaling, OS patching |
| Lambda | Rejected | 15-min max timeout too short for diagnosis pipeline, 10 GB max memory too low for curasense-ml (needs PyTorch), cold starts destroy UX with ML model loading |
| EKS | Rejected | Overkill for 4 services, adds Kubernetes operational complexity, higher cost |
| App Runner | Possible alternative | Simpler than ECS but less control over networking, health checks, and scaling. Viable for the lighter services (ml-fastapi, medicine_model) |

---

## 2. AWS Services Used

| Service | Purpose | Cost Model |
|---|---|---|
| **ECS Fargate** | Run all 4 containerized services | Per vCPU-hour + per GB-hour |
| **ECR** | Private container image registry (4 repos) | $0.10/GB/month storage |
| **ALB** | Load balancing, path routing, health checks, SSL | ~$16/month + per LCU |
| **CloudFront** | CDN for static assets (`_next/static/*`, `public/*`) | Per request + per GB transfer |
| **Route 53** | DNS (optional — only if using custom domain) | $0.50/zone/month |
| **ACM** | Free SSL/TLS certificates | Free |
| **Secrets Manager** | Store API keys and database credentials | $0.40/secret/month |
| **CloudWatch** | Logs, metrics, alarms | Per GB ingested |
| **NeonDB** | PostgreSQL database (existing — stays external) | Existing plan |
| **S3** (optional) | Terraform state, build artifacts | Minimal |

---

## 3. Pre-Deployment Prerequisites

### 3.1 AWS Account Setup

```bash
# Install AWS CLI v2
# Configure credentials
aws configure
# Region: us-east-1 (or match your NeonDB region us-east-2)
```

### 3.2 Required Tools

| Tool | Version | Purpose |
|---|---|---|
| AWS CLI | v2+ | AWS resource management |
| Docker | 20+ | Build container images |
| Docker Compose | v2+ | Local multi-container testing |
| Git | 2.x | Source control |
| Node.js | 20 LTS | Frontend build |
| Python | 3.10-3.12 | Backend testing |

### 3.3 Domain Name (Optional but Recommended)

If using a custom domain (e.g., `curasense.example.com`):
1. Register domain in Route 53 or configure NS records from external registrar
2. Request ACM certificate (free) for `*.curasense.example.com`

### 3.4 Rotate All API Keys

The existing `.env` files contain real API keys that have been on disk. Before deploying:
1. Rotate `GOOGLE_API_KEY` in Google Cloud Console
2. Rotate `GROQ_API_KEY` in Groq Dashboard
3. Rotate `TAVILY_API_KEY` in Tavily Dashboard
4. Rotate `HF_TOKEN` in HuggingFace Settings
5. Generate a new strong `JWT_SECRET` (at least 64 random characters)

---

## 4. Phase 1: Foundation

### 4.1 Create VPC

Use the default VPC or create a dedicated one:

```bash
# If using default VPC, just note the VPC ID and subnet IDs
aws ec2 describe-vpcs --filters "Name=isDefault,Values=true"
aws ec2 describe-subnets --filters "Name=vpc-id,Values=<vpc-id>"
```

For production, create a VPC with:
- 2 public subnets (for ALB) in 2 AZs
- 2 private subnets (for ECS tasks) in 2 AZs
- NAT Gateway (for private subnet outbound internet — needed for API calls to Gemini/Groq/Tavily)

### 4.2 Create ECR Repositories

```bash
aws ecr create-repository --repository-name curasense/frontend
aws ecr create-repository --repository-name curasense/ml-api
aws ecr create-repository --repository-name curasense/vision-api
aws ecr create-repository --repository-name curasense/medicine-api
```

### 4.3 Store Secrets in AWS Secrets Manager

```bash
# Create one secret with all API keys as JSON
aws secretsmanager create-secret \
  --name curasense/api-keys \
  --secret-string '{
    "GOOGLE_API_KEY": "...",
    "GROQ_API_KEY": "...",
    "TAVILY_API_KEY": "...",
    "HF_TOKEN": "...",
    "GOOGLE_CREDENTIALS_BASE64": "...",
    "JWT_SECRET": "...",
    "DATABASE_URL": "postgresql://...",
    "CRON_SECRET": "..."
  }'
```

### 4.4 Database (NeonDB — No Change Needed)

Your PostgreSQL database runs on NeonDB (external to AWS). This is fine:
- NeonDB is in `us-east-2` — deploy your ECS tasks in `us-east-2` for lowest latency
- Ensure NeonDB allows connections from AWS (NeonDB allows all IPs by default with SSL)
- The connection uses `?sslmode=require` which is correct

If you ever want to migrate to AWS RDS:
- Use `RDS PostgreSQL 15+` in a private subnet
- Connect via VPC internal DNS
- Estimated cost: ~$15-30/month for `db.t4g.micro`

---

## 5. Phase 2: Dockerize All Services

### 5.1 curasense-ml (Diagnosis/Chat) — NEW Dockerfile

Create `D:\final_curasense\curasense-ml\Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for PDF processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ && \
    rm -rf /var/lib/apt/lists/*

# Install CPU-only PyTorch first (prevents 3.5GB CUDA download)
RUN pip install --no-cache-dir \
    torch==2.5.1+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the HuggingFace NER model into the image
# This prevents 60s+ cold start on first request
RUN python -c "\
from transformers import AutoTokenizer, AutoModelForTokenClassification; \
AutoTokenizer.from_pretrained('Clinical-AI-Apollo/Medical-NER'); \
AutoModelForTokenClassification.from_pretrained('Clinical-AI-Apollo/Medical-NER')"

# Copy application code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

Create `D:\final_curasense\curasense-ml\.dockerignore`:

```
.env
.git
__pycache__
*.pyc
Mini-CDSS/
report.md
venv/
*.log
nul
```

**Estimated image size**: ~3-4 GB (PyTorch CPU + transformers model)

### 5.2 ml-fastapi (Vision) — NEW Dockerfile

Create `D:\final_curasense\ml-fastapi\Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies (no PyTorch needed — all inference is API-based)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create writable directories for ChromaDB and temp files
RUN mkdir -p /app/.chroma /app/logs

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/ping')" || exit 1

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]
```

Create `D:\final_curasense\ml-fastapi\.dockerignore`:

```
.env
.git
__pycache__
*.pyc
.chroma/
static/
venv/
*.log
nul
render.yaml
test_*.py
```

**Estimated image size**: ~800 MB - 1 GB

### 5.3 medicine_model — UPDATE Existing Dockerfile

The existing Dockerfile at `E:\medicine_model_curasense\Dockerfile` is mostly good. Changes needed:

```dockerfile
FROM python:3.12-slim

# Create non-root user
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /home/user/app

# Install CPU-only PyTorch first
RUN pip install --no-cache-dir --user \
    torch==2.5.1+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# Install Python dependencies
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Pre-download sentence-transformers model to avoid 60s cold start
RUN python -c "\
from sentence_transformers import SentenceTransformer; \
SentenceTransformer('all-MiniLM-L6-v2')"

# Copy application code
COPY --chown=user app/ ./app/

# Create writable directories
RUN mkdir -p /home/user/app/chroma_db /home/user/app/logs

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8002/health')" || exit 1

EXPOSE 8002

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002", "--workers", "1"]
```

**Estimated image size**: ~2-2.5 GB (PyTorch CPU + sentence-transformers)

### 5.4 curasense-frontend — NEW Dockerfile

Create `D:\final_curasense\curasense-frontend\Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# --- Build stage ---
FROM base AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy source code
COPY . .

# Set build-time environment variables
# These are baked into the client JS bundle
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-https://curasense.example.com}

# Build the standalone Next.js application
RUN npm run build

# --- Production stage ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

EXPOSE 3000

CMD ["node", "server.js"]
```

Create `D:\final_curasense\curasense-frontend\.dockerignore`:

```
node_modules
.next
.env
.env.*
.git
*.md
.vercel
```

**Estimated image size**: ~200-300 MB (Node Alpine + standalone build)

### 5.5 Local Testing with Docker Compose

Create `D:\final_curasense\docker-compose.yml` for local validation before AWS deployment:

```yaml
services:
  frontend:
    build: ./curasense-frontend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - BACKEND_API_URL=http://ml-api:8000
      - BACKEND_VISION_URL=http://vision-api:8001
      - MEDICINE_API_URL=http://medicine-api:8002
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    depends_on:
      ml-api:
        condition: service_healthy
      vision-api:
        condition: service_healthy
      medicine-api:
        condition: service_healthy

  ml-api:
    build: ./curasense-ml
    ports:
      - "8000:8000"
    environment:
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - TAVILY_API_KEY=${TAVILY_API_KEY}

  vision-api:
    build: ./ml-fastapi
    ports:
      - "8001:8001"
    environment:
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - TAVILY_API_KEY=${TAVILY_API_KEY}
      - HF_TOKEN=${HF_TOKEN}
      - GOOGLE_CREDENTIALS_BASE64=${GOOGLE_CREDENTIALS_BASE64}

  medicine-api:
    build:
      context: E:/medicine_model_curasense
    ports:
      - "8002:8002"
    environment:
      - GEMINI_API_KEY=${GOOGLE_API_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - TAVILY_API_KEY=${TAVILY_API_KEY}
      - HF_TOKEN=${HF_TOKEN}
```

---

## 6. Phase 3: Deploy Backends to ECS Fargate

### 6.1 Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name curasense --capacity-providers FARGATE
```

### 6.2 Create IAM Roles

**ECS Task Execution Role** (allows ECS to pull images and read secrets):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "*"
    }
  ]
}
```

**ECS Task Role** (runtime permissions — currently none needed since all external calls are via API keys, not IAM):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "*"
    }
  ]
}
```

### 6.3 Build and Push Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-2.amazonaws.com

# Build and push each service
# curasense-ml
docker build -t curasense/ml-api ./curasense-ml
docker tag curasense/ml-api:latest <account-id>.dkr.ecr.us-east-2.amazonaws.com/curasense/ml-api:latest
docker push <account-id>.dkr.ecr.us-east-2.amazonaws.com/curasense/ml-api:latest

# ml-fastapi
docker build -t curasense/vision-api ./ml-fastapi
docker tag curasense/vision-api:latest <account-id>.dkr.ecr.us-east-2.amazonaws.com/curasense/vision-api:latest
docker push <account-id>.dkr.ecr.us-east-2.amazonaws.com/curasense/vision-api:latest

# medicine_model
docker build -t curasense/medicine-api E:/medicine_model_curasense
docker tag curasense/medicine-api:latest <account-id>.dkr.ecr.us-east-2.amazonaws.com/curasense/medicine-api:latest
docker push <account-id>.dkr.ecr.us-east-2.amazonaws.com/curasense/medicine-api:latest

# frontend
docker build -t curasense/frontend ./curasense-frontend \
  --build-arg NEXT_PUBLIC_APP_URL=https://curasense.example.com
docker tag curasense/frontend:latest <account-id>.dkr.ecr.us-east-2.amazonaws.com/curasense/frontend:latest
docker push <account-id>.dkr.ecr.us-east-2.amazonaws.com/curasense/frontend:latest
```

### 6.4 ECS Task Definitions

Each service gets its own Task Definition. Example for `curasense-ml`:

```json
{
  "family": "curasense-ml-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "4096",
  "memory": "8192",
  "executionRoleArn": "arn:aws:iam::<account>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<account>:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "ml-api",
      "image": "<account>.dkr.ecr.us-east-2.amazonaws.com/curasense/ml-api:latest",
      "portMappings": [{ "containerPort": 8000, "protocol": "tcp" }],
      "secrets": [
        { "name": "GOOGLE_API_KEY", "valueFrom": "arn:aws:secretsmanager:us-east-2:<account>:secret:curasense/api-keys:GOOGLE_API_KEY::" },
        { "name": "GROQ_API_KEY", "valueFrom": "arn:aws:secretsmanager:us-east-2:<account>:secret:curasense/api-keys:GROQ_API_KEY::" },
        { "name": "TAVILY_API_KEY", "valueFrom": "arn:aws:secretsmanager:us-east-2:<account>:secret:curasense/api-keys:TAVILY_API_KEY::" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/curasense-ml-api",
          "awslogs-region": "us-east-2",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "python -c \"import urllib.request; urllib.request.urlopen('http://localhost:8000/')\" || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 120
      }
    }
  ]
}
```

### 6.5 Resource Allocation Per Service

| Service | vCPU | Memory | Start Period | Min Tasks | Max Tasks |
|---|---|---|---|---|---|
| `curasense-ml` | 4096 (4 vCPU) | 8192 MB (8 GB) | 120s | 1 | 2 |
| `ml-fastapi` | 1024 (1 vCPU) | 2048 MB (2 GB) | 30s | 1 | 2 |
| `medicine_model` | 2048 (2 vCPU) | 4096 MB (4 GB) | 180s | 1 | 2 |
| `frontend` | 1024 (1 vCPU) | 2048 MB (2 GB) | 30s | 1 | 3 |

**Start Period** is critical — it tells ECS not to kill the container during initial model loading. `curasense-ml` needs 120s for HuggingFace model load (pre-cached in image, but still takes time). `medicine_model` needs 180s for sentence-transformers + ChromaDB initialization.

### 6.6 Create ECS Services

```bash
# Create service for each backend
aws ecs create-service \
  --cluster curasense \
  --service-name ml-api \
  --task-definition curasense-ml-api \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:...,containerName=ml-api,containerPort=8000"

# Repeat for vision-api (port 8001), medicine-api (port 8002), frontend (port 3000)
```

---

## 7. Phase 4: Deploy Frontend to ECS Fargate

The frontend follows the same pattern as backends but with additional environment variables:

### Frontend Task Definition — Key Environment Variables

```json
{
  "environment": [
    { "name": "BACKEND_API_URL", "value": "http://ml-api.curasense.local:8000" },
    { "name": "BACKEND_VISION_URL", "value": "http://vision-api.curasense.local:8001" },
    { "name": "MEDICINE_API_URL", "value": "http://medicine-api.curasense.local:8002" },
    { "name": "NEXT_PUBLIC_APP_URL", "value": "https://curasense.example.com" }
  ],
  "secrets": [
    { "name": "DATABASE_URL", "valueFrom": "...curasense/api-keys:DATABASE_URL::" },
    { "name": "JWT_SECRET", "valueFrom": "...curasense/api-keys:JWT_SECRET::" },
    { "name": "CRON_SECRET", "valueFrom": "...curasense/api-keys:CRON_SECRET::" }
  ]
}
```

### Service Discovery (Backend-to-Backend Communication)

Use **ECS Service Connect** or **Cloud Map** for internal DNS:

```bash
# Create private DNS namespace
aws servicediscovery create-private-dns-namespace \
  --name curasense.local \
  --vpc vpc-xxx

# Register each backend service
# ml-api.curasense.local -> curasense-ml ECS task
# vision-api.curasense.local -> ml-fastapi ECS task
# medicine-api.curasense.local -> medicine_model ECS task
```

This gives the frontend stable internal URLs (`http://ml-api.curasense.local:8000`) instead of IPs that change on every deployment.

---

## 8. Phase 5: Networking

### 8.1 Application Load Balancer

```bash
# Create ALB in public subnets
aws elbv2 create-load-balancer \
  --name curasense-alb \
  --subnets subnet-public-1 subnet-public-2 \
  --security-groups sg-alb

# Create target groups (one per service)
aws elbv2 create-target-group --name curasense-frontend --port 3000 --protocol HTTP --target-type ip --vpc-id vpc-xxx \
  --health-check-path "/api/health" --health-check-interval-seconds 30 --healthy-threshold-count 2

aws elbv2 create-target-group --name curasense-ml-api --port 8000 --protocol HTTP --target-type ip --vpc-id vpc-xxx \
  --health-check-path "/" --health-check-interval-seconds 30 --healthy-threshold-count 2

aws elbv2 create-target-group --name curasense-vision-api --port 8001 --protocol HTTP --target-type ip --vpc-id vpc-xxx \
  --health-check-path "/ping" --health-check-interval-seconds 30 --healthy-threshold-count 2

aws elbv2 create-target-group --name curasense-medicine-api --port 8002 --protocol HTTP --target-type ip --vpc-id vpc-xxx \
  --health-check-path "/health" --health-check-interval-seconds 30 --healthy-threshold-count 2
```

### ALB Configuration

| Setting | Value | Reason |
|---|---|---|
| Idle timeout | **300 seconds** | Diagnosis pipeline can take up to 5 minutes |
| SSL certificate | ACM cert for your domain | HTTPS termination at ALB |
| HTTP -> HTTPS redirect | Enabled | Security |
| Sticky sessions | Disabled | Services are stateless (from browser perspective — all state is in Next.js API routes) |

### ALB Routing Rules

The ALB only needs to route to the **frontend**. The frontend's API routes handle all backend proxying internally:

| Rule | Target |
|---|---|
| Default (`/*`) | Frontend target group (port 3000) |

The backends are NOT exposed to the internet. They are only accessible via the frontend's server-side API routes over the internal VPC network (Service Discovery).

### Security Groups

```
sg-alb:
  Inbound: 80/443 from 0.0.0.0/0
  Outbound: 3000 to sg-frontend

sg-frontend:
  Inbound: 3000 from sg-alb
  Outbound: 8000 to sg-backends, 8001 to sg-backends, 8002 to sg-backends, 443 to 0.0.0.0/0 (NeonDB)

sg-backends:
  Inbound: 8000-8002 from sg-frontend
  Outbound: 443 to 0.0.0.0/0 (Gemini, Groq, Tavily, HuggingFace APIs)
```

### 8.2 Route 53 (Optional — Custom Domain)

```bash
# Create A record pointing to ALB
aws route53 change-resource-record-sets --hosted-zone-id <zone-id> --change-batch '{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "curasense.example.com",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "<alb-zone-id>",
        "DNSName": "<alb-dns-name>",
        "EvaluateTargetHealth": true
      }
    }
  }]
}'
```

---

## 9. Phase 6: CDN and Static Assets

### CloudFront Distribution

```bash
# Create CloudFront distribution with ALB as origin
# Cache behavior:
#   /_next/static/*  -> Cache 365 days (immutable hashed files)
#   /public/*        -> Cache 30 days
#   /api/*           -> No cache, forward all headers
#   Default (*)      -> No cache (SSR pages)
```

| Path Pattern | Cache Policy | TTL | Origin |
|---|---|---|---|
| `/_next/static/*` | CachingOptimized | 31536000s (1 year) | ALB |
| `/favicon.ico`, `/robots.txt` | CachingOptimized | 86400s (1 day) | ALB |
| `/api/*` | CachingDisabled | 0 | ALB |
| `Default (*)` | CachingDisabled | 0 | ALB |

---

## 10. Phase 7: CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS ECS

on:
  push:
    branches: [main]

env:
  AWS_REGION: us-east-2
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-2.amazonaws.com

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      frontend: ${{ steps.filter.outputs.frontend }}
      ml-api: ${{ steps.filter.outputs.ml-api }}
      vision-api: ${{ steps.filter.outputs.vision-api }}
      medicine-api: ${{ steps.filter.outputs.medicine-api }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            frontend: 'curasense-frontend/**'
            ml-api: 'curasense-ml/**'
            vision-api: 'ml-fastapi/**'
            medicine-api: 'medicine_model/**'

  deploy-frontend:
    needs: detect-changes
    if: needs.detect-changes.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-2
      - uses: aws-actions/amazon-ecr-login@v2
      - run: |
          docker build -t curasense/frontend ./curasense-frontend \
            --build-arg NEXT_PUBLIC_APP_URL=${{ secrets.APP_URL }}
          docker tag curasense/frontend:latest $ECR_REGISTRY/curasense/frontend:latest
          docker push $ECR_REGISTRY/curasense/frontend:latest
      - run: |
          aws ecs update-service --cluster curasense --service frontend --force-new-deployment

  # Repeat similar jobs for ml-api, vision-api, medicine-api
```

---

## 11. Environment Variables Reference

### Per-Service Environment Variable Map

| Variable | Frontend | curasense-ml | ml-fastapi | medicine_model |
|---|---|---|---|---|
| `DATABASE_URL` | SECRET | - | - | - |
| `JWT_SECRET` | SECRET | - | - | - |
| `CRON_SECRET` | SECRET | - | - | - |
| `GOOGLE_API_KEY` | - | SECRET | SECRET | - |
| `GEMINI_API_KEY` | - | - | - | SECRET |
| `GROQ_API_KEY` | - | SECRET | SECRET | SECRET |
| `TAVILY_API_KEY` | - | SECRET | SECRET | SECRET |
| `HF_TOKEN` | - | - | SECRET | SECRET |
| `GOOGLE_CREDENTIALS_BASE64` | - | - | SECRET | - |
| `BACKEND_API_URL` | `http://ml-api.curasense.local:8000` | - | - | - |
| `BACKEND_VISION_URL` | `http://vision-api.curasense.local:8001` | - | - | - |
| `MEDICINE_API_URL` | `http://medicine-api.curasense.local:8002` | - | - | - |
| `NEXT_PUBLIC_APP_URL` | Build arg | - | - | - |

Note: `GOOGLE_API_KEY` (curasense-ml, ml-fastapi) and `GEMINI_API_KEY` (medicine_model) are the same key — the medicine_model uses a different env var name defined in its `pydantic-settings` config.

---

## 12. Cost Estimate

### Monthly Cost (1 task per service, us-east-2)

| Resource | Spec | Monthly Cost |
|---|---|---|
| **ECS Fargate: frontend** | 1 vCPU, 2 GB, 24/7 | ~$34 |
| **ECS Fargate: curasense-ml** | 4 vCPU, 8 GB, 24/7 | ~$135 |
| **ECS Fargate: ml-fastapi** | 1 vCPU, 2 GB, 24/7 | ~$34 |
| **ECS Fargate: medicine_model** | 2 vCPU, 4 GB, 24/7 | ~$67 |
| **ALB** | 1 ALB | ~$16 + LCU |
| **ECR** | ~7 GB images | ~$0.70 |
| **CloudWatch Logs** | ~5 GB/month | ~$2.50 |
| **Secrets Manager** | 8 secrets | ~$3.20 |
| **NAT Gateway** (if using private subnets) | 1 NAT | ~$32 + data |
| **CloudFront** | Minimal traffic | ~$1-5 |
| **NeonDB** | Existing | Existing plan |
| **Route 53** | 1 hosted zone | $0.50 |
| | | |
| **Total (with NAT)** | | **~$325-350/month** |
| **Total (public subnets, no NAT)** | | **~$290-315/month** |

### Cost Optimization Options

| Strategy | Savings | Trade-off |
|---|---|---|
| **Use Fargate Spot** for backends | ~70% on Fargate compute | Tasks can be interrupted (2-min warning) |
| **Scale to 0 at night** (Scheduled Scaling) | ~50% | Service unavailable during off hours |
| **Use t3.medium EC2 instead of Fargate** for curasense-ml | ~40% | Must manage EC2 instance |
| **Reduce curasense-ml to 2 vCPU / 4 GB** | ~50% on that service | Slower diagnosis, may OOM under load |
| **Move NeonDB to RDS db.t4g.micro** | Depends on NeonDB plan | More management, but ~$15/month |
| **Use public subnets** (skip NAT Gateway) | Save $32/month | Less secure (tasks get public IPs) |

### Budget-Friendly Alternative (~$100/month)

If cost is a primary concern:

| Resource | Spec | Cost |
|---|---|---|
| 1x EC2 `t3.xlarge` (4 vCPU / 16 GB) | Run ALL 4 services via docker-compose | ~$85/month (spot: ~$30) |
| ALB | Load balancer | ~$16 |
| | **Total** | **~$100/month** (or ~$46 with spot) |

Trade-offs: Single point of failure, manual scaling, OS patching, no isolation between services.

---

## 13. Critical Issues to Fix Before Deployment

These must be addressed in the codebase before deploying:

### P0 — Deployment Blockers

| # | Issue | Service | Fix |
|---|---|---|---|
| 1 | **No `requirements.txt` version pins** — builds are non-reproducible | ALL 3 backends | Run `pip freeze > requirements.lock` in each conda env, use lock file in Dockerfile |
| 2 | **`report.md` race condition** — concurrent diagnosis requests overwrite each other's output file | curasense-ml | Refactor to use `tempfile.NamedTemporaryFile()` per request or pass report content in memory |
| 3 | **No health check endpoint** in curasense-ml | curasense-ml | Add `@app.get("/health") def health(): return {"status": "ok"}` |
| 4 | **MEDICINE_API_URL default is wrong** — defaults to `http://127.0.0.1:8000` instead of `:8002` | frontend | Fix fallback in API route files |
| 5 | **`CORS allow_origins=["*"]` with `allow_credentials=True`** is invalid per spec | medicine_model | Set `allow_credentials=False` or restrict origins |

### P1 — Production Hardening

| # | Issue | Service | Fix |
|---|---|---|---|
| 6 | **CORS hardcoded to `*`** — should be restricted to frontend domain | ALL 3 backends | Read from env var, set to `https://curasense.example.com` |
| 7 | **`/set_api` endpoint** allows anyone to overwrite API keys | ml-fastapi | Remove or add auth |
| 8 | **Temp files written to CWD** (`temp_{filename}`) — collision risk | ml-fastapi | Use `tempfile.mkstemp()` |
| 9 | **LangGraph MemorySaver is in-memory** — state lost on restart, not shared across instances | ml-fastapi | Accept (stateless restarts) or switch to Redis/DynamoDB checkpointer |
| 10 | **Duplicate SentenceTransformer instances** (~10x) waste RAM and slow startup | medicine_model | Refactor to singleton pattern |
| 11 | **No async for heavy operations** — blocks event loop | medicine_model | Wrap sync calls in `asyncio.to_thread()` |
| 12 | **`bitsandbytes`** in requirements — may fail on CPU-only containers | curasense-ml | Remove if not used (it's not referenced in any code) |
| 13 | **`ipykernel`** in requirements — unnecessary for production | curasense-ml | Remove |
| 14 | **Secrets in `.env` files** — may be committed to git | ALL | Verify `.gitignore`, rotate all keys |

### P2 — Nice to Have

| # | Issue | Service | Fix |
|---|---|---|---|
| 15 | Email sending is a `console.log` placeholder | frontend | Integrate AWS SES |
| 16 | No rate limiting | ALL | Add API Gateway or middleware rate limiter |
| 17 | No request tracing / correlation IDs | ALL | Add middleware to propagate trace IDs |
| 18 | ChromaDB duplicate entries (no dedup) | medicine_model | Add check before inserting |

---

## 14. Scaling Strategy

### Auto Scaling Policies

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/curasense/frontend \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 --max-capacity 3

# Target tracking: scale when CPU > 70%
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/curasense/frontend \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-tracking \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleOutCooldown": 60,
    "ScaleInCooldown": 300
  }'
```

### Scaling Constraints

| Service | Scalable? | Constraint |
|---|---|---|
| Frontend | Yes, horizontally | Stateless — scales freely |
| curasense-ml | Limited | `report.md` race condition prevents concurrent requests in same container. Fix before scaling. With fix, scales horizontally. |
| ml-fastapi | Limited | LangGraph MemorySaver is in-memory — multi-instance loses session state. For vision analysis (multi-step flow), users must hit the same instance. Use ALB sticky sessions OR accept session loss. |
| medicine_model | Yes, horizontally | ChromaDB is per-container cache. In-memory caches are warm per instance. Scales with cold cache trade-off. |

---

## 15. Monitoring and Observability

### CloudWatch Log Groups

```
/ecs/curasense-frontend
/ecs/curasense-ml-api
/ecs/curasense-vision-api
/ecs/curasense-medicine-api
```

### Key Metrics to Monitor

| Metric | Source | Alarm Threshold |
|---|---|---|
| ECS CPU Utilization | CloudWatch ECS | > 80% for 5 min |
| ECS Memory Utilization | CloudWatch ECS | > 85% for 5 min |
| ALB 5xx Error Rate | CloudWatch ALB | > 5% for 2 min |
| ALB Target Response Time | CloudWatch ALB | > 30s p95 |
| ALB Healthy Host Count | CloudWatch ALB | < 1 for any target group |
| ECS Task Count | CloudWatch ECS | == 0 for any service |

### CloudWatch Alarms

```bash
# Example: Alert if ML API has no healthy tasks
aws cloudwatch put-metric-alarm \
  --alarm-name "curasense-ml-api-unhealthy" \
  --namespace "AWS/ApplicationELB" \
  --metric-name "HealthyHostCount" \
  --dimensions Name=TargetGroup,Value=<tg-arn> Name=LoadBalancer,Value=<alb-arn> \
  --statistic Minimum --period 60 --evaluation-periods 2 \
  --threshold 1 --comparison-operator LessThanThreshold \
  --alarm-actions <sns-topic-arn>
```

---

## 16. Security Checklist

| Item | Status | Notes |
|---|---|---|
| All secrets in Secrets Manager, not env files | Required | Never bake secrets into images |
| HTTPS only (ALB redirects HTTP -> HTTPS) | Required | ACM free cert |
| Backend services NOT publicly accessible | Required | Only frontend receives ALB traffic |
| Security groups restrict inter-service traffic | Required | Backends only accept from frontend SG |
| Database uses SSL | Already done | `?sslmode=require` in connection string |
| CORS restricted to frontend domain | Fix needed | Currently `*` in all 3 backends |
| API keys rotated before deployment | Required | Current keys may be compromised |
| `httpOnly` cookie for refresh token | Already done | Set in auth routes |
| JWT secret is strong (64+ chars) | Required | Generate with `openssl rand -base64 64` |
| No debug endpoints in production | Fix needed | Remove `/set_api` from ml-fastapi |
| Docker images use non-root user | Partial | medicine_model does, others need adding |
| ECR image scanning enabled | Recommended | Scans for CVEs in base images |

---

## Deployment Execution Order

```
Step 1: Fix P0 issues (health check, report.md race, CORS, env defaults)
Step 2: Pin all dependency versions
Step 3: Create Dockerfiles, test locally with docker-compose
Step 4: Create AWS foundation (VPC, ECR, Secrets Manager, IAM roles)
Step 5: Build and push images to ECR
Step 6: Create ECS cluster, task definitions, services
Step 7: Create ALB with target groups and health checks
Step 8: Configure Service Discovery for internal DNS
Step 9: Set frontend env vars pointing to internal backend URLs
Step 10: Test end-to-end (register, login, diagnosis, medicine hub)
Step 11: Configure Route 53 + CloudFront (optional)
Step 12: Set up CI/CD pipeline
Step 13: Configure auto-scaling and alarms
Step 14: Set up EventBridge for cron job (session cleanup)
```
