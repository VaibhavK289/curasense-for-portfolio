import { NextRequest, NextResponse } from "next/server";

// Medicine backend URL (separate from the main CuraSense backend)
const MEDICINE_BACKEND_URL =
  process.env.MEDICINE_API_URL || "http://127.0.0.1:8002";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${MEDICINE_BACKEND_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying medicine recommend request:", error);
    return NextResponse.json(
      { detail: "Failed to get medicine recommendations." },
      { status: 500 }
    );
  }
}
