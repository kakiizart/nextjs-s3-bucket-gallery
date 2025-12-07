// app/api/buckets/create/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    const bucketName = String(name || "").trim();
    if (!bucketName) {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !serviceKey) throw new Error("Missing SUPABASE env vars");

    const supabase = createClient(url, serviceKey);

    // Public true so your old vanilla app keeps working too.
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: true,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true, name: bucketName });
  } catch (err: any) {
    console.error("CREATE BUCKET ERROR", err);
    return NextResponse.json(
      { error: err.message || "Failed to create bucket" },
      { status: 500 }
    );
  }
}
