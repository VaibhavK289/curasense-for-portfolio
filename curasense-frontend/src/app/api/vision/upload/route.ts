import { NextRequest, NextResponse } from "next/server";

// Vision backend URL - server-side only (runtime env var, NOT NEXT_PUBLIC_)
const VISION_URL =
  process.env.BACKEND_VISION_URL ||
  process.env.NEXT_PUBLIC_ML_API ||
  "http://localhost:8001";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Forward multipart form data to vision backend
    const response = await fetch(`${VISION_URL}/input-image/`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying vision upload request:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload image",
      },
      { status: 500 }
    );
  }
}
