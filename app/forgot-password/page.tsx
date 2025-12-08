"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

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
      const { error } = await supabaseBrowser.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );

      if (error) {
        console.error("[forgot-password] Supabase error (dev only):", error);

        // Dev-friendly behaviour: still pretend success to the user
        setMsg(
          "If an account exists for this email, you'll receive a password reset link."
        );
        setLoading(false);
        return;
      }

      setMsg(
        "If an account exists for this email, you'll receive a password reset link."
      );
    } catch (err) {
      console.error("[forgot-password] Network error:", err);
      setError("Something went wrong sending the reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold">Forgot password</h1>

        <label className="block text-sm">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        {msg && <p className="text-sm text-blue-600">{msg}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
