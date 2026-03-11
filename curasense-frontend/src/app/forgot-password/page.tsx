"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Mail, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FloatingOrb } from "@/components/ui/aceternity";
import { springPresets } from "@/styles/tokens/animations";
import { useAuth } from "@/lib/auth-context";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(email);
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Failed to send reset email");
    }
  };

  if (success) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <FloatingOrb 
          className="w-64 h-64 -top-32 -left-32 opacity-20" 
          delay={0} 
          color="brand-primary"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springPresets.smooth}
          className="w-full max-w-md relative z-10"
        >
          <Card className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--color-success)/0.1)] flex items-center justify-center">
              <Check className="h-8 w-8 text-[hsl(var(--color-success))]" />
            </div>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
              Check your email
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-6">
              If an account exists for <span className="font-medium text-[hsl(var(--foreground))]">{email}</span>, 
              we&apos;ve sent a password reset link.
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
              The link will expire in 1 hour. Check your spam folder if you don&apos;t see it.
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
              >
                Try another email
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="w-full gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      {/* Background */}
      <FloatingOrb 
        className="w-64 h-64 -top-32 -left-32 opacity-20" 
        delay={0} 
        color="brand-primary"
      />
      <FloatingOrb 
        className="w-48 h-48 -bottom-24 -right-24 opacity-20" 
        delay={2} 
        color="brand-secondary"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.smooth}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Link */}
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <Card className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] mx-auto mb-4">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Forgot password?
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              No worries, we&apos;ll send you reset instructions
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-[hsl(var(--color-error)/0.1)] border border-[hsl(var(--color-error)/0.2)] text-sm text-[hsl(var(--color-error))]"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full gap-2" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Remember your password?{" "}
              <Link 
                href="/login" 
                className="text-[hsl(var(--brand-primary))] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
