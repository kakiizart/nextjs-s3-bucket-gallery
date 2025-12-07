"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { error } = await supabaseBrowser.auth.updateUser({ password });

    setBusy(false);

    if (error) setError(error.message);
    else router.push("/gallery");
  }

  return (
    <form
      className="flex min-h-svh items-center justify-center p-6"
      onSubmit={handleSubmit}
    >
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
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

        <Button className="w-full" type="submit" disabled={busy}>
          {busy ? "Updating..." : "Update password"}
        </Button>
      </div>
    </form>
  );
}
