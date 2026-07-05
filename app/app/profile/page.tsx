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
      <p className="mt-2 text-sm text-ink/60">あなたの現在地、関心領域、次に向かいたい方向を表します。</p>
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
            <Field label="大学名"><input className={inputClass} name="university" defaultValue={p.university || ""} /></Field>
            <Field label="勤務先"><input className={inputClass} name="company" defaultValue={p.company || ""} /></Field>
            <Field label="職種"><input className={inputClass} name="job_title" defaultValue={p.job_title || ""} /></Field>
            <Field label="年収レンジ">
              <select className={inputClass} name="income_range" defaultValue={p.income_range || "未回答"}>
                {incomeRanges.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="匿名投稿時の肩書き"><input className={inputClass} name="anonymous_title" defaultValue={p.anonymous_title || ""} /></Field>
          </div>
          <Field label="関心領域" hint="カンマ区切りで入力"><input className={inputClass} name="interests" defaultValue={(p.interests || []).join(", ")} /></Field>
          <Field label="自己紹介"><textarea className={inputClass} name="bio" rows={5} defaultValue={p.bio || ""} /></Field>
          <Field label="SNSリンク"><input className={inputClass} name="social_url" defaultValue={p.social_links?.url || ""} /></Field>
          <label className="flex items-center gap-2 text-sm text-ink/65">
            <input type="checkbox" name="show_income" defaultChecked={Boolean(p.show_income)} />
            年収レンジをプロフィールで公開する
          </label>
          <Button type="submit">保存する</Button>
        </form>
      </Card>
    </div>
  );
}
