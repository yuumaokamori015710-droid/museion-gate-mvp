import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function UserPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { supabase } = await getSessionProfile();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  const user = data as Profile | null;

  if (!user) return <div className="p-8">ユーザーが見つかりません。</div>;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <Card>
        <p className="text-sm font-semibold text-gold">{user.user_type}</p>
        <h1 className="mt-2 text-3xl font-bold">{user.display_name}</h1>
        <div className="mt-5 grid gap-2 text-sm text-ink/70">
          <p>{user.company || user.university} {user.job_title ? `/ ${user.job_title}` : ""}</p>
          <p>関心領域: {(user.interests || []).join(", ") || "未設定"}</p>
        </div>
        <p className="mt-6 whitespace-pre-wrap leading-8 text-ink/75">{user.bio}</p>
      </Card>
    </div>
  );
}
