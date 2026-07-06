import Link from "next/link";
import { submitApplication } from "@/lib/actions";
import { incomeRanges, interests, userTypes } from "@/lib/constants";
import { getSessionProfile } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/field";

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ submitted?: string; error?: string }> }) {
  const { submitted, error } = await searchParams;
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
            MUSEION Gateは、知性、探究心、実績、次の一手をもとに信頼を保つ審査制コミュニティです。
            学歴や収入は参考情報の一部として扱い、公開プロフィールには出しません。
          </p>
        </div>
        <Card className="mt-8">
          <form action={submitApplication} className="grid gap-5">
            {error === "db_setup" ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-900">
                Supabaseのテーブルがまだ作成されていないため、申請を保存できませんでした。
                SQL EditorでセットアップSQLを実行してから、もう一度送信してください。
              </div>
            ) : null}
            <div className="rounded-md border border-gold/25 bg-gold/10 p-4 text-sm leading-7 text-ink/75">
              <span className="font-bold text-ink">審査で見るもの:</span> 本人性、学びの軌跡、職業・制作・研究などの実績、
              深く考えている問い、そしてコミュニティへ持ち込める視点です。
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="氏名"><input className={inputClass} name="full_name" defaultValue={profile?.full_name || ""} required /></Field>
              <Field label="表示名"><input className={inputClass} name="display_name" defaultValue={profile?.display_name || user?.user_metadata?.display_name || ""} required /></Field>
              <Field label="メールアドレス"><input className={inputClass} name="email" type="email" defaultValue={profile?.email || user?.email || ""} required /></Field>
              <Field label="現在の属性">
                <select className={inputClass} name="user_type" defaultValue={profile?.user_type || "会社員"}>
                  {userTypes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="学びの所属・卒業校"><input className={inputClass} name="university" defaultValue={profile?.university || ""} placeholder="大学、大学院、研究機関など" /></Field>
              <Field label="現在の所属"><input className={inputClass} name="company" defaultValue={profile?.company || ""} placeholder="勤務先、事業名、所属組織など" /></Field>
              <Field label="役割・専門領域"><input className={inputClass} name="job_title" defaultValue={profile?.job_title || ""} placeholder="職種、役職、研究領域など" /></Field>
              <Field label="経済的実績の参考情報">
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
            <Field label="これまでの実績・制作・研究・意思決定"><textarea className={inputClass} name="bio" rows={4} defaultValue={profile?.bio || ""} required /></Field>
            <Field label="いま深く考えている問い / 次の一手"><textarea className={inputClass} name="purpose" rows={4} defaultValue={profile?.purpose || ""} required /></Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="招待コード"><input className={inputClass} name="invitation_code" defaultValue={profile?.invitation_code || ""} /></Field>
              <Field label="実績確認URL"><input className={inputClass} name="social_url" type="url" placeholder="LinkedIn / Wantedly / researchmap / GitHub / ポートフォリオ" /></Field>
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
