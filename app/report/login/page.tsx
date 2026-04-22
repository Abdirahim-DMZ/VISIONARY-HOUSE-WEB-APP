"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isStrapiConfigured } from "@/lib/strapi";

export default function ReportLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const configured = isStrapiConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/report-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json?.error || "Invalid email or password");
        return;
      }
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirect = params?.get("redirect")?.trim();
      const safe = redirect && redirect.startsWith("/report") && !redirect.startsWith("/report/login") ? redirect : "/report";
      router.replace(safe);
      router.refresh();
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-10 sm:py-14">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center justify-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Admin sign in</CardTitle>
            <CardDescription>Sign in with your admin email and password to open the reports page.</CardDescription>
          </CardHeader>
          <CardContent>
            {!configured ? (
              <p className="text-sm text-muted-foreground">Login is currently unavailable. Please contact support.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="report-admin-email" className="text-sm text-muted-foreground">
                    Email
                  </label>
                  <Input
                    id="report-admin-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="report-admin-password" className="text-sm text-muted-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="report-admin-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  Sign in
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
