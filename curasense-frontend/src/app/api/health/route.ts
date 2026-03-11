import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startTime = Date.now();

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: "connected",
          latency: `${dbLatency}ms`,
        },
      },
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        services: {
          database: {
            status: "disconnected",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
        environment: process.env.NODE_ENV,
      },
      { status: 503 }
    );
  }
}
