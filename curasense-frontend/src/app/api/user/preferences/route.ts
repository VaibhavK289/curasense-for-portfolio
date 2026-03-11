import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/db/auth";

// ============================================
// GET USER PREFERENCES
// ============================================

export async function GET(request: NextRequest) {
  try {
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

    // Get or create preferences
    let preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.userPreference.create({
        data: { userId },
      });
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// ============================================
// UPDATE USER PREFERENCES
// ============================================

export async function PATCH(request: NextRequest) {
  try {
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
    const body = await request.json();

    // Validate allowed fields
    const allowedFields = [
      "anonymousMode",
      "trackHistory",
      "shareAnalytics",
      "theme",
      "language",
      "timezone",
      "dateFormat",
      "emailNotifications",
      "pushNotifications",
      "reportReadyAlerts",
      "weeklyDigest",
      "dashboardLayout",
      "showQuickStats",
      "showRecentActivity",
      "defaultReportType",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Upsert preferences
    const preferences = await prisma.userPreference.upsert({
      where: { userId },
      update: updateData,
      create: { userId, ...updateData },
    });

    // Log activity if not in anonymous mode
    if (!preferences.anonymousMode) {
      await prisma.userActivity.create({
        data: {
          userId,
          type: "settings_updated",
          title: "Settings Updated",
          description: "User preferences were updated",
          metadata: { updatedFields: Object.keys(updateData) },
        },
      });
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
