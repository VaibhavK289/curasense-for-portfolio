"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, KeyRound, Check, X, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FloatingOrb } from "@/components/ui/aceternity";
import { springPresets } from "@/styles/tokens/animations";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface PasswordStrength {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
}

function getPasswordStrength(password: string): PasswordStrength {
  return {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const requirements = [
    { key: "hasMinLength", label: "At least 8 characters", met: strength.hasMinLength },
    { key: "hasUpperCase", label: "Uppercase letter", met: strength.hasUpperCase },
    { key: "hasLowerCase", label: "Lowercase letter", met: strength.hasLowerCase },
    { key: "hasNumber", label: "Number", met: strength.hasNumber },
  ];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-2 space-y-1"
    >
      {requirements.map((req) => (
        <div
          key={req.key}
          className={cn(
            "flex items-center gap-2 text-xs transition-colors",
            req.met ? "text-[hsl(var(--color-success))]" : "text-[hsl(var(--muted-foreground))]"
          )}
        >
          {req.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {req.label}
        </div>
      ))}
    </motion.div>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  
  const token = searchParams?.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [success, setSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setIsValidToken(true);
          setMaskedEmail(data.email);
        }
      } catch {
        // Token is invalid
      }
      setIsValidating(false);
    };

    validateToken();
  }, [token]);

  const validateForm = (): string | null => {
    if (!password) return "Password is required";
    
    const strength = getPasswordStrength(password);
    if (!strength.hasMinLength) return "Password must be at least 8 characters";
    if (!strength.hasUpperCase) return "Password must contain an uppercase letter";
    if (!strength.hasLowerCase) return "Password must contain a lowercase letter";
    if (!strength.hasNumber) return "Password must contain a number";
    
    if (password !== confirmPassword) return "Passwords do not match";
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(token, password);
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } else {
      setError(result.error || "Failed to reset password");
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <div className="h-8 w-8 border-2 border-[hsl(var(--brand-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[hsl(var(--muted-foreground))]">Validating reset link...</p>
        </Card>
      </div>
    );
  }

  // Invalid token
  if (!token || !isValidToken) {
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
          className="w-full max-w-md relative z-10"
        >
          <Card className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--color-error)/0.1)] flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-[hsl(var(--color-error))]" />
            </div>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
              Invalid or Expired Link
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <div className="space-y-3">
              <Link href="/forgot-password">
                <Button className="w-full">Request New Link</Button>
              </Link>
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

  // Success state
  if (success) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--color-success)/0.1)] flex items-center justify-center">
            <Check className="h-8 w-8 text-[hsl(var(--color-success))]" />
          </div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
            Password Reset Successfully!
          </h2>
          <p className="text-[hsl(var(--muted-foreground))]">
            Redirecting you to login...
          </p>
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
              <KeyRound className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Reset your password
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Create a new password for{" "}
              <span className="font-medium text-[hsl(var(--foreground))]">{maskedEmail}</span>
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

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrengthIndicator password={password} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-[hsl(var(--color-error))]">Passwords do not match</p>
              )}
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
                  Resetting...
                </span>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[hsl(var(--brand-primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
