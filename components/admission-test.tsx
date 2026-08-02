"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Question = {
  prompt: string;
  options: string[];
  answer: number;
};

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

const secondsPerQuestion = 5;

export function AdmissionTest() {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(secondsPerQuestion);
  const [correct, setCorrect] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const question = questions[current];
  const scoreValue = completed ? `${finalScore}/${questions.length}` : "";
  const detailValue = useMemo(
    () => completed
      ? `入会IQテスト: ${finalScore}/${questions.length}、制限時間: 1問${secondsPerQuestion}秒、問題数: ${questions.length}問`
      : "",
    [completed, finalScore]
  );

  const answer = useCallback((choice: number | null) => {
    if (locked || completed) return;
    const nextCorrect = correct + (choice === question.answer ? 1 : 0);
    setSelected(choice);
    setLocked(true);
    setCorrect(nextCorrect);

    window.setTimeout(() => {
      if (current + 1 >= questions.length) {
        setFinalScore(nextCorrect);
        setCompleted(true);
        return;
      }
      setCurrent((value) => value + 1);
      setTimeLeft(secondsPerQuestion);
      setSelected(null);
      setLocked(false);
    }, 260);
  }, [completed, correct, current, locked, question.answer]);

  useEffect(() => {
    if (!started || completed || locked) return;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          answer(null);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, completed, locked, current, answer]);

  return (
    <div className="rounded-md border border-navy/15 bg-[#f8f2e8] p-4">
      <input type="hidden" name="admission_test_completed" value={completed ? "1" : "0"} />
      <input type="hidden" name="admission_test_detail" value={detailValue} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-gold">MEMBERSHIP TEST</p>
          <h2 className="mt-2 text-xl font-bold text-ink">入会IQテスト</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-ink/65">
            完全会員制の信頼を保つため、20問の短時間テストを実施します。1問5秒で自動的に進み、結果は審査項目に自動入力されます。
          </p>
        </div>
        <div className="rounded-md border border-line bg-white px-4 py-3 text-sm">
          <span className="block text-xs font-bold text-ink/45">自動入力</span>
          <input
            className="mt-1 w-28 bg-transparent text-lg font-bold text-ink outline-none"
            name="admission_test_score"
            value={completed ? scoreValue : "未受験"}
            readOnly
            aria-label="入会IQテスト結果"
          />
        </div>
      </div>

      {!started ? (
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="mt-5 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-navy/90"
        >
          テストを開始する
        </button>
      ) : null}

      {started && !completed ? (
        <div className="mt-5 rounded-md border border-line bg-white p-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-bold text-ink">問 {current + 1} / {questions.length}</span>
            <span className={`rounded-full px-3 py-1 font-bold ${timeLeft <= 2 ? "bg-red-50 text-red-700" : "bg-smoke text-ink/70"}`}>
              残り {timeLeft} 秒
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-smoke">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
          <p className="mt-5 text-xl font-bold text-ink">{question.prompt}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {question.options.map((option, index) => (
              <button
                key={option}
                type="button"
                disabled={locked}
                onClick={() => answer(index)}
                className={`rounded-md border px-4 py-3 text-left text-sm font-semibold transition ${
                  selected === index
                    ? "border-gold bg-gold/15 text-ink"
                    : "border-line bg-smoke text-ink hover:border-navy/30 hover:bg-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {completed ? (
        <div className="mt-5 rounded-md border border-green-200 bg-green-50 p-4 text-sm leading-7 text-green-900">
          入会IQテストが完了しました。結果は審査情報に自動で反映されます。
        </div>
      ) : null}
    </div>
  );
}
