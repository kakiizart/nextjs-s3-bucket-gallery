"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setError(null);

    const { data, error } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/gallery`,
      },
    });

    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      setMsg("Check your email to confirm your account.");
      // or router.push("/gallery") if you don't require confirmation
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}

      <Button className="w-full" type="submit" disabled={busy}>
        {busy ? "Creating account..." : "Sign Up"}
      </Button>

      <p className="text-center text-sm">
        Already have an account?{" "}
        <button
          type="button"
          className="underline"
          onClick={() => router.push("/login")}
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
