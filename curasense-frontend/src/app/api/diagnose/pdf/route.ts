import { NextRequest, NextResponse } from "next/server";

// Backend URL - server-side only (not NEXT_PUBLIC_)
const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_FRONTEND_API || "http://localhost:8000";

// Max duration for serverless platforms (300s for Docker/Azure, 60s on Vercel hobby)
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    
    // Create AbortController with 300 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 300 seconds
    
    // Forward the request to the backend with extended timeout
    const response = await fetch(`${BACKEND_URL}/diagnose/pdf/`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    // Get the response data
    const data = await response.json();

    // Return the response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying PDF diagnosis request:", error);
    return NextResponse.json(
      { 
        status: "error", 
        error: error instanceof Error ? error.message : "Failed to analyze PDF" 
      },
      { status: 500 }
    );
  }
}
