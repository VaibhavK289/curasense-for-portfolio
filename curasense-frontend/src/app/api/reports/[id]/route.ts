import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/db/auth";
import {
  getReportById,
  updateReport,
  deleteReport,
  archiveReport,
} from "@/lib/db/reports";

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

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateRequest(request);
    const { id } = await params;

    const report = await getReportById(id, user.id);

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch report";
    console.error("Get report error:", error);

    if (message.includes("authorization") || message.includes("token")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateRequest(request);
    const { id } = await params;
    const body = await request.json();

    // First verify ownership
    const existingReport = await getReportById(id, user.id);
    if (!existingReport) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Only allow updating certain fields
    const allowedFields = ["title", "description", "summary", "content", "findings", "confidenceScore"];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const report = await updateReport(id, user.id, updateData);

    return NextResponse.json({
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update report";
    console.error("Update report error:", error);

    if (message.includes("authorization") || message.includes("token")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateRequest(request);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    // Verify ownership
    const existingReport = await getReportById(id, user.id);
    if (!existingReport) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    if (permanent) {
      // Hard delete - admin only in production
      await deleteReport(id, user.id, true);
      return NextResponse.json({
        message: "Report permanently deleted",
      });
    } else {
      // Soft delete (archive)
      await archiveReport(id, user.id);
      return NextResponse.json({
        message: "Report archived",
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete report";
    console.error("Delete report error:", error);

    if (message.includes("authorization") || message.includes("token")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
