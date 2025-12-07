// app/api/auth/sign-up/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const { email, password } = await req.json();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // where Supabase will send email confirmation / magic link
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/update-password`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ user: data.user });
}
