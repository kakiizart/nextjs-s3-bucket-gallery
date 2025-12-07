// app/api/buckets/list/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!url || !serviceKey) throw new Error("Missing SUPABASE env vars");

    const supabase = createClient(url, serviceKey);

    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    const buckets =
      data?.map((b) => ({
        id: b.id,
        name: b.name,
      })) ?? [];

    return NextResponse.json(buckets);
  } catch (err: any) {
    console.error("LIST BUCKETS ERROR", err);
    return NextResponse.json(
      { error: err.message || "Failed to list buckets" },
      { status: 500 }
    );
  }
}
