import Link from "next/link";
import { submitApplication } from "@/lib/actions";
import { incomeRanges, interests, userTypes } from "@/lib/constants";
import { getSessionProfile } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/field";

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const { submitted } = await searchParams;
  const { user, profile } = await getSessionProfile();

  if (submitted) {
    return (
      <main className="grid min-h-screen place-items-center bg-smoke px-5">
        <Card className="max-w-xl text-center">
          <p className="text-sm font-semibold text-gold">Gate Application</p>
          <h1 className="mt-3 text-3xl font-bold">Gate申請を受け付けました。</h1>
          <p className="mt-4 text-sm leading-7 text-ink/65">審査完了までお待ちください。承認後、MUSEION Gateのコミュニティに参加できます。</p>
          <Link href="/login" className="mt-6 inline-flex rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white">
            ログインする
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="bg-smoke px-5 py-10 md:py-14">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-bold tracking-[0.22em] text-navy">
          MUSEION Gate
        </Link>
        <div className="mt-8">
          <p className="text-sm font-semibold text-gold">Gate Application</p>
          <h1 className="mt-2 text-4xl font-bold">Gate申請</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/65">
            MUSEION Gateは審査制コミュニティです。あなたの現在地、関心領域、次に向かいたい方向をもとに審査を行います。
          </p>
        </div>
        <Card className="mt-8">
          <form action={submitApplication} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="氏名"><input className={inputClass} name="full_name" defaultValue={profile?.full_name || ""} required /></Field>
              <Field label="表示名"><input className={inputClass} name="display_name" defaultValue={profile?.display_name || user?.user_metadata?.display_name || ""} required /></Field>
              <Field label="メールアドレス"><input className={inputClass} name="email" type="email" defaultValue={profile?.email || user?.email || ""} required /></Field>
              <Field label="現在の属性">
                <select className={inputClass} name="user_type" defaultValue={profile?.user_type || "会社員"}>
                  {userTypes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="大学名"><input className={inputClass} name="university" defaultValue={profile?.university || ""} /></Field>
              <Field label="勤務先"><input className={inputClass} name="company" defaultValue={profile?.company || ""} /></Field>
              <Field label="職種"><input className={inputClass} name="job_title" defaultValue={profile?.job_title || ""} /></Field>
              <Field label="年収レンジ">
                <select className={inputClass} name="income_range" defaultValue={profile?.income_range || "未回答"}>
                  {incomeRanges.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">関心領域</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {interests.map((item) => (
                  <label key={item} className="flex items-center gap-2 rounded-md border border-line bg-smoke px-3 py-2 text-sm">
                    <input type="checkbox" name="interests" value={item} defaultChecked={profile?.interests?.includes(item)} />
                    {item}
                  </label>
                ))}
              </div>
            </div>
            <Field label="自己紹介"><textarea className={inputClass} name="bio" rows={4} defaultValue={profile?.bio || ""} required /></Field>
            <Field label="次に向かいたい方向"><textarea className={inputClass} name="purpose" rows={4} defaultValue={profile?.purpose || ""} required /></Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="招待コード"><input className={inputClass} name="invitation_code" defaultValue={profile?.invitation_code || ""} /></Field>
              <Field label="LinkedIn / Wantedly / X / ポートフォリオURL"><input className={inputClass} name="social_url" type="url" placeholder="https://" /></Field>
            </div>
            <label className="flex items-start gap-3 text-sm text-ink/70">
              <input className="mt-1" type="checkbox" required />
              利用規約・プライバシーポリシーに同意します。
            </label>
            <Button type="submit" className="w-full md:w-fit">Gateに申請する</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
