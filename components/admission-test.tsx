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
  { prompt: "2, 4, 8, 16, ?", options: ["24", "30", "32", "36"], answer: 2 },
  { prompt: "A, C, F, J, ?", options: ["M", "N", "O", "P"], answer: 2 },
  { prompt: "3, 6, 11, 18, ?", options: ["25", "27", "29", "31"], answer: 1 },
  { prompt: "月 : 夜 = 太陽 : ?", options: ["朝", "昼", "星", "光"], answer: 1 },
  { prompt: "1, 1, 2, 3, 5, ?", options: ["6", "7", "8", "9"], answer: 2 },
  { prompt: "水は氷になる。蒸気は何になる？", options: ["水", "空気", "雲", "熱"], answer: 0 },
  { prompt: "9, 7, 10, 8, 11, ?", options: ["7", "8", "9", "12"], answer: 2 },
  { prompt: "本 : 読む = 音楽 : ?", options: ["描く", "聞く", "走る", "眠る"], answer: 1 },
  { prompt: "5, 10, 20, 40, ?", options: ["60", "70", "80", "90"], answer: 2 },
  { prompt: "Z, X, U, Q, ?", options: ["L", "M", "N", "O"], answer: 0 },
  { prompt: "すべてのMはN。すべてのNはP。Mは？", options: ["Pである", "Pでない", "Nでない", "不明"], answer: 0 },
  { prompt: "4, 9, 16, 25, ?", options: ["30", "32", "36", "40"], answer: 2 },
  { prompt: "北 : 南 = 上 : ?", options: ["右", "左", "下", "中"], answer: 2 },
  { prompt: "2, 3, 5, 8, 12, ?", options: ["15", "16", "17", "18"], answer: 2 },
  { prompt: "鳥 : 巣 = 人 : ?", options: ["家", "道", "街", "服"], answer: 0 },
  { prompt: "100, 50, 25, 12.5, ?", options: ["5", "6.25", "7.5", "10"], answer: 1 },
  { prompt: "CAB, DBC, ECD, ?", options: ["FDE", "FED", "DFE", "FFE"], answer: 0 },
  { prompt: "円に角は0。三角形に角は3。五角形は？", options: ["4", "5", "6", "7"], answer: 1 },
  { prompt: "6, 12, 13, 26, 27, ?", options: ["28", "39", "52", "54"], answer: 3 },
  { prompt: "原因 : 結果 = 問い : ?", options: ["仮説", "答え", "議論", "沈黙"], answer: 1 }
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
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

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

  const goNext = useCallback((choice: number | null = selected) => {
    const nextCorrect = correct + (choice === question.answer ? 1 : 0);
    if (current + 1 >= questions.length) {
      finish(nextCorrect);
      return;
    }
    setCorrect(nextCorrect);
    setCurrent((value) => value + 1);
    setTimeLeft(secondsPerQuestion);
    setSelected(null);
    setAnswered(false);
  }, [correct, current, finish, question.answer, selected]);

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
          回答を選んだら「次の問題へ」で進みます。時間切れの場合は未回答として自動的に次へ進みます。
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
        <Link
          href="/apply"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-navy/90 md:w-fit"
        >
          新規登録フォームに戻る
        </Link>
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
            disabled={answered}
            onClick={() => {
              setSelected(index);
              setAnswered(true);
            }}
            className={`min-h-14 rounded-md border px-4 py-3 text-left text-sm font-semibold transition ${
              selected === index
                ? "border-gold bg-gold/15 text-ink"
                : "border-line bg-smoke text-ink hover:border-navy/30 hover:bg-white"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs text-ink/50">{answered ? "回答を記録しました。次へ進んでください。" : "選択すると回答が固定されます。"}</p>
        <button
          type="button"
          onClick={() => goNext()}
          disabled={!answered}
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          次の問題へ
        </button>
      </div>
    </div>
  );
}
