# CuraSense Database Integration Guide

## PostgreSQL Database Setup with Prisma ORM

This guide provides comprehensive instructions for setting up PostgreSQL database integration for the CuraSense healthcare application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Schema Overview](#database-schema-overview)
3. [Local PostgreSQL Setup](#local-postgresql-setup)
4. [NeonDB (Cloud) Setup](#neondb-cloud-setup)
5. [Environment Configuration](#environment-configuration)
6. [Prisma Setup & Migration](#prisma-setup--migration)
7. [API Endpoints](#api-endpoints)
8. [Security Considerations](#security-considerations)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- PostgreSQL 14.x or higher (local) OR NeonDB account (cloud)
- Basic understanding of SQL and ORM concepts

---

## Database Schema Overview

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CuraSense Database Schema                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    User      │       │   Session    │       │  AuditLog    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │       │ id (PK)      │
│ email (UQ)   │  │    │ userId (FK)  │───────│ userId (FK)  │
│ passwordHash │  │    │ refreshToken │       │ action       │
│ firstName    │  └────│ expiresAt    │       │ entity       │
│ lastName     │       │ ipAddress    │       │ entityId     │
│ displayName  │       │ userAgent    │       │ changes      │
│ phone        │       │ isRevoked    │       │ ipAddress    │
│ avatarUrl    │       │ createdAt    │       │ userAgent    │
│ role         │       └──────────────┘       │ createdAt    │
│ status       │                              └──────────────┘
│ preferences  │
│ lastLoginAt  │       ┌──────────────┐       ┌──────────────────┐
│ failedLogins │       │   Report     │       │  AnalyticsDaily  │
│ lockedUntil  │       ├──────────────┤       ├──────────────────┤
│ createdAt    │──────►│ id (PK)      │       │ id (PK)          │
│ updatedAt    │       │ userId (FK)  │       │ userId (FK)      │
└──────────────┘       │ type         │       │ date (UQ w/user) │
                       │ status       │       │ reportsCreated   │
                       │ title        │       │ xrayAnalyses     │
                       │ description  │       │ labResults       │
                       │ originalFile │       │ prescriptions    │
                       │ fileType     │       │ avgConfidence    │
                       │ fileSize     │       │ storageUsed      │
                       │ storagePath  │       │ createdAt        │
                       │ fileHash     │       └──────────────────┘
                       │ aiDiagnosis  │
                       │ aiConfidence │
                       │ findings     │
                       │ processedAt  │
                       │ isArchived   │
                       │ createdAt    │
                       │ updatedAt    │
                       └──────────────┘
```

### Core Tables

| Table | Purpose | Row Estimate |
|-------|---------|--------------|
| `User` | User credentials and profile | 10K-100K |
| `Session` | JWT refresh tokens | 2-5x Users |
| `Report` | Medical file uploads and AI results | 10x-100x Users |
| `AuditLog` | HIPAA compliance tracking | 50x-500x Users |
| `AnalyticsDaily` | Pre-computed daily metrics | 365 x Users |

---

## Local PostgreSQL Setup

### 1. Install PostgreSQL

**Windows:**
```powershell
# Using Chocolatey
choco install postgresql

# Or download installer from https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database and User

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE curasense;

-- Create application user with secure password
CREATE USER curasense_app WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE curasense TO curasense_app;

-- Connect to the database
\c curasense

-- Grant schema privileges (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO curasense_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO curasense_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO curasense_app;

-- Exit
\q
```

### 3. Verify Connection

```bash
psql -h localhost -U curasense_app -d curasense
```

---

## NeonDB (Cloud) Setup

NeonDB is a serverless PostgreSQL service ideal for Next.js applications.

### 1. Create NeonDB Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub, Google, or email
3. Create a new project named "curasense"

### 2. Get Connection String

1. Navigate to your project dashboard
2. Click "Connection Details"
3. Copy the connection string (it looks like):

```
postgresql://username:password@ep-xxx-xxx-123456.us-east-2.aws.neon.tech/curasense?sslmode=require
```

### 3. Configure Connection Pooling (Recommended)

NeonDB provides a pooled connection endpoint. Use the pooled URL for better performance:

```
# Standard connection (for migrations)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/curasense?sslmode=require"

# Pooled connection (for application queries) 
DATABASE_URL_POOLED="postgresql://user:pass@ep-xxx.pooler.neon.tech/curasense?sslmode=require"
```

### 4. Enable Connection Pooling in Prisma

Update your `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_DIRECT")  // For migrations
}
```

---

## Environment Configuration

### 1. Create Environment File

Create `.env.local` in your project root:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================

# Primary database URL (use pooled connection for NeonDB)
DATABASE_URL="postgresql://curasense_app:your_password@localhost:5432/curasense"

# Direct URL for migrations (NeonDB only - use non-pooled endpoint)
# DATABASE_URL_DIRECT="postgresql://user:pass@ep-xxx.neon.tech/curasense?sslmode=require"

# ============================================
# AUTHENTICATION SECRETS
# ============================================

# JWT Secret - generate with: openssl rand -base64 64
JWT_SECRET="your-super-secure-jwt-secret-key-minimum-32-characters-long"

# JWT Refresh Secret - generate with: openssl rand -base64 64
JWT_REFRESH_SECRET="another-super-secure-refresh-secret-key-minimum-32-chars"

# ============================================
# APPLICATION SETTINGS
# ============================================

# Environment
NODE_ENV="development"

# Next.js URL
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Generate Secure Secrets

```powershell
# PowerShell - Generate random secrets
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

```bash
# Bash/Linux/macOS
openssl rand -base64 64
```

### 3. Validate Environment

Create a validation script at `scripts/validate-env.ts`:

```typescript
const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

console.log('✅ All required environment variables are set');
```

---

## Prisma Setup & Migration

### 1. Install Dependencies

```bash
npm install prisma @prisma/client @prisma/adapter-pg pg bcryptjs jsonwebtoken dotenv
npm install -D @types/bcryptjs @types/jsonwebtoken @types/pg
```

### 2. Prisma 7 Configuration

This project uses Prisma 7+ which has a new configuration structure. The database URL is configured in `prisma.config.ts` instead of the schema file:

```typescript
// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

The schema file (`prisma/schema.prisma`) only specifies the provider:

```prisma
datasource db {
  provider = "postgresql"
}
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

This creates the TypeScript client from your schema.

### 4. Prisma Client with Driver Adapter

Prisma 7 uses a driver adapter pattern for database connections. The client is configured in `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
```

### 5. Run Database Migrations

**Development (with migration history):**
```bash
npx prisma migrate dev --name init
```

**Production (apply existing migrations):**
```bash
npx prisma migrate deploy
```

### 4. Seed Database (Optional)

Create `prisma/seed.ts`:

```typescript
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123!', 12);
  
  await prisma.user.upsert({
    where: { email: 'admin@curasense.com' },
    update: {},
    create: {
      email: 'admin@curasense.com',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      displayName: 'Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('✅ Database seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Run seed:
```bash
npx prisma db seed
```

### 5. Prisma Studio (Database GUI)

```bash
npx prisma studio
```

Opens a web-based database browser at `http://localhost:5555`.

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/login` | Authenticate and get tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Revoke refresh token |

### User Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get current user profile |
| PATCH | `/api/user/profile` | Update profile fields |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | List user's reports (paginated) |
| POST | `/api/reports` | Create new report |
| GET | `/api/reports/:id` | Get single report |
| PATCH | `/api/reports/:id` | Update report |
| DELETE | `/api/reports/:id` | Archive or delete report |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get user statistics and usage |

### Request/Response Examples

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Smith"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "SecurePass123!"
  }'
```

**Create Report (Authenticated):**
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "title": "Chest X-Ray Analysis",
    "type": "XRAY",
    "originalFilename": "chest_xray.png",
    "fileType": "PNG",
    "storagePath": "/uploads/2024/01/chest_xray.png"
  }'
```

---

## Security Considerations

### 1. Password Hashing

- Using bcryptjs with 12 salt rounds
- Timing-safe comparison to prevent timing attacks
- Account lockout after 5 failed attempts

### 2. JWT Token Security

- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (30 days) stored in HTTP-only cookies
- Tokens include user ID, email, and role
- Refresh tokens are stored in database for revocation

### 3. HIPAA Compliance

- Audit logging for all data access
- User consent tracking
- Data retention policies
- Encrypted data at rest (PostgreSQL/NeonDB)
- Encrypted data in transit (TLS/SSL)

### 4. SQL Injection Prevention

- Prisma uses parameterized queries by default
- No raw SQL queries without validation

### 5. Rate Limiting (Recommended)

Add rate limiting middleware:

```typescript
// Install: npm install @upstash/ratelimit @upstash/redis
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

---

## Performance Optimization

### 1. Database Indexes

The schema includes indexes for:
- User email lookup (unique)
- Session token lookup
- Report queries by user, type, status
- Audit log queries by user, action, date
- Analytics queries by user and date

### 2. Query Optimization

```typescript
// ✅ Good: Select only needed fields
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, firstName: true },
});

// ❌ Bad: Select all fields
const user = await prisma.user.findUnique({
  where: { id },
});
```

### 3. Connection Pooling

For NeonDB, use the pooled connection endpoint. For local PostgreSQL:

```typescript
// prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool settings
});
```

### 4. Caching Strategy

Consider Redis for:
- Session caching
- Analytics caching
- Rate limiting

---

## Troubleshooting

### Common Issues

**1. "Can't reach database server"**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
echo $DATABASE_URL
```

**2. "Migration failed"**
```bash
# Reset database (development only!)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

**3. "Prisma Client not generated"**
```bash
npx prisma generate
```

**4. "SSL required" (NeonDB)**
```
# Ensure ?sslmode=require in connection string
DATABASE_URL="postgresql://...?sslmode=require"
```

**5. "Too many connections"**
- Use connection pooling (NeonDB pooler or PgBouncer)
- Ensure Prisma client is a singleton

### Logging

Enable Prisma query logging:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Health Check Endpoint

Add `/api/health/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "healthy", database: "connected" });
  } catch (error) {
    return NextResponse.json(
      { status: "unhealthy", database: "disconnected" },
      { status: 503 }
    );
  }
}
```

---

## Quick Start Checklist

- [ ] Install dependencies: `npm install prisma @prisma/client bcryptjs jsonwebtoken`
- [ ] Create `.env.local` with `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Run migrations: `npx prisma migrate dev --name init`
- [ ] (Optional) Seed database: `npx prisma db seed`
- [ ] Start development server: `npm run dev`
- [ ] Test health endpoint: `curl http://localhost:3000/api/health`

---

## Support

For issues specific to:
- **Prisma**: [prisma.io/docs](https://www.prisma.io/docs)
- **NeonDB**: [neon.tech/docs](https://neon.tech/docs)
- **PostgreSQL**: [postgresql.org/docs](https://www.postgresql.org/docs/)
