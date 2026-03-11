import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// PrismaClient singleton pattern for Next.js
// Prevents multiple instances in development due to hot reloading
// Uses lazy initialization to avoid build-time DATABASE_URL requirement

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
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : ["error"],
  });
}

// Lazy getter: PrismaClient is only created on first access (at runtime),
// not at module load time (which happens during `next build`).
function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Use a Proxy so that `prisma.someMethod()` triggers lazy initialization
// while keeping the same import API: `import { prisma } from "@/lib/prisma"`
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getPrismaClient(), prop);
  },
});

export default prisma;
