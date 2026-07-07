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
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          display_name:
            user.user_metadata?.display_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "メンバー",
          status: "pending",
          updated_at: new Date().toISOString()
        }, { onConflict: "id", ignoreDuplicates: true });

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
