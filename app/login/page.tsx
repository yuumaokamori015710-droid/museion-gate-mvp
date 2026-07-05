import { redirect } from "next/navigation";
import { sendMagicLink, signIn, signUp } from "@/lib/actions";
import { getSessionProfile } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/field";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sent?: string; email?: string }> }) {
  const { sent, email } = await searchParams;
  const { user } = await getSessionProfile();
  if (user) redirect("/app");

  return (
    <main className="grid min-h-screen place-items-center bg-smoke px-5 py-12">
      <div className="w-full max-w-4xl">
        <Link href="/" className="text-sm font-bold tracking-[0.22em] text-navy">
          MUSEION Gate
        </Link>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="bg-white">
            <p className="text-sm font-semibold text-gold">Passwordless Entry</p>
            <h1 className="mt-2 text-3xl font-bold">メールだけでGateへ。</h1>
            <p className="mt-3 text-sm leading-7 text-ink/65">
              パスワードは不要です。登録済みのメールアドレスに届くリンクを押すだけで、MUSEION Gateに入れます。
            </p>
            {sent ? (
              <div className="mt-6 rounded-md border border-gold/30 bg-gold/10 p-4 text-sm leading-7 text-ink/75">
                <span className="font-bold">{email || "入力したメールアドレス"}</span> にログインリンクを送りました。
                メールを開いて、リンクから続けてください。
              </div>
            ) : null}
            <form action={sendMagicLink} className="mt-6 grid gap-4">
              <Field label="メールアドレス">
                <input className={inputClass} name="email" type="email" placeholder="you@example.com" defaultValue={email || ""} required />
              </Field>
              <Button type="submit">ログインリンクを送る</Button>
            </form>
          </Card>

          <div className="grid gap-5">
            <Card className="bg-navy text-white">
              <h2 className="text-2xl font-bold">初めての方へ</h2>
              <p className="mt-2 text-sm leading-7 text-white/70">
                メールリンクで入った後、Gate申請に進みます。学歴や年収だけでなく、探究心・実績・次の一手をもとに審査します。
              </p>
            </Card>

            <Card>
              <h2 className="text-xl font-bold">パスワードでログイン</h2>
              <p className="mt-2 text-sm text-ink/60">既にパスワードを設定しているメンバー向けです。</p>
              <form action={signIn} className="mt-5 grid gap-4">
                <Field label="メールアドレス">
                  <input className={inputClass} name="email" type="email" required />
                </Field>
                <Field label="パスワード">
                  <input className={inputClass} name="password" type="password" minLength={6} required />
                </Field>
                <Button type="submit" variant="secondary">パスワードで入る</Button>
              </form>
            </Card>

            <Card>
              <h2 className="text-xl font-bold">パスワード登録</h2>
              <form action={signUp} className="mt-5 grid gap-4">
                <Field label="表示名">
                  <input className={inputClass} name="display_name" required />
                </Field>
                <Field label="メールアドレス">
                  <input className={inputClass} name="email" type="email" required />
                </Field>
                <Field label="パスワード">
                  <input className={inputClass} name="password" type="password" minLength={6} required />
                </Field>
                <Button type="submit" variant="secondary">
                  登録してGate申請へ
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
