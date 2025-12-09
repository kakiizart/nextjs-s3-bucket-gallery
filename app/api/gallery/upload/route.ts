// app/api/gallery/upload/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !serviceKey) throw new Error("Missing SUPABASE env vars");

    const supabase = createClient(url, serviceKey);

    const form = await req.formData();
    const bucket = String(form.get("bucket") || "").trim();

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket is required" },
        { status: 400 }
      );
    }

    const files = form.getAll("files") as File[];
    if (!files.length) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = file.name.split(".").pop() || "bin";
      const path = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("UPLOAD ERROR", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
