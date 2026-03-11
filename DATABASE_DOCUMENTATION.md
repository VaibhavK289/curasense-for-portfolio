# CuraSense Database Documentation

> **Database**: PostgreSQL (NeonDB Serverless)  
> **ORM**: Prisma 7+  
> **Version**: 1.0 | **Last Updated**: February 2026

---

## 📐 Architecture Overview

CuraSense uses a **serverless PostgreSQL** database via NeonDB, accessed through Prisma ORM:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js / Vercel)                         │
│                              Server Components                              │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRISMA CLIENT                                     │
│                      (Singleton Pattern + PrismaPg Adapter)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│   │   auth.ts   │    │ reports.ts  │    │  prisma.ts  │                     │
│   │             │    │             │    │             │                     │
│   │ • Register  │    │ • Create    │    │ • Singleton │                     │
│   │ • Login     │    │ • Update    │    │ • Pool Mgmt │                     │
│   │ • JWT       │    │ • Query     │    │ • Logging   │                     │
│   │ • Sessions  │    │ • Analytics │    │             │                     │
│   └─────────────┘    └─────────────┘    └─────────────┘                     │
│                                                                             │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEONDB (PostgreSQL)                               │
│                        Serverless • Auto-scaling                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  users   │  │ reports  │  │ sessions │  │audit_logs│  │analytics │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗃️ Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Report : creates
    User ||--o{ Session : has
    User ||--o{ AuditLog : generates
    User ||--o{ UserActivity : logs
    User ||--o| UserPreference : has
    User ||--o| UserStats : has
    User ||--o| HealthProfile : has
    User ||--o{ SavedMedicine : saves

    User {
        string id PK
        string email UK
        string passwordHash
        string firstName
        string lastName
        UserRole role
        UserStatus status
        datetime createdAt
    }

    Report {
        string id PK
        string userId FK
        string title
        ReportType type
        ReportStatus status
        string content
        float confidenceScore
        datetime createdAt
    }

    Session {
        string id PK
        string userId FK
        string token UK
        datetime expiresAt
    }

    AuditLog {
        string id PK
        string userId FK
        string action
        string resource
        datetime createdAt
    }
```

---

## 📊 Models Reference

### Core Models

| Model            | Description                                | Records     |
| ---------------- | ------------------------------------------ | ----------- |
| `User`           | User accounts with credentials and profile | Primary     |
| `Report`         | Medical analysis reports with AI results   | High volume |
| `Session`        | JWT refresh token sessions                 | Transient   |
| `AuditLog`       | HIPAA compliance action tracking           | Append-only |
| `AnalyticsDaily` | Pre-computed daily statistics              | Aggregated  |

### User-Related Models

| Model            | Description                       | Relationship  |
| ---------------- | --------------------------------- | ------------- |
| `UserPreference` | Settings and display preferences  | 1:1 with User |
| `UserActivity`   | Activity feed for dashboard       | 1:N with User |
| `UserStats`      | Aggregated user statistics        | 1:1 with User |
| `SavedMedicine`  | User's saved medications          | 1:N with User |
| `HealthProfile`  | Health information for AI context | 1:1 with User |

### Utility Models

| Model                | Description                      |
| -------------------- | -------------------------------- |
| `PasswordResetToken` | Forgot password token management |

---

## 🔢 Enums

### UserRole

```prisma
enum UserRole {
  PATIENT    // Default role for new users
  DOCTOR     // Healthcare provider
  ADMIN      // System administrator
}
```

### UserStatus

```prisma
enum UserStatus {
  ACTIVE                  // Normal access
  INACTIVE                // Disabled by user
  SUSPENDED               // Suspended by admin
  PENDING_VERIFICATION    // Email not verified
}
```

### ReportType

```prisma
enum ReportType {
  PRESCRIPTION          // Text/PDF prescription analysis
  XRAY                  // X-ray image analysis
  CT_SCAN               // CT scan analysis
  MRI                   // MRI analysis
  TEXT_ANALYSIS         // General text diagnosis
  MEDICINE_COMPARISON   // Drug comparison report
}
```

### ReportStatus

```prisma
enum ReportStatus {
  PENDING      // Queued for processing
  PROCESSING   // Currently being analyzed
  COMPLETED    // Successfully processed
  FAILED       // Processing failed
  ARCHIVED     // Archived by user
}
```

### FileType

```prisma
enum FileType {
  PDF
  IMAGE_PNG
  IMAGE_JPEG
  IMAGE_WEBP
  TEXT
}
```

---

## 📋 Model Details

### User Model

```prisma
model User {
  id                String      @id @default(cuid())

  // Credentials
  email             String      @unique
  passwordHash      String      @map("password_hash")

  // Profile
  firstName         String      @map("first_name")
  lastName          String      @map("last_name")
  displayName       String?     @map("display_name")
  avatarUrl         String?     @map("avatar_url")
  phone             String?
  dateOfBirth       DateTime?   @map("date_of_birth")

  // Role & Status
  role              UserRole    @default(PATIENT)
  status            UserStatus  @default(PENDING_VERIFICATION)

  // Security
  emailVerified     Boolean     @default(false)
  lastLoginAt       DateTime?
  failedLoginCount  Int         @default(0)
  lockedUntil       DateTime?

  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  deletedAt         DateTime?   // Soft delete

  // Relations
  reports           Report[]
  sessions          Session[]
  auditLogs         AuditLog[]
  userPreference    UserPreference?
  userStats         UserStats?
  healthProfile     HealthProfile?
}
```

**Indexes**: `email`, `status`, `role`, `createdAt`, `[lastName, firstName]`

---

### Report Model

```prisma
model Report {
  id                String        @id @default(cuid())
  userId            String        @map("user_id")

  // Report Info
  title             String
  description       String?
  type              ReportType
  status            ReportStatus  @default(PENDING)

  // File Metadata
  originalFileName  String?
  fileType          FileType?
  fileSizeBytes     Int?
  fileUrl           String?
  fileHash          String?       // SHA-256 for deduplication

  // Analysis Results
  summary           String?       @db.Text
  content           String?       @db.Text
  findings          String[]      @default([])

  // AI Metrics
  confidenceScore   Float?        // 0.0 - 1.0
  processingTimeMs  Int?
  aiModelVersion    String?

  // Error Handling
  errorMessage      String?
  errorCode         String?
  retryCount        Int           @default(0)

  // Timestamps
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  processedAt       DateTime?
  archivedAt        DateTime?
  deletedAt         DateTime?
}
```

**Indexes**: `userId`, `type`, `status`, `createdAt`, `[userId, type]`, `[userId, status]`, `[userId, createdAt DESC]`, `fileHash`

---

### Session Model

```prisma
model Session {
  id            String    @id @default(cuid())
  userId        String    @map("user_id")
  token         String    @unique
  userAgent     String?
  ipAddress     String?
  expiresAt     DateTime
  createdAt     DateTime  @default(now())
  lastActiveAt  DateTime  @default(now())
}
```

Used for JWT refresh token management with 30-day expiration.

---

### AuditLog Model

```prisma
model AuditLog {
  id          String    @id @default(cuid())
  userId      String?   @map("user_id")
  action      String    // "LOGIN", "REPORT_CREATE", "REPORT_VIEW"
  resource    String?   // "Report", "User", "Session"
  resourceId  String?
  details     Json?     @default("{}")
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime  @default(now())
}
```

**Purpose**: HIPAA compliance tracking for all user actions.

---

### HealthProfile Model

```prisma
model HealthProfile {
  id              String    @id @default(cuid())
  userId          String    @unique

  // Basic Health Info
  bloodType       String?
  height          Float?    // in cm
  weight          Float?    // in kg

  // Medical History Arrays
  allergies       String[]  @default([])
  conditions      String[]  @default([])  // chronic conditions
  medications     String[]  @default([])  // current medications

  // Lifestyle
  smokingStatus        String?
  alcoholConsumption   String?
  exerciseFrequency    String?

  // Emergency Contact
  emergencyContactName  String?
  emergencyContactPhone String?
}
```

**Purpose**: Provides context for AI analysis - better diagnostic accuracy.

---

## 🔐 Authentication Layer

### Password Handling

```typescript
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### JWT Token Management

```typescript
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

// Generate access token
export function generateAccessToken(user: UserPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

// Verify token
export function verifyAccessToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Database

    Client->>Server: POST /api/auth/login {email, password}
    Server->>Database: Find user by email
    Database-->>Server: User record
    Server->>Server: Verify password (bcrypt)
    Server->>Database: Create Session (refresh token)
    Server->>Database: Update lastLoginAt
    Server->>Database: Create AuditLog
    Server-->>Client: {accessToken, refreshToken}

    Note over Client,Server: Later requests...

    Client->>Server: GET /api/reports (Authorization: Bearer token)
    Server->>Server: Verify JWT
    Server->>Database: Fetch reports
    Database-->>Server: Reports
    Server-->>Client: Reports data
```

### Account Security

| Feature              | Implementation                        |
| -------------------- | ------------------------------------- |
| **Password Hashing** | bcrypt with 12 salt rounds            |
| **Account Lockout**  | 15 min lock after 5 failed attempts   |
| **Session Expiry**   | Access: 7 days, Refresh: 30 days      |
| **Soft Delete**      | Users are marked deleted, not removed |

---

## 📊 Report Operations

### Create Report

```typescript
export async function createReport(input: CreateReportInput): Promise<Report> {
  const report = await prisma.report.create({
    data: {
      userId: input.userId,
      title: input.title,
      type: input.type,
      status: ReportStatus.PENDING,
      originalFileName: input.originalFileName,
      fileHash: input.fileHash,
    },
  });

  // Audit log for HIPAA compliance
  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: "REPORT_CREATE",
      resource: "Report",
      resourceId: report.id,
    },
  });

  return report;
}
```

### Get Reports with Pagination

```typescript
export async function getReportsByUser(
  userId: string,
  filters?: ReportFilters,
  pagination?: PaginationOptions,
): Promise<PaginatedResult<Report>> {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.ReportWhereInput = {
    userId,
    deletedAt: null,
    ...(filters?.type && { type: filters.type }),
    ...(filters?.status && { status: filters.status }),
  };

  const [reports, total] = await Promise.all([
    prisma.report.findMany({ where, skip, take: limit }),
    prisma.report.count({ where }),
  ]);

  return {
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + reports.length < total,
    },
  };
}
```

### Report Analytics

```typescript
export async function getReportStats(userId: string) {
  const [totalReports, reportsByType, avgMetrics] = await Promise.all([
    prisma.report.count({ where: { userId, deletedAt: null } }),

    prisma.report.groupBy({
      by: ["type"],
      where: { userId, deletedAt: null },
      _count: { id: true },
    }),

    prisma.report.aggregate({
      where: { userId, status: "COMPLETED", deletedAt: null },
      _avg: {
        confidenceScore: true,
        processingTimeMs: true,
      },
    }),
  ]);

  return {
    totalReports,
    reportsByType: Object.fromEntries(
      reportsByType.map((r) => [r.type, r._count.id]),
    ),
    averageConfidence: avgMetrics._avg.confidenceScore ?? 0,
    averageProcessingTime: avgMetrics._avg.processingTimeMs ?? 0,
  };
}
```

---

## 🔧 Prisma Client Setup

### Singleton Pattern

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Create connection pool
  const pool = globalForPrisma.pool ?? new Pool({ connectionString });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  // Create Prisma adapter with the pool
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**Why Singleton?** Prevents connection pool exhaustion during Next.js hot reloading.

---

## 🔑 Environment Variables

### Required Variables

| Variable             | Example                                                          | Description                 |
| -------------------- | ---------------------------------------------------------------- | --------------------------- |
| `DATABASE_URL`       | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` | NeonDB pooled connection    |
| `JWT_SECRET`         | `your-64-char-secret...`                                         | JWT signing key (64+ chars) |
| `JWT_REFRESH_SECRET` | `your-64-char-refresh...`                                        | Refresh token signing key   |

### Optional Variables

| Variable              | Default       | Description                      |
| --------------------- | ------------- | -------------------------------- |
| `NODE_ENV`            | `development` | Environment mode                 |
| `PRISMA_DEBUG`        | `false`       | Enable Prisma query logging      |
| `DATABASE_URL_DIRECT` | -             | Direct connection for migrations |

### Connection String Format

```
postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require
```

**NeonDB Tips**:

- Use **pooled** connection (`-pooler`) for serverless
- Use **direct** connection for migrations
- Always include `?sslmode=require`

---

## 🚀 Database Commands

### NPM Scripts

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (development)
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Push schema changes (no migration)
npm run db:push

# Seed database with demo data
npm run db:seed

# Open Prisma Studio GUI
npm run db:studio

# Reset database (DANGER!)
npm run db:reset
```

### Manual Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_user_table

# Apply migrations in production
npx prisma migrate deploy

# View database in browser
npx prisma studio
```

---

## 🌱 Seed Data

The seed script creates demo accounts for testing:

```typescript
// Demo Credentials
Admin:   admin@curasense.com / admin123!
Doctor:  doctor@curasense.com / doctor123!
Patient: patient@curasense.com / patient123!
```

### Running Seed

```bash
npm run db:seed
```

### What Gets Created

- 3 users (Admin, Doctor, Patient)
- 2 sample reports (Blood test, X-ray)
- Associated user preferences and stats

---

## 📈 Performance Optimization

### Indexes

The schema includes 20+ indexes for common query patterns:

```prisma
// User queries
@@index([email])
@@index([status])
@@index([role])

// Report queries
@@index([userId])
@@index([type])
@@index([status])
@@index([userId, createdAt(sort: Desc)])

// Compound indexes for dashboard
@@index([userId, type])
@@index([userId, status])
```

### Query Optimization Tips

| Pattern    | Recommendation                             |
| ---------- | ------------------------------------------ |
| Pagination | Use `skip/take` with `orderBy`             |
| Counting   | Use `count()` separately from `findMany()` |
| Relations  | Use `select` to limit fields               |
| Large Text | Use `@db.Text` for content fields          |

### Connection Pooling

```typescript
// NeonDB recommended settings
const pool = new Pool({
  connectionString,
  max: 10, // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
```

---

## 🔒 Security Considerations

### HIPAA Compliance

| Requirement         | Implementation                         |
| ------------------- | -------------------------------------- |
| **Audit Trail**     | All actions logged in `AuditLog` table |
| **Access Control**  | Role-based (PATIENT, DOCTOR, ADMIN)    |
| **Data Encryption** | SSL/TLS for connections                |
| **Soft Delete**     | Data retained with `deletedAt` flag    |

### Best Practices

1. **Never log passwords** - Only store bcrypt hashes
2. **Use parameterized queries** - Prisma handles this automatically
3. **Validate input** - Use Zod or similar validation
4. **Limit session duration** - 7 day access, 30 day refresh
5. **Lock accounts** - After 5 failed login attempts

---

## 🔍 Troubleshooting

### Common Errors

| Error                         | Cause                | Solution                 |
| ----------------------------- | -------------------- | ------------------------ |
| `DATABASE_URL not set`        | Missing env variable | Check `.env` file        |
| `Connection refused`          | Database not running | Verify NeonDB status     |
| `Invalid token`               | Expired JWT          | Refresh or re-login      |
| `Unique constraint violation` | Duplicate email      | Check user exists first  |
| `P2025: Record not found`     | Invalid ID           | Validate ID before query |

### Debug Queries

Enable query logging in development:

```typescript
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
```

### Check Connection

```bash
npx ts-node prisma/test-connection.ts
```

---

## 📁 Directory Structure

```
curasense-database/
├── prisma/
│   ├── schema.prisma          # Database schema (478 lines)
│   └── migrations/            # Migration history
├── src/
│   └── lib/
│       ├── prisma.ts          # Prisma client singleton
│       └── db/
│           ├── auth.ts        # Authentication utilities
│           ├── reports.ts     # Report CRUD operations
│           └── index.ts       # Barrel exports
├── docs/
│   └── DATABASE_INTEGRATION.md
├── prisma.config.ts           # Prisma 7 configuration
├── package.json
└── README.md
```

---

## 🔗 Integration Example

### Using in Next.js API Route

```typescript
// app/api/reports/route.ts
import { prisma } from "@/lib/prisma";
import { getReportsByUser } from "@/lib/db/reports";
import { verifyAccessToken } from "@/lib/db/auth";

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const user = verifyAccessToken(token);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reports = await getReportsByUser(user.id, {}, { page: 1, limit: 10 });

  return Response.json(reports);
}
```

### Using in Server Component

```typescript
// app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const recentReports = await prisma.report.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return <ReportList reports={recentReports} />;
}
```

---

## 🔗 Related Documentation

- [ENV_DOCUMENTATION.md](ENV_DOCUMENTATION.md) - Environment variable reference
- [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md) - Backend API documentation
- [SYSTEM_CONTEXT.md](SYSTEM_CONTEXT.md) - High-level system architecture

---

**Maintainers**: CuraSense Team  
**License**: MIT
