import { NextResponse } from "next/server";

// Cleanup old sessions and temporary data
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In development, allow without auth
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  try {
    const prismaModule = await import("@/lib/prisma");
    const prisma = prismaModule.default;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Delete expired sessions
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // Delete old audit logs (keep 30 days)
    const deletedAuditLogs = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    // Archive old reports (soft delete after 30 days of inactivity)
    const archivedReports = await prisma.report.updateMany({
      where: {
        status: "COMPLETED",
        updatedAt: {
          lt: thirtyDaysAgo,
        },
        archivedAt: null,
      },
      data: {
        archivedAt: now,
        status: "ARCHIVED",
      },
    });

    // Delete unverified users older than 7 days
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        emailVerified: false,
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    const result = {
      success: true,
      timestamp: now.toISOString(),
      cleaned: {
        sessions: deletedSessions.count,
        auditLogs: deletedAuditLogs.count,
        archivedReports: archivedReports.count,
        unverifiedUsers: deletedUsers.count,
      },
    };

    console.log("[CRON] Cleanup completed:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CRON] Cleanup failed:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
