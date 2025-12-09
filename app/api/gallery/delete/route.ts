// app/api/gallery/delete/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { bucket, path } = await req.json();

    const bucketName = String(bucket || "").trim();
    const objectPath = String(path || "").trim();

    if (!bucketName || !objectPath) {
      return NextResponse.json(
        { error: "Bucket and path are required" },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !serviceKey) throw new Error("Missing SUPABASE env vars");

    const supabase = createClient(url, serviceKey);

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([objectPath]);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE ERROR", err);
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: 500 }
    );
  }
}
