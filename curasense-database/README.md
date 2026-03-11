# CuraSense Database

PostgreSQL Database Layer for the CuraSense Healthcare AI Application.

## Overview

This package contains the complete database infrastructure for CuraSense, including:

- **Prisma Schema** - Database models for Users, Sessions, Reports, AuditLogs, and Analytics
- **Database Utilities** - Authentication, password hashing, JWT management
- **Report Operations** - CRUD operations with pagination, filtering, and analytics
- **HIPAA Compliance** - Audit logging for healthcare data tracking

## Structure

```
curasense-database/
├── prisma/
│   └── schema.prisma          # Database schema with 5 models, 5 enums, 20+ indexes
├── src/
│   └── lib/
│       ├── prisma.ts          # Prisma client singleton with PrismaPg adapter
│       └── db/
│           ├── auth.ts        # Authentication utilities
│           ├── reports.ts     # Report CRUD operations
│           └── index.ts       # Barrel exports
├── docs/
│   └── DATABASE_INTEGRATION.md # Comprehensive setup guide
├── prisma.config.ts           # Prisma 7 configuration
└── package.json               # Dependencies and scripts
```

## Quick Start

### 1. Install Dependencies

```bash
cd curasense-database
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/curasense"
JWT_SECRET="your-super-secure-jwt-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Run Migrations

```bash
npm run db:migrate
```

### 5. Open Prisma Studio (Optional)

```bash
npm run db:studio
```

## Database Models

| Model | Description |
|-------|-------------|
| `User` | User credentials, profile, role, and security settings |
| `Session` | JWT refresh token sessions with expiration |
| `Report` | Medical analysis reports with AI results |
| `AuditLog` | HIPAA compliance action tracking |
| `AnalyticsDaily` | Pre-computed daily statistics |

## Enums

- `UserRole`: PATIENT, DOCTOR, ADMIN
- `UserStatus`: ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION
- `ReportType`: PRESCRIPTION, XRAY, CT_SCAN, MRI, TEXT_ANALYSIS, MEDICINE_COMPARISON
- `ReportStatus`: PENDING, PROCESSING, COMPLETED, FAILED, ARCHIVED
- `FileType`: PDF, IMAGE_PNG, IMAGE_JPEG, IMAGE_WEBP, TEXT

## Scripts

| Script | Description |
|--------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations (development) |
| `npm run db:migrate:deploy` | Deploy migrations (production) |
| `npm run db:push` | Push schema changes without migrations |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:reset` | Reset database (development only) |

## Integration with Frontend

This database layer is designed to integrate with the CuraSense Next.js frontend. Import utilities as:

```typescript
import { prisma } from "@/lib/prisma";
import { 
  createUser, 
  authenticateUser, 
  createReport,
  getReportsByUser 
} from "@/lib/db";
```

## Documentation

See [docs/DATABASE_INTEGRATION.md](docs/DATABASE_INTEGRATION.md) for comprehensive setup instructions including:

- Local PostgreSQL setup
- NeonDB cloud setup
- Environment configuration
- Security considerations
- Performance optimization
- Troubleshooting guide

## License

MIT
