import { NextRequest, NextResponse } from "next/server";

// Vision backend URL - server-side only (runtime env var, NOT NEXT_PUBLIC_)
const VISION_URL =
  process.env.BACKEND_VISION_URL ||
  process.env.NEXT_PUBLIC_ML_API ||
  "http://localhost:8001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // The vision backend returns a streaming response — we proxy it as-is
    const response = await fetch(`${VISION_URL}/vision-answer/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Vision backend returned ${response.status}` },
        { status: response.status }
      );
    }

    // Stream the response through to the client
    const stream = response.body;
    if (!stream) {
      return NextResponse.json(
        { error: "No response body from vision backend" },
        { status: 502 }
      );
    }

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error proxying vision answer request:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get answer",
      },
      { status: 500 }
    );
  }
}
