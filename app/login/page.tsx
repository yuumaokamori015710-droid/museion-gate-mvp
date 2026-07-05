import { redirect } from "next/navigation";
import { signIn, signUp } from "@/lib/actions";
import { getSessionProfile } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/field";
import Link from "next/link";

export default async function LoginPage() {
  const { user } = await getSessionProfile();
  if (user) redirect("/app");

  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-5xl">
        <Link href="/" className="text-sm font-bold tracking-[0.22em] text-navy">
          MUSEION Gate
        </Link>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Card>
            <h1 className="text-2xl font-bold">ログイン</h1>
            <p className="mt-2 text-sm text-ink/60">Gateを通過したメンバーはこちらから入室できます。</p>
            <form action={signIn} className="mt-6 grid gap-4">
              <Field label="メールアドレス">
                <input className={inputClass} name="email" type="email" required />
              </Field>
              <Field label="パスワード">
                <input className={inputClass} name="password" type="password" minLength={6} required />
              </Field>
              <Button type="submit">ログイン</Button>
            </form>
          </Card>
          <Card className="bg-navy text-white">
            <h2 className="text-2xl font-bold">新規登録</h2>
            <p className="mt-2 text-sm text-white/70">アカウント作成後、Gate申請へ進みます。</p>
            <form action={signUp} className="mt-6 grid gap-4">
              <Field label="表示名">
                <input className={inputClass} name="display_name" required />
              </Field>
              <Field label="メールアドレス">
                <input className={inputClass} name="email" type="email" required />
              </Field>
              <Field label="パスワード">
                <input className={inputClass} name="password" type="password" minLength={6} required />
              </Field>
              <Button type="submit" className="bg-white text-ink hover:bg-smoke">
                登録してGate申請へ
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}
