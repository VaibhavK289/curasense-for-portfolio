import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/db/auth";

// Email sending function (placeholder - integrate with your email service)
async function sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  // In production, use a service like SendGrid, AWS SES, Resend, etc.
  // For now, log to console for development
  console.log(`
    ========================================
    PASSWORD RESET EMAIL
    ========================================
    To: ${email}
    Subject: Reset your CuraSense password
    
    Hello ${firstName},
    
    We received a request to reset your password.
    Click the link below to set a new password:
    
    ${resetUrl}
    
    This link expires in 1 hour.
    
    If you didn't request this, please ignore this email.
    
    - CuraSense Team
    ========================================
  `);
  
  // TODO: Implement actual email sending
  // Example with Resend:
  // await resend.emails.send({
  //   from: 'CuraSense <noreply@curasense.com>',
  //   to: email,
  //   subject: 'Reset your CuraSense password',
  //   html: `...`,
  // });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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

    const result = await createPasswordResetToken(email);
    
    // Always return success even if email doesn't exist (security best practice)
    if (result) {
      await sendPasswordResetEmail(result.user.email, result.token, result.user.firstName);
    }

    return NextResponse.json({
      message: "If an account with that email exists, we've sent a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
