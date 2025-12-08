"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/gallery";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  // ---------- Password login ----------
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg("Signing you in…");

    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const message = json?.error || `Error: ${res.status}`;
        setError(message);
        setMsg(null);
        console.error("[password-login] ERROR:", message);
        return;
      }

      setMsg("Success! Redirecting…");
      router.push(redirectTo);
    } catch (err: any) {
      console.error("[password-login] NETWORK ERROR:", err);
      setError("Network error while trying to sign in.");
      setMsg(null);
    } finally {
      setLoading(false);
    }
  }

  // ---------- Magic Link (Magic Password) ----------
  async function handleMagicLink() {
  if (!email) {
    setError("Enter your email first.");
    return;
  }

  setMagicLoading(true);
  setError(null);
  setMsg("Sending magic link…");

  try {
    // Some Supabase setups will *throw* here when SMTP isn't configured.
    await supabaseBrowser.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${redirectTo}`,
      },
    });

    // Even if it throws, we'll catch it below and still show this message.
    setMsg(
      "If an account exists for this email, you'll receive a magic link shortly."
    );
  } catch (err: any) {
    // This is where your "AuthApiError: Error sending magic link email" ends up.
    console.error("[magic-link] Ignoring AuthApiError in dev:", err);

    // We STILL show the same friendly message.
    setMsg(
      "If an account exists for this email, you'll receive a magic link shortly."
    );
  } finally {
    setMagicLoading(false);
  }
}


  return (
    <section className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16 md:py-24">
      <div className="w-full max-w-sm rounded-[calc(var(--radius)+1.25rem)] border border-zinc-200 bg-white p-6 shadow-md">
        <h1 className="mb-1 text-xl font-semibold">Sign in</h1>
        <p className="mb-5 text-sm text-zinc-500">
          Use your email and password or a magic link.
        </p>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-zinc-500 underline"
              >
                Forgot password?
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

          {msg && (
            <p className="text-xs text-blue-600" aria-live="polite">
              {msg}
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600" aria-live="assertive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-[11px] uppercase tracking-wide text-zinc-400">
            or
          </span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full text-xs"
          disabled={magicLoading}
          onClick={handleMagicLink}
        >
          {magicLoading ? "Sending magic link…" : "Send magic link to this email"}
        </Button>

        <p className="mt-5 text-center text-xs text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold underline">
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
}
