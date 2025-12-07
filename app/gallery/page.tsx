// app/gallery/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GalleryClient } from "./gallery-client";

export default async function GalleryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/gallery");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur dark:bg-zinc-900/70">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">S3 Bucket Gallery</h1>
            <p className="text-xs text-zinc-500">
              Logged in as <span className="font-mono">{user.email}</span>
            </p>
          </div>
          <form action="/api/auth/sign-out" method="post">
            <button
              type="submit"
              className="rounded-full border px-3 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <GalleryClient />
      </main>
    </div>
  );
}
