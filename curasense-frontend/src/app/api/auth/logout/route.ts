import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/lib/db/auth";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    const response = NextResponse.json({
      message: "Logged out successfully",
    });

    // Clear refresh token cookie
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    
    // Still clear the cookie even if server-side logout fails
    const response = NextResponse.json({
      message: "Logged out",
    });

    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  }
}
