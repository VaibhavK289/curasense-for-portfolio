import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/db/auth";
import { getReportStats, getDailyUsage } from "@/lib/db/reports";

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);
  
  if (!payload) {
    throw new Error("Invalid token");
  }
  
  return payload;
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);

    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam) : 30;

    const [stats, dailyUsage] = await Promise.all([
      getReportStats(user.id),
      getDailyUsage(user.id, days),
    ]);

    return NextResponse.json({
      stats,
      dailyUsage,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch analytics";
    console.error("Get analytics error:", error);

    if (message.includes("authorization") || message.includes("token")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
