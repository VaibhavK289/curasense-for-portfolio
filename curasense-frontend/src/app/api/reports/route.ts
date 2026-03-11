import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/db/auth";
import { createReport, getReportsByUser, ReportFilters, PaginationOptions } from "@/lib/db/reports";
import { ReportType, FileType } from "@/generated/prisma";

// Middleware to verify JWT token
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

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") as ReportType | null;
    const status = searchParams.get("status") || undefined;

    const filters: ReportFilters = {
      type: type || undefined,
      status: status as ReportFilters["status"],
    };
    
    const pagination: PaginationOptions = {
      page,
      limit,
    };

    const result = await getReportsByUser(user.id, filters, pagination);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch reports";
    console.error("Get reports error:", error);
    
    if (message.includes("authorization") || message.includes("token")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    const body = await request.json();

    const {
      title,
      description,
      type,
      originalFileName,
      fileType,
      fileSizeBytes,
      fileUrl,
      fileHash,
    } = body;

    // Validation
    if (!title || !type) {
      return NextResponse.json(
        { error: "Missing required fields: title, type" },
        { status: 400 }
      );
    }

    // Validate enums
    const validTypes: ReportType[] = ["XRAY", "CT_SCAN", "MRI", "PRESCRIPTION", "TEXT_ANALYSIS", "MEDICINE_COMPARISON"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if (fileType) {
      const validFileTypes: FileType[] = ["PDF", "IMAGE_PNG", "IMAGE_JPEG", "IMAGE_WEBP", "TEXT"];
      if (!validFileTypes.includes(fileType)) {
        return NextResponse.json(
          { error: `Invalid fileType. Must be one of: ${validFileTypes.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const report = await createReport({
      userId: user.id,
      title,
      description,
      type,
      originalFileName,
      fileType,
      fileSizeBytes,
      fileUrl,
      fileHash,
    });

    return NextResponse.json({
      message: "Report created successfully",
      report,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create report";
    console.error("Create report error:", error);

    if (message.includes("authorization") || message.includes("token")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    if (message.includes("duplicate")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
