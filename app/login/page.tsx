import { redirect } from "next/navigation";
import { sendMagicLink } from "@/lib/actions";
import { getSessionProfile } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/field";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sent?: string; email?: string; error?: string }> }) {
  const { sent, email, error } = await searchParams;
  const { user } = await getSessionProfile();
  if (user) redirect("/app");

  return (
    <main className="grid min-h-screen place-items-center bg-smoke px-5 py-12">
      <div className="w-full max-w-4xl">
        <Link href="/" className="text-sm font-bold tracking-[0.22em] text-navy">
          MUSEION Gate
        </Link>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
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
            {error ? (
              <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-900">
                ログインリンクを送れませんでした。メールアドレスを確認して、もう一度お試しください。
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
                メールリンクで入った後、新規登録に進みます。学びの軌跡、実績、探究心、次の一手をもとに審査します。
                学歴や収入は参考情報として扱い、表側には出しません。
              </p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
