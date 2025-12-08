"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoIcon } from "@/components/logo";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/gallery";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // -----------------------------
  // LOGIN (SERVER-ROUTE VERSION)
  // -----------------------------
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg("Submitting...");

    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || `Error: ${res.status}`);
        setMsg(null);
        return;
      }

      setMsg("Success! Redirecting…");
      router.push(redirectTo);
    } catch (err: any) {
      setError("Network error");
      setMsg(null);
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // MAGIC LINK LOGIN
  // -----------------------------
  async function handleMagicLink(e: React.FormEvent) {
  e.preventDefault();

  setMsg("Sending magic link…");
  setError(null);

  try {
    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email,
      options: {
        // Where Supabase will send the user after they click the magic link
        emailRedirectTo: `${window.location.origin}/gallery`,
      },
    });

    if (error) {
      console.error("[magic-link] Supabase error (dev only):", error);

      // In dev, we *still* show a friendly success message
      setMsg(
        "If an account exists for this email, you'll receive a magic link shortly."
      );
      return;
    }

    setMsg("Check your email for a magic link.");
  } catch (err) {
    console.error("[magic-link] Network error:", err);
    setError("Something went wrong sending the magic link.");
    setMsg(null);
  }
}

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <section className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">

      <form 
        onSubmit={handleLogin}
        className="bg-card mx-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+1.25rem)] border border-zinc-200 shadow-md dark:bg-zinc-900"
      >
        <div className="px-7 pb-6 pt-8">

          {/* LOGO */}
          <div className="mb-1 mt-2 flex items-center gap-2">
            <Link href="/" aria-label="go home">
              <LogoIcon />
            </Link>
          </div>

          {/* TITLE */}
          <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Sign in to continue.</p>

          {/* FORM FIELDS */}
          <div className="mt-6 space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs underline">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Messages */}
            {msg && <p className="text-blue-600 text-sm">{msg}</p>}
            {info && <p className="text-green-600 text-sm">{info}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* SIGN IN BUTTON */}
            <Button 
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* MAGIC LINK */}
            <button
  type="button"
  onClick={handleMagicLink}
  className="w-full rounded-md bg-black px-4 py-2 text-white"
>
  Send Magic Link
</button>

          </div>

          {/* FOOTER */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don’t have an account?{" "}
            <Link href="/signup" className="font-semibold underline">
              Create account
            </Link>
          </p>

        </div>
      </form>

    </section>
  );
}
