"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Question = {
  prompt: string;
  options: string[];
  answer: number;
};

type StoredResult = {
  score: string;
  detail: string;
  completedAt: string;
};

const storageKey = "museion-admission-test-result";
const secondsPerQuestion = 5;

const questions: Question[] = [
  { prompt: "「仮説」と「地図」に最も共通する機能は？", options: ["記録する", "方向づける", "隠す", "測量する"], answer: 1 },
  { prompt: "「緻密」に最も近い意味は？", options: ["大胆な", "細部まで整った", "一時的な", "騒がしい"], answer: 1 },
  { prompt: "17 + 24 - 9 ÷ 3 = ?", options: ["35", "38", "39", "42"], answer: 1 },
  { prompt: "8・2・9・4 を逆順にし、奇数だけ残すと？", options: ["29", "92", "94", "49"], answer: 1 },
  { prompt: "□ △ ○ / △ ○ □ / ○ □ ?", options: ["△", "○", "□", "×"], answer: 0 },
  { prompt: "「制度」と「文法」に最も共通するものは？", options: ["速度", "規則", "色彩", "数量"], answer: 1 },
  { prompt: "「曖昧」の反対に最も近いものは？", options: ["複雑", "明瞭", "静寂", "柔軟"], answer: 1 },
  { prompt: "36 ÷ 4 + 7 × 2 = ?", options: ["21", "23", "25", "32"], answer: 1 },
  { prompt: "7・1・8・3・6 を小さい順にし、2番目と4番目を読むと？", options: ["36", "37", "67", "73"], answer: 0 },
  { prompt: "B E J Q ?", options: ["X", "Y", "Z", "W"], answer: 2 },
  { prompt: "「顕微鏡」と「統計」に最も共通する役割は？", options: ["拡大して見る", "見えにくい構造を捉える", "音を測る", "距離を縮める"], answer: 1 },
  { prompt: "「暫定」と最も対になる語は？", options: ["仮説", "恒久", "局所", "未定"], answer: 1 },
  { prompt: "15%引きで850円。元の価格は？", options: ["950円", "1,000円", "1,050円", "1,100円"], answer: 1 },
  { prompt: "4・9・2・8 を逆順にし、偶数だけ残すと？", options: ["82", "28", "284", "842"], answer: 0 },
  { prompt: "● ▲ ▲ ■ / ▲ ■ ● / ■ ● ?", options: ["▲", "■", "●", "◆"], answer: 0 },
  { prompt: "「比喩」と「模型」に共通するものは？", options: ["本物を置き換えて理解を助ける", "必ず縮小する", "数字だけで表す", "結論を隠す"], answer: 0 },
  { prompt: "「演繹」に近い説明は？", options: ["事例から規則を作る", "規則から結論を導く", "感情を記録する", "偶然を待つ"], answer: 1 },
  { prompt: "48 - 6 × 5 + 18 ÷ 3 = ?", options: ["18", "22", "24", "30"], answer: 2 },
  { prompt: "9・4・7・1・8 を大きい順にし、3番目と5番目を読むと？", options: ["74", "41", "71", "84"], answer: 1 },
  { prompt: "○ ● ● △ / ● △ ○ / △ ○ ?", options: ["●", "△", "○", "□"], answer: 0 }
];

function readStoredResult(): StoredResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) as StoredResult : null;
  } catch {
    return null;
  }
}

function writeStoredResult(result: StoredResult) {
  window.sessionStorage.setItem(storageKey, JSON.stringify(result));
}

export function AdmissionTestResultField() {
  const [result, setResult] = useState<StoredResult | null>(null);

  useEffect(() => {
    setResult(readStoredResult());
  }, []);

  return (
    <div className="rounded-md border border-navy/15 bg-[#f8f2e8] p-4">
      <input type="hidden" name="admission_test_completed" value={result ? "1" : "0"} />
      <input type="hidden" name="admission_test_score" value={result?.score || "未受験"} />
      <input type="hidden" name="admission_test_detail" value={result?.detail || ""} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-gold">MEMBERSHIP TEST</p>
          <h2 className="mt-2 text-xl font-bold text-ink">入会IQテスト</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-ink/65">
            完全会員制の審査項目です。専用画面で20問の短時間テストを受けると、結果がここに自動入力されます。
          </p>
        </div>
        <div className="rounded-md border border-line bg-white px-4 py-3 text-sm">
          <span className="block text-xs font-bold text-ink/45">自動入力</span>
          <span className="mt-1 block text-lg font-bold text-ink">{result?.score || "未受験"}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href="/apply/test"
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy/90"
        >
          {result ? "入会IQテストを受け直す" : "入会IQテストを受ける"}
        </Link>
        {result ? <span className="text-sm font-semibold text-green-800">テスト完了済み</span> : null}
      </div>
    </div>
  );
}

export function AdmissionTestRunner() {
  const [phase, setPhase] = useState<"intro" | "testing" | "done">("intro");
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(secondsPerQuestion);
  const [correct, setCorrect] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  const question = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const detailValue = useMemo(
    () => `入会IQテスト: ${finalScore}/${questions.length}、制限時間: 1問${secondsPerQuestion}秒、問題数: ${questions.length}問`,
    [finalScore]
  );

  const finish = useCallback((score: number) => {
    setFinalScore(score);
    writeStoredResult({
      score: `${score}/${questions.length}`,
      detail: `入会IQテスト: ${score}/${questions.length}、制限時間: 1問${secondsPerQuestion}秒、問題数: ${questions.length}問`,
      completedAt: new Date().toISOString()
    });
    setPhase("done");
  }, []);

  const goNext = useCallback((choice: number | null = null) => {
    const nextCorrect = correct + (choice === question.answer ? 1 : 0);
    if (current + 1 >= questions.length) {
      finish(nextCorrect);
      return;
    }
    setCorrect(nextCorrect);
    setCurrent((value) => value + 1);
    setTimeLeft(secondsPerQuestion);
  }, [correct, current, finish, question.answer]);

  useEffect(() => {
    if (phase !== "testing") return;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          goNext();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, current, goNext]);

  if (phase === "intro") {
    return (
      <div className="grid gap-5">
        <div className="rounded-md border border-gold/25 bg-gold/10 p-5 text-sm leading-7 text-ink/75">
          <span className="font-bold text-ink">開始前の注意:</span> 全20問、1問あたり5秒です。開始後はタイマーが止まりません。
          言語理解、作動記憶、算数、系列推理、視覚的パターンを短時間で見ます。回答を選ぶとすぐ次の問題へ進みます。
        </div>
        <div className="grid gap-3 text-sm text-ink/65 md:grid-cols-3">
          <div className="rounded-md border border-line bg-smoke p-4"><span className="block text-lg font-bold text-ink">20問</span>短時間の推論問題</div>
          <div className="rounded-md border border-line bg-smoke p-4"><span className="block text-lg font-bold text-ink">5秒</span>1問ごとの制限時間</div>
          <div className="rounded-md border border-line bg-smoke p-4"><span className="block text-lg font-bold text-ink">自動入力</span>結果は登録フォームへ反映</div>
        </div>
        <button
          type="button"
          onClick={() => setPhase("testing")}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-gold px-5 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-[#856229] md:w-fit"
        >
          注意事項を確認してスタート
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="grid gap-5">
        <div className="rounded-md border border-green-200 bg-green-50 p-5 text-sm leading-7 text-green-900">
          入会IQテストが完了しました。結果は登録フォームに自動入力されます。
        </div>
        <div className="rounded-md border border-line bg-smoke p-5">
          <p className="text-xs font-bold tracking-[0.2em] text-gold">RESULT</p>
          <p className="mt-2 text-4xl font-bold text-ink">{finalScore}/{questions.length}</p>
          <p className="mt-2 text-sm text-ink/60">{detailValue}</p>
        </div>
        <a
          href="/apply"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-navy/90 md:w-fit"
        >
          新規登録フォームに戻る
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-bold text-ink">問 {current + 1} / {questions.length}</span>
        <span className={`rounded-full px-3 py-1 font-bold ${timeLeft <= 2 ? "bg-red-50 text-red-700" : "bg-smoke text-ink/70"}`}>
          残り {timeLeft} 秒
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-smoke">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-6 text-2xl font-bold leading-9 text-ink">{question.prompt}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {question.options.map((option, index) => (
          <button
            key={option}
            type="button"
            onClick={() => goNext(index)}
            className="min-h-14 rounded-md border border-line bg-smoke px-4 py-3 text-left text-sm font-semibold text-ink transition hover:border-navy/30 hover:bg-white"
          >
            {option}
          </button>
        ))}
      </div>
      <p className="mt-5 text-xs text-ink/50">選択した瞬間に回答が記録され、次の問題へ進みます。</p>
    </div>
  );
}
