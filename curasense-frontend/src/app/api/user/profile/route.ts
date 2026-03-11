import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, updateUserProfile } from "@/lib/db/auth";

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);
  
  if (!payload) {
    throw new Error("Invalid token");
  }
  
  return payload;
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    
    // Get full user profile from database
    const { default: prisma } = await import("@/lib/prisma");
    
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    console.error("Get profile error:", error);

    if (message.includes("authorization") || message.includes("token")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    const body = await request.json();

    const updatedUser = await updateUserProfile(user.id, body);

    // Return safe user data
    const safeUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      displayName: updatedUser.displayName,
      phone: updatedUser.phone,
      avatarUrl: updatedUser.avatarUrl,
      preferences: updatedUser.preferences,
    };

    return NextResponse.json({
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    console.error("Update profile error:", error);

    if (message.includes("authorization") || message.includes("token")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
