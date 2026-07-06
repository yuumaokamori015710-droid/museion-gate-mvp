import { ArrowRight, Brain, Compass, DoorOpen, Eye, ShieldCheck, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";

const values = [
  ["次の一手が見える", "キャリア、起業、副業、投資、学びの意思決定ログに触れられます。", Eye],
  ["本音のキャリア意思決定に触れられる", "表向きの成功談ではなく、迷いと判断のプロセスを共有します。", Brain],
  ["探究と実践の仲間につながる", "次に向かう方向が近い人と、静かで濃い接点を持てます。", Users],
  ["審査制だからノイズが少ない", "知性、実績、探究心、貢献可能性をもとに信頼を保ちます。", ShieldCheck]
];

const steps = ["新規登録", "審査", "承認", "Agora / Stoa / Symposiaへの参加"];

const community = [
  "学び続ける学生・大学院生",
  "次の一手を考えるプロフェッショナル",
  "事業・研究・制作の実績を持つ人",
  "起業家・起業準備者",
  "専門性を深める実践者",
  "海外MBA・留学を検討する人",
  "AI・スタートアップ・投資を探究する人"
];

export default function LandingPage() {
  return (
    <main className="bg-smoke">
      <section className="relative min-h-[92vh] overflow-hidden bg-[#0d1422] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(168,137,82,0.22),transparent_30%),linear-gradient(135deg,#0d1422_0%,#172236_48%,#0b0d12_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-smoke to-transparent" />
        <div className="relative mx-auto grid min-h-[92vh] max-w-6xl content-center px-5 py-20 md:px-8">
          <p className="mb-5 text-sm font-semibold tracking-[0.28em] text-white/70">MUSEION Gate</p>
          <h1 className="max-w-4xl font-serif text-5xl leading-tight md:text-7xl">知性が、次に動く入口。</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
            キャリア、起業、副業、投資、学び。知性と実績を持つ人の意思決定が見える、審査制コミュニティ。
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/58">
            肩書きや数字だけではなく、何を考え、どこへ向かうのか。その意思決定こそが、ここでの価値になります。
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/apply" className="bg-gold text-white shadow-lg shadow-black/20 hover:bg-[#856229]">
              新規登録 <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink href="/login" variant="secondary" className="border-white/35 bg-white/12 text-white hover:bg-white/20">
              ログインする
            </ButtonLink>
          </div>
        </div>
      </section>

      <Section className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div>
          <p className="text-sm font-semibold text-gold">Concept</p>
          <h2 className="mt-2 text-3xl font-bold text-ink">現代のムセイオンへ。</h2>
        </div>
        <p className="text-sm leading-8 text-ink/68">
          かつてムセイオンは、知性と探究が集まる場所でした。MUSEION Gateは、その現代版です。
          キャリア、起業、副業、投資、学びに向き合う人たちが、次の一手を共有し、互いの意思決定から学ぶためのクローズドコミュニティです。
        </p>
      </Section>

      <section className="border-y border-line bg-[#f6efe4]">
        <Section>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gold">Value</p>
              <h2 className="mt-2 text-3xl font-bold text-ink">クローズドな信頼が、思考の密度を上げる。</h2>
            </div>
            <Compass className="hidden text-navy md:block" size={34} />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {values.map(([title, body, Icon]) => (
              <Card key={String(title)} className="shadow-none">
                <Icon className="mb-5 text-gold" size={24} />
                <h3 className="font-bold">{title as string}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/65">{body as string}</p>
              </Card>
            ))}
          </div>
        </Section>
      </section>

      <Section className="grid gap-10 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-gold">How it works</p>
          <h2 className="mt-2 text-3xl font-bold">Gateを通り、知的社交場へ。</h2>
          <div className="mt-6 grid gap-3">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-4 border-b border-line pb-4">
                <span className="flex size-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">{index + 1}</span>
                <span className="text-lg font-bold">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gold">Community</p>
          <h2 className="mt-2 text-3xl font-bold">誰が集まるのか</h2>
          <p className="mt-4 text-sm leading-7 text-ink/65">
            MUSEION Gateには、知性、探究心、実績、次の一手を持ち寄れる人たちが集まります。
            学歴や収入は審査要素の一部に留め、表側では信頼と貢献の文脈で扱います。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {community.map((member) => (
              <span key={member} className="rounded-full border border-line bg-[#fffaf2] px-4 py-2 text-sm font-semibold">
                {member}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <section className="bg-[#0d1422] text-white">
        <Section className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold text-gold">Gate</p>
            <h2 className="mt-2 text-4xl font-bold">Gateの先へ。</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              次に何を考え、どこへ動くのか。MUSEION Gateで、あなたの次の一手を見つけてください。
            </p>
          </div>
          <ButtonLink href="/apply" className="bg-gold text-white shadow-lg shadow-black/20 hover:bg-[#856229]">
            <DoorOpen size={16} /> 新規登録
          </ButtonLink>
        </Section>
      </section>
    </main>
  );
}
