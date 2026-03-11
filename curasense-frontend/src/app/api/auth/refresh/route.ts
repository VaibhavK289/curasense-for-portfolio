import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/db/auth";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not provided" },
        { status: 401 }
      );
    }

    const tokens = await refreshAccessToken(refreshToken);

    if (!tokens) {
      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      message: "Token refreshed",
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    });

    // Update refresh token cookie
    response.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Token refresh failed";
    
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: message },
      { status: 401 }
    );
  }
}
