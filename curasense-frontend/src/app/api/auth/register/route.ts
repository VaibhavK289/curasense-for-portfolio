import { NextRequest, NextResponse } from "next/server";
import { createUser, RegisterInput } from "@/lib/db/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { email, password, firstName, lastName, phone, dateOfBirth } = body;
    
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Email, password, first name, and last name are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const input: RegisterInput = {
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    };

    const user = await createUser(input);

    // Don't return password hash
    const { passwordHash: _omit, ...safeUser } = user as typeof user & { passwordHash: string };
    void _omit; // Suppress unused variable warning

    return NextResponse.json(
      { 
        message: "User registered successfully",
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    
    if (message === "Email already registered") {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
