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
    // not logged in -> go to login and come back to /gallery after
    redirect("/login?redirectTo=/gallery");
  }

  const email = user.email ?? "unknown";

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Top nav */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <div className="text-sm font-semibold tracking-tight">
              S3 Bucket Gallery
            </div>
            <p className="text-xs text-zinc-500">
              Logged in as{" "}
              <span className="font-mono text-zinc-700">{email}</span>
            </p>
          </div>

          <form action="/api/auth/sign-out" method="post">
            <button
              type="submit"
              className="rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-xs font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Page body */}
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <GalleryClient />
      </section>
    </main>
  );
}
