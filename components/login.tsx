"use client";

import { LogoIcon } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/gallery";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // success: go where middleware wanted us to go
    router.push(redirectTo);
  }

  async function handleMagicLink() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);

    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${redirectTo}`,
      },
    });

    setLoading(false);

    if (error) setError(error.message);
    else setInfo("Magic link sent! Check your email.");
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        className="bg-card mx-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+1.25rem)] border border-0.5 shadow-md dark:[color-muted:var(--color-zinc-900)]"
        onSubmit={handleLogin}
      >
        <div className="px-7 pb-6 pt-8">
          <div className="mb-1 mt-4 flex items-center gap-2">
            <Link href="/" aria-label="go home">
              <LogoIcon />
            </Link>
          </div>
          <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Sign in to continue
          </p>

          <div className="mt-6 space-y-4">
            {/* EMAIL */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium underline"
                >
                  Forgot your Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {info && <p className="text-sm text-green-600">{info}</p>}

            {/* SIGN IN */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* MAGIC LINK */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={handleMagicLink}
            >
              Send Magic Link
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold underline">
              Create account
            </Link>
          </p>
        </div>
      </form>
    </section>
  );
}
