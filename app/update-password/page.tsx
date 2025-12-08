"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Make sure we have a valid recovery session
  useEffect(() => {
    async function checkSession() {
      try {
        const {
          data: { user },
          error,
        } = await supabaseBrowser.auth.getUser();

        if (error || !user) {
          console.warn("[update-password] No valid recovery session:", error);
          setError(
            "Your reset link may have expired. Please request a new one from the forgot password page."
          );
        }
      } catch (err: any) {
        console.error("[update-password] Error checking session:", err);
        setError(
          "Your reset link may have expired. Please request a new one from the forgot password page."
        );
      } finally {
        setChecking(false);
      }
    }

    void checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabaseBrowser.auth.updateUser({
        password,
      });

      if (error) {
        console.error("[update-password] Supabase error:", error);
        setError(error.message || "Failed to update password.");
        return;
      }

      setMsg("Password updated successfully. Redirecting to login…");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      console.error("[update-password] NETWORK ERROR:", err);
      setError("Something went wrong updating your password.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Checking reset link…</p>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16 md:py-24">
      <div className="w-full max-w-sm rounded-[calc(var(--radius)+1.25rem)] border border-zinc-200 bg-white p-6 shadow-md">
        <h1 className="mb-1 text-xl font-semibold">Set a new password</h1>
        <p className="mb-5 text-sm text-zinc-500">
          Enter your new password below.
        </p>

        {error && (
          <p className="mb-3 text-xs text-red-600" aria-live="assertive">
            {error}
          </p>
        )}

        {!error && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            {msg && (
              <p className="text-xs text-blue-600" aria-live="polite">
                {msg}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Updating…" : "Update password"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
