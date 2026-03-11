"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, LogIn, Eye, EyeOff, UserCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GradientText, FloatingOrb } from "@/components/ui/aceternity";
import { CuraSenseLogo } from "@/components/ui/logo";
import { springPresets } from "@/styles/tokens/animations";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, continueAsGuest } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      // Force a refresh to update server components and auth state
      router.refresh();
      // Small delay to ensure auth state is propagated before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push("/");
    } else {
      setError(result.error || "Login failed. Please check your credentials and try again.");
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    router.push("/");
  };

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
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] mx-auto mb-4">
              <CuraSenseLogo className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Welcome back
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Sign in to your <GradientText>CuraSense</GradientText> account
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
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password"
                  className="text-xs text-[hsl(var(--brand-primary))] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
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
                  Signing in...
                </span>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[hsl(var(--border))]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[hsl(var(--card))] px-3 text-[hsl(var(--muted-foreground))]">
                  or
                </span>
              </div>
            </div>

            {/* Guest Mode Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 group relative overflow-hidden"
              size="lg"
              onClick={handleGuestMode}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-primary)/0.05)] to-[hsl(var(--brand-secondary)/0.05)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <UserCircle2 className="h-4 w-4 text-[hsl(var(--brand-primary))]" />
              <span>Continue as Guest</span>
              <Sparkles className="h-3 w-3 text-[hsl(var(--accent-amber))] ml-1" />
            </Button>

            <p className="text-xs text-center text-[hsl(var(--muted-foreground))] mt-3">
              Try all features without creating an account.
              <br />
              Your data won&apos;t be saved to cloud.
            </p>
          </form>
        </Card>

        {/* Sign up link */}
        <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-6">
          Don&apos;t have an account?{" "}
          <Link 
            href="/register" 
            className="text-[hsl(var(--brand-primary))] hover:underline font-medium"
          >
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
