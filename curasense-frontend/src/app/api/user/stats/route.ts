import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/db/auth";

// ============================================
// GET USER STATS FOR DASHBOARD
// ============================================

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = payload.id;

    // Get user stats or create if doesn't exist
    let userStats = await prisma.userStats.findUnique({
      where: { userId },
    });

    if (!userStats) {
      // Create stats by aggregating from reports
      const reportCounts = await prisma.report.groupBy({
        by: ["type"],
        where: { userId, deletedAt: null },
        _count: true,
      });

      const totalReports = await prisma.report.count({
        where: { userId, deletedAt: null },
      });

      const avgMetrics = await prisma.report.aggregate({
        where: { userId, deletedAt: null, status: "COMPLETED" },
        _avg: {
          confidenceScore: true,
          processingTimeMs: true,
        },
      });

      const prescriptionCount = reportCounts.find(r => r.type === "PRESCRIPTION")?._count || 0;
      const imagingCount = reportCounts.filter(r => 
        ["XRAY", "CT_SCAN", "MRI"].includes(r.type)
      ).reduce((sum, r) => sum + r._count, 0);
      const medicineCount = reportCounts.find(r => r.type === "MEDICINE_COMPARISON")?._count || 0;

      userStats = await prisma.userStats.create({
        data: {
          userId,
          totalReports,
          prescriptionReports: prescriptionCount,
          imagingReports: imagingCount,
          medicineQueries: medicineCount,
          avgConfidenceScore: avgMetrics._avg.confidenceScore,
          avgProcessingTime: avgMetrics._avg.processingTimeMs,
          lastActiveAt: new Date(),
        },
      });
    } else {
      // Update last active timestamp
      await prisma.userStats.update({
        where: { userId },
        data: { lastActiveAt: new Date() },
      });
    }

    // Get recent activity count (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentReportsCount = await prisma.report.count({
      where: {
        userId,
        createdAt: { gte: weekAgo },
        deletedAt: null,
      },
    });

    // Get success rate
    const completedReports = await prisma.report.count({
      where: { userId, status: "COMPLETED", deletedAt: null },
    });
    const failedReports = await prisma.report.count({
      where: { userId, status: "FAILED", deletedAt: null },
    });
    const successRate = completedReports + failedReports > 0
      ? Math.round((completedReports / (completedReports + failedReports)) * 100)
      : 100;

    return NextResponse.json({
      stats: {
        totalReports: userStats.totalReports,
        prescriptionReports: userStats.prescriptionReports,
        imagingReports: userStats.imagingReports,
        medicineQueries: userStats.medicineQueries,
        avgConfidenceScore: userStats.avgConfidenceScore 
          ? Math.round(userStats.avgConfidenceScore * 100) / 100 
          : null,
        avgProcessingTime: userStats.avgProcessingTime
          ? Math.round(userStats.avgProcessingTime / 1000) 
          : null, // in seconds
        successRate,
        recentReportsCount,
        streakDays: userStats.streakDays,
        lastActiveAt: userStats.lastActiveAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
