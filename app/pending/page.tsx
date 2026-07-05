import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PendingPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <Card className="max-w-xl text-center">
        <p className="text-sm font-semibold text-gold">Gate Application</p>
        <h1 className="mt-3 text-3xl font-bold">現在、Gate申請を審査中です。</h1>
        <p className="mt-4 text-sm leading-7 text-ink/65">承認後、MUSEION Gateのコミュニティに参加できます。</p>
        <ButtonLink href="/" variant="secondary" className="mt-6">
          トップへ戻る
        </ButtonLink>
      </Card>
    </main>
  );
}
