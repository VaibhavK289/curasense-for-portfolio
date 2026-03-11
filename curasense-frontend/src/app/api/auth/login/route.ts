import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/db/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") ||
                      "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;

    const { user, tokens } = await authenticateUser({
      email,
      password,
      ipAddress,
      userAgent,
    });

    // Don't return sensitive data
    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };

    const response = NextResponse.json({
      message: "Login successful",
      user: safeUser,
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    });

    // Set refresh token as HTTP-only cookie
    response.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    
    console.error("Login error:", error);
    return NextResponse.json(
      { error: message },
      { status: 401 }
    );
  }
}
