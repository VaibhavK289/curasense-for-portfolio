import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/db/auth";

// ============================================
// GET USER ACTIVITY FEED
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

    // Check if user has anonymous mode enabled
    const preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (preferences?.anonymousMode || preferences?.trackHistory === false) {
      return NextResponse.json({
        activities: [],
        message: "Activity tracking is disabled in anonymous mode",
        anonymousMode: true,
      });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type");

    // Build where clause
    const where: Record<string, unknown> = { userId };
    if (type) {
      where.type = type;
    }

    // Fetch activities
    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.userActivity.count({ where }),
    ]);

    return NextResponse.json({
      activities,
      total,
      hasMore: offset + activities.length < total,
      anonymousMode: false,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

// ============================================
// CREATE ACTIVITY (Internal use)
// ============================================

export async function POST(request: NextRequest) {
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

    // Check anonymous mode
    const preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (preferences?.anonymousMode || preferences?.trackHistory === false) {
      return NextResponse.json({
        success: true,
        message: "Activity not tracked (anonymous mode)",
      });
    }

    const body = await request.json();
    const { type, title, description, entityType, entityId, metadata } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: "Type and title are required" },
        { status: 400 }
      );
    }

    const activity = await prisma.userActivity.create({
      data: {
        userId,
        type,
        title,
        description,
        entityType,
        entityId,
        metadata: metadata || {},
      },
    });

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE ALL ACTIVITY (for anonymous mode)
// ============================================

export async function DELETE(request: NextRequest) {
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

    // Delete all user activities
    const result = await prisma.userActivity.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: "All activity history has been cleared",
    });
  } catch (error) {
    console.error("Error deleting activities:", error);
    return NextResponse.json(
      { error: "Failed to delete activities" },
      { status: 500 }
    );
  }
}
