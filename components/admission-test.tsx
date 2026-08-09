"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Question = {
  id: string;
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
const questionBankSize = 1000;
const testQuestionCount = 20;

const conceptItems = [
  ["仮説", "地図", "方向づける"], ["制度", "文法", "規則を与える"], ["顕微鏡", "統計", "見えにくい構造を捉える"],
  ["比喩", "模型", "本物を置き換えて理解を助ける"], ["契約", "約束", "行動を縛る"], ["索引", "目次", "探す範囲を狭める"],
  ["市場", "会議", "参加者の判断が集まる"], ["予算", "時間割", "配分を決める"], ["法律", "設計図", "実行前の枠組みになる"],
  ["辞書", "座標", "意味や位置を特定する"], ["実験", "面接", "仮説を確かめる"], ["議事録", "写真", "出来事を保存する"],
  ["暗号", "比喩", "直接言わずに伝える"], ["羅針盤", "理念", "進む向きを示す"], ["温度計", "指標", "状態を数値化する"],
  ["橋", "翻訳", "異なるものをつなぐ"], ["監査", "校正", "誤りを見つける"], ["投資", "教育", "将来の価値に賭ける"],
  ["建築", "議論", "構造を組み立てる"], ["鏡", "フィードバック", "状態を映し返す"], ["余白", "沈黙", "解釈の余地を作る"],
  ["編集", "剪定", "不要なものを削る"], ["戦略", "航路", "目的地への道筋を選ぶ"], ["観察", "傾聴", "判断前に受け取る"],
  ["分類", "棚", "探しやすく並べる"], ["儀式", "署名", "意味を確定する"], ["研究", "探索", "未知を減らす"],
  ["試作", "下書き", "完成前に検証する"], ["交渉", "調律", "差異を調整する"], ["記憶", "アーカイブ", "過去を参照可能にする"]
];

const vocabularyItems = [
  ["緻密", "細部まで整った"], ["曖昧", "はっきりしない"], ["暫定", "一時的な"], ["演繹", "規則から結論を導く"],
  ["帰納", "事例から規則を作る"], ["示唆", "間接的に示す"], ["妥当", "筋が通っている"], ["冗長", "無駄に長い"],
  ["簡潔", "余分が少ない"], ["精査", "詳しく調べる"], ["俯瞰", "全体を見渡す"], ["逡巡", "決めかねる"],
  ["蓋然性", "起こりやすさ"], ["恣意的", "勝手な判断による"], ["普遍", "広く当てはまる"], ["局所", "一部に限られる"],
  ["含意", "内に含む意味"], ["整合", "矛盾がない"], ["逸脱", "基準から外れる"], ["抑制", "強まりをおさえる"],
  ["顕在", "表に現れている"], ["潜在", "隠れて存在する"], ["代替", "別のもので置き換える"], ["検証", "確かめる"],
  ["抽象", "共通点を抜き出す"], ["具体", "はっきりした形がある"], ["相関", "一緒に変わる関係"], ["因果", "原因と結果の関係"],
  ["裁量", "自分で判断できる範囲"], ["硬直", "変化しにくい"]
];

const wrongMeanings = [
  "速度が速い", "色が鮮やか", "音が大きい", "距離が近い", "必ず正しい", "数が多い", "気分が良い", "形が丸い",
  "偶然に任せる", "眠って待つ", "感情だけで決める", "場所を移す", "完全に同じ", "短く切る", "名前を変える"
];
const conceptWrongs = ["記録する", "隠す", "拡大する", "速くする", "数える", "飾る", "止める", "忘れさせる", "軽くする", "分解する", "所有する", "複製する"];
const symbols = ["○", "●", "△", "▲", "□", "■", "◇", "◆"];

const questionBank = buildQuestionBank();

function buildQuestionBank() {
  const bank = new Map<string, Question>();
  let id = 0;
  const add = (prompt: string, correct: string, wrongs: string[]) => {
    if (bank.size >= questionBankSize) return;
    const optionPool = unique([correct, ...wrongs]).slice(0, 4);
    if (optionPool.length < 4) return;
    const options = shuffle(optionPool);
    bank.set(prompt, { id: `q-${id++}`, prompt, options, answer: options.indexOf(correct) });
  };

  conceptItems.forEach(([a, b, correct], index) => {
    add(`「${a}」と「${b}」に最も共通する機能は？`, correct, rotate(conceptWrongs, index).slice(0, 6));
  });

  vocabularyItems.forEach(([word, meaning], index) => {
    add(`「${word}」に最も近い意味は？`, meaning, rotate(wrongMeanings, index).slice(0, 6));
    add(`「${meaning}」に最も近い語は？`, word, rotate(vocabularyItems.map(([item]) => item), index + 5).filter((item) => item !== word).slice(0, 6));
  });

  for (let a = 12; a <= 69 && bank.size < questionBankSize; a += 3) {
    for (let b = 7; b <= 34 && bank.size < questionBankSize; b += 4) {
      const c = ((a + b) % 8) + 2;
      const result = a + b - c * 3;
      add(`${a} + ${b} - ${c} × 3 = ?`, String(result), [result + 3, result - 2, result + 6, result - 5].map(String));
      const divisor = [2, 3, 4, 5][(a + b) % 4];
      const base = divisor * (((a + b) % 9) + 8);
      const result2 = base / divisor + c * 2;
      add(`${base} ÷ ${divisor} + ${c} × 2 = ?`, String(result2), [result2 - 4, result2 + 2, result2 + divisor, result2 - divisor].map(String));
    }
  }

  for (let i = 0; i < 240 && bank.size < questionBankSize; i++) {
    const digits = uniqueDigits(i).slice(0, 5);
    const desc = i % 2 === 0 ? "小さい順" : "大きい順";
    const sorted = [...digits].sort((a, b) => i % 2 === 0 ? a - b : b - a);
    const first = (i % 3) + 1;
    const second = first + 2;
    const correct = `${sorted[first - 1]}${sorted[second - 1]}`;
    add(`${digits.join("・")} を${desc}にし、${first}番目と${second}番目を読むと？`, correct, [
      `${sorted[second - 1]}${sorted[first - 1]}`,
      `${digits[first - 1]}${digits[second - 1]}`,
      `${digits[second - 1]}${digits[first - 1]}`,
      `${sorted[0]}${sorted[4]}`
    ]);
    const reversed = [...digits].reverse();
    const filtered = reversed.filter((digit) => (i % 2 === 0 ? digit % 2 === 0 : digit % 2 === 1)).slice(0, 3).join("");
    if (filtered.length >= 2) {
      add(`${digits.join("・")} を逆順にし、${i % 2 === 0 ? "偶数" : "奇数"}だけ残すと？`, filtered, [
        filtered.split("").reverse().join(""),
        digits.filter((digit) => (i % 2 === 0 ? digit % 2 === 0 : digit % 2 === 1)).slice(0, 3).join(""),
        reversed.slice(0, filtered.length).join(""),
        digits.slice(0, filtered.length).join("")
      ]);
    }
  }

  for (let i = 0; i < 220 && bank.size < questionBankSize; i++) {
    const start = i % 8;
    const stepA = (i % 3) + 1;
    const stepB = ((i + 1) % 4) + 1;
    const seq = [
      symbols[start % symbols.length],
      symbols[(start + stepA) % symbols.length],
      symbols[(start + stepA + stepB) % symbols.length],
      symbols[(start + stepA + stepB + stepA) % symbols.length],
      symbols[(start + stepA + stepB + stepA + stepB) % symbols.length]
    ];
    const correct = symbols[(start + stepA + stepB + stepA + stepB + stepA) % symbols.length];
    add(`${seq.slice(0, 3).join(" ")} / ${seq.slice(3).join(" ")} ?`, correct, rotate(symbols, i).filter((item) => item !== correct).slice(0, 6));
  }

  for (let i = 0; i < 2000 && bank.size < questionBankSize; i++) {
    const start = (i % 19) + 2;
    const gapA = (i % 6) + 2;
    const gapB = ((i * 3) % 8) + 3;
    const seq = [
      start,
      start + gapA,
      start + gapA + gapB,
      start + gapA * 2 + gapB,
      start + gapA * 2 + gapB * 2
    ];
    const correct = start + gapA * 3 + gapB * 2;
    add(`${seq.join(" ")} ?`, String(correct), [correct - gapA, correct + gapA, correct - gapB, correct + gapB].map(String));
  }

  for (let i = 0; i < 2000 && bank.size < questionBankSize; i++) {
    const start = 65 + (i % 4);
    const gapA = (i % 5) + 2;
    const gapB = ((i * 2) % 6) + 3;
    const letters = [start, start + gapA, start + gapA + gapB, start + gapA * 2 + gapB, start + gapA * 2 + gapB * 2];
    const prompt = `${letters.slice(0, 4).map((value) => String.fromCharCode(value)).join(" ")} ?`;
    const correct = String.fromCharCode(letters[4]);
    add(prompt, correct, [letters[4] - 2, letters[4] - 1, letters[4] + 1, letters[4] + 2].map((value) => String.fromCharCode(value)));
  }

  return [...bank.values()].slice(0, questionBankSize);
}

function pickRandomQuestions() {
  return shuffle(questionBank).slice(0, testQuestionCount);
}

function shuffle<T>(values: T[]) {
  const items = [...values];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function rotate<T>(values: T[], offset: number) {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function uniqueDigits(seed: number) {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let value = seed * 37 + 91826;
  for (let index = digits.length - 1; index > 0; index--) {
    value = (value * 17 + 23) % 100000;
    const swapIndex = value % (index + 1);
    [digits[index], digits[swapIndex]] = [digits[swapIndex], digits[index]];
  }
  return digits.slice(0, 5);
}

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
            完全会員制の審査項目です。{questionBank.length}問の出題バンクから20問をランダムに受けると、結果がここに自動入力されます。
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
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(secondsPerQuestion);
  const [correct, setCorrect] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  const question = testQuestions[current];
  const progress = ((current + 1) / testQuestionCount) * 100;
  const detailValue = useMemo(
    () => `入会IQテスト: ${finalScore}/${testQuestionCount}、制限時間: 1問${secondsPerQuestion}秒、問題数: ${testQuestionCount}問、出題バンク: ${questionBank.length}問`,
    [finalScore]
  );

  const finish = useCallback((score: number) => {
    setFinalScore(score);
    writeStoredResult({
      score: `${score}/${testQuestionCount}`,
      detail: `入会IQテスト: ${score}/${testQuestionCount}、制限時間: 1問${secondsPerQuestion}秒、問題数: ${testQuestionCount}問、出題バンク: ${questionBank.length}問`,
      completedAt: new Date().toISOString()
    });
    setPhase("done");
  }, []);

  const goNext = useCallback((choice: number | null = null) => {
    if (!question) return;
    const nextCorrect = correct + (choice === question.answer ? 1 : 0);
    if (current + 1 >= testQuestions.length) {
      finish(nextCorrect);
      return;
    }
    setCorrect(nextCorrect);
    setCurrent((value) => value + 1);
    setTimeLeft(secondsPerQuestion);
  }, [correct, current, finish, question, testQuestions.length]);

  function startTest() {
    setTestQuestions(pickRandomQuestions());
    setCurrent(0);
    setCorrect(0);
    setFinalScore(0);
    setTimeLeft(secondsPerQuestion);
    setPhase("testing");
  }

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
          {questionBank.length}問の出題バンクから重複なしでランダム出題します。回答を選ぶとすぐ次の問題へ進みます。
        </div>
        <div className="grid gap-3 text-sm text-ink/65 md:grid-cols-3">
          <div className="rounded-md border border-line bg-smoke p-4"><span className="block text-lg font-bold text-ink">20問</span>短時間の推論問題</div>
          <div className="rounded-md border border-line bg-smoke p-4"><span className="block text-lg font-bold text-ink">5秒</span>1問ごとの制限時間</div>
          <div className="rounded-md border border-line bg-smoke p-4"><span className="block text-lg font-bold text-ink">{questionBank.length}問</span>重複なしでランダム抽出</div>
        </div>
        <button
          type="button"
          onClick={startTest}
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
          <p className="mt-2 text-4xl font-bold text-ink">{finalScore}/{testQuestionCount}</p>
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

  if (!question) return null;

  return (
    <div className="rounded-md border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-bold text-ink">問 {current + 1} / {testQuestions.length}</span>
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
