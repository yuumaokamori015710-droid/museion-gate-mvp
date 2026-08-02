import Link from "next/link";
import { AdmissionTestRunner } from "@/components/admission-test";
import { Card } from "@/components/ui/card";

export default function AdmissionTestPage() {
  return (
    <main className="min-h-screen bg-smoke px-5 py-10 md:py-14">
      <div className="mx-auto max-w-3xl">
        <Link href="/apply" className="text-sm font-bold tracking-[0.22em] text-navy">
          MUSEION Gate
        </Link>
        <div className="mt-8">
          <p className="text-sm font-semibold text-gold">Membership Test</p>
          <h1 className="mt-2 text-4xl font-bold">入会IQテスト</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/65">
            完全会員制の信頼を保つための短時間テストです。結果は新規登録フォームの審査項目に自動反映されます。
          </p>
        </div>
        <Card className="mt-8">
          <AdmissionTestRunner />
        </Card>
      </div>
    </main>
  );
}
