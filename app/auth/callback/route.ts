import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  let redirectPath = "/apply";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("status")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.status === "approved") redirectPath = "/app";
        else if (profile?.status === "pending") redirectPath = "/pending";
      }
    }
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
