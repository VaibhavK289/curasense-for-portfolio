import { NextRequest, NextResponse } from "next/server";

// Backend URL - server-side only
const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_FRONTEND_API || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying compare request:", error);
    return NextResponse.json(
      { comparison: [] },
      { status: 500 }
    );
  }
}
