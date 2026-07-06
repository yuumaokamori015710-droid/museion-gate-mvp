import { updateProfile } from "@/lib/actions";
import { incomeRanges, userTypes } from "@/lib/constants";
import { getSessionProfile } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/field";

export default async function ProfilePage() {
  const { profile } = await getSessionProfile();
  const p = profile as Profile;

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <p className="text-sm font-semibold text-gold">Identity</p>
      <h1 className="mt-1 text-3xl font-bold">Identity — プロフィール</h1>
      <p className="mt-2 text-sm text-ink/60">あなたの知的関心、実績、次に向かいたい方向を表します。</p>
      <Card className="mt-8">
        <form action={updateProfile} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="表示名"><input className={inputClass} name="display_name" defaultValue={p.display_name || ""} required /></Field>
            <Field label="アイコン画像URL"><input className={inputClass} name="avatar_url" defaultValue={p.avatar_url || ""} /></Field>
            <Field label="属性">
              <select className={inputClass} name="user_type" defaultValue={p.user_type || "会社員"}>
                {userTypes.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="学びの所属・卒業校"><input className={inputClass} name="university" defaultValue={p.university || ""} /></Field>
            <Field label="現在の所属"><input className={inputClass} name="company" defaultValue={p.company || ""} /></Field>
            <Field label="役割・専門領域"><input className={inputClass} name="job_title" defaultValue={p.job_title || ""} /></Field>
            <Field label="経済的実績の参考情報">
              <select className={inputClass} name="income_range" defaultValue={p.income_range || "未回答"}>
                {incomeRanges.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="匿名投稿時の肩書き"><input className={inputClass} name="anonymous_title" defaultValue={p.anonymous_title || ""} /></Field>
          </div>
          <Field label="関心領域" hint="カンマ区切りで入力"><input className={inputClass} name="interests" defaultValue={(p.interests || []).join(", ")} /></Field>
          <Field label="実績・制作・研究・意思決定"><textarea className={inputClass} name="bio" rows={5} defaultValue={p.bio || ""} /></Field>
          <Field label="実績確認URL"><input className={inputClass} name="social_url" defaultValue={p.social_links?.url || ""} placeholder="LinkedIn / Wantedly / researchmap / GitHub / ポートフォリオ" /></Field>
          <p className="text-xs leading-6 text-ink/50">
            経済的実績などの審査情報は運営確認用です。公開プロフィールには表示されません。
          </p>
          <Button type="submit">保存する</Button>
        </form>
      </Card>
    </div>
  );
}
