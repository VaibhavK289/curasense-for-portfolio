import { NextRequest, NextResponse } from "next/server";

// Medicine backend URL (separate from the main CuraSense backend)
const MEDICINE_BACKEND_URL =
  process.env.MEDICINE_API_URL || "http://127.0.0.1:8002";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const response = await fetch(`${MEDICINE_BACKEND_URL}/analyze-image`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying medicine analyze-image request:", error);
    return NextResponse.json(
      { detail: "Failed to analyze medicine image." },
      { status: 500 }
    );
  }
}
