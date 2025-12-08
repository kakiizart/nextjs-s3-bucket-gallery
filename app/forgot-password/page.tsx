"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setMsg(null);
  setError(null);
  setLoading(true);

  try {
    await supabaseBrowser.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    // Even if SMTP is misconfigured and Supabase throws, we treat it as:
    setMsg(
      "If an account exists for this email, you'll receive a password reset link."
    );
  } catch (err: any) {
    console.error("[forgot-password] Ignoring AuthApiError in dev:", err);

    // Same friendly message – never leak whether the email exists or not.
    setMsg(
      "If an account exists for this email, you'll receive a password reset link."
    );
  } finally {
    setLoading(false);
  }
}


  return (
    <section className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16 md:py-24">
      <div className="w-full max-w-sm rounded-[calc(var(--radius)+1.25rem)] border border-zinc-200 bg-white p-6 shadow-md">
        <h1 className="mb-1 text-xl font-semibold">Reset your password</h1>
        <p className="mb-5 text-sm text-zinc-500">
          Enter the email associated with your account and we&apos;ll send you a
          reset link.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-zinc-500">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold underline">
            Go back to login
          </Link>
        </p>
      </div>
    </section>
  );
}
