"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Shield, Users, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useAuth";
import { useStaffLogin } from "@/hooks/useAuthStaff";
import { cn } from "@/lib/utils";
import { getApiBaseUrl, getApiErrorMessage, isApiUrlConfigured } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";

type LoginMode = "admin" | "staff";

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [apiMisconfigured, setApiMisconfigured] = useState(false);
  const adminLogin = useLogin();
  const staffLogin = useStaffLogin();
  const activeLogin = mode === "admin" ? adminLogin : staffLogin;

  // A deployed build with no NEXT_PUBLIC_API_URL points every request at the
  // visitor's own machine, so no password will ever work. Say it on screen
  // instead of leaving people to retry their credentials.
  useEffect(() => {
    setApiMisconfigured(
      !isApiUrlConfigured() && window.location.hostname !== "localhost",
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "admin") {
      adminLogin.mutate({ email, password });
    } else {
      staffLogin.mutate({ email, password });
    }
  };

  const isLoading = adminLogin.isPending || staffLogin.isPending;

  // Waiting with no explanation is what makes a slow API read as a frozen
  // app. After a few seconds, say what is being waited on.
  useEffect(() => {
    if (!isLoading) {
      setIsSlow(false);
      return;
    }
    const timer = setTimeout(() => setIsSlow(true), 4000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // The toast disappears on its own; the failure has to stay readable while
  // the person decides what to do about it.
  const errorMessage = activeLogin.error
    ? getApiErrorMessage(activeLogin.error, "Invalid email or password.")
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:px-6 lg:px-8 overflow-hidden relative selection:bg-foreground selection:text-background">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="w-full max-w-sm space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-lg flex items-center justify-center mb-4 shadow-sm overflow-hidden bg-background border border-border">
            <Image
              src="/assets/logo.jpeg"
              alt="Company logo"
              width={48}
              height={48}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access the account
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 sm:p-8 space-y-6">
          {/* Segmented Control */}
          <div className="grid grid-cols-2 p-1 bg-muted/50 rounded-lg border border-border/50 relative">
            <button
              onClick={() => {
                setMode("admin");
                setEmail("");
                setPassword("");
                adminLogin.reset();
                staffLogin.reset();
              }}
              className={cn(
                "relative z-10 flex items-center justify-center gap-2 py-1.5 text-sm font-medium transition-colors duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                mode === "admin"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => {
                setMode("staff");
                setEmail("");
                setPassword("");
                adminLogin.reset();
                staffLogin.reset();
              }}
              className={cn(
                "relative z-10 flex items-center justify-center gap-2 py-1.5 text-sm font-medium transition-colors duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                mode === "staff"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff</span>
            </button>

            {/* Sliding Indicator */}
            <motion.div
              className="absolute inset-y-1 rounded-md bg-background border border-border shadow-sm z-0"
              layoutId="active-tab"
              initial={false}
              animate={{
                x: mode === "admin" ? 4 : "100%",
                width: "calc(50% - 8px)",
                left: mode === "admin" ? 0 : 4,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>

          {/* Configuration problem: no password can work until this is fixed */}
          {apiMisconfigured && (
            <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                This site has no API address configured, so sign-in cannot
                reach the server. Set NEXT_PUBLIC_API_URL in the deployment
                and redeploy.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="h-10 bg-background/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Password
                </Label>
                <Link
                  href={`/forgot-password?mode=${mode}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="h-10 pr-10 bg-background/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  tabIndex={-1}
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
              className="w-full h-10 font-medium transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3 w-3 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            {isLoading && isSlow && (
              <p
                className="text-center text-xs text-muted-foreground"
                aria-live="polite"
              >
                Still waiting for {getApiBaseUrl()} to respond...
              </p>
            )}

            {!isLoading && errorMessage && (
              <div
                role="alert"
                className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link
            href="/terms-of-service"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
