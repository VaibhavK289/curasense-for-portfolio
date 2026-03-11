import { NextRequest, NextResponse } from "next/server";

// Medicine backend URL (separate from the main CuraSense backend)
const MEDICINE_BACKEND_URL =
  process.env.MEDICINE_API_URL || "http://127.0.0.1:8002";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const response = await fetch(
      `${MEDICINE_BACKEND_URL}/medicine/${encodeURIComponent(name)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying medicine lookup request:", error);
    return NextResponse.json(
      { detail: "Failed to fetch medicine information." },
      { status: 500 }
    );
  }
}
