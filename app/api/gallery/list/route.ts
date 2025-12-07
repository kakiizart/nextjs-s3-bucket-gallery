// app/api/gallery/list/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const bucket = urlObj.searchParams.get("bucket") || "";

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket is required" },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !serviceKey) throw new Error("Missing SUPABASE env vars");

    const supabase = createClient(url, serviceKey);

    const { data: objects, error } = await supabase.storage
      .from(bucket)
      .list("", {
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) throw error;

    const items =
      objects?.filter((o) => !o.name.endsWith("/")).map((obj) => ({
        name: obj.name,
        path: obj.name,
        createdAt: (obj as any).created_at ?? null,
        url: "",
      })) ?? [];

    const withUrls = await Promise.all(
      items.map(async (item) => {
        const { data, error: urlErr } = await supabase.storage
          .from(bucket)
          .createSignedUrl(item.path, 60 * 60);

        return {
          ...item,
          url: urlErr || !data?.signedUrl ? "" : data.signedUrl,
        };
      })
    );

    return NextResponse.json(withUrls);
  } catch (err: any) {
    console.error("LIST ERROR", err);
    return NextResponse.json(
      { error: err.message || "List failed" },
      { status: 500 }
    );
  }
}
