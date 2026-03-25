import { useState, useRef } from "react";
import DrawingCanvas from "./DrawingCanvas";

const CAT_LABELS = {
  suma: "Suma",
  diferenta: "Diferența",
  dublu: "Dublu / Jumătate",
  mixt: "Mixt",
};

const CAT_COLORS = {
  suma: {
    bg: "bg-kid-blue",
    soft: "bg-kid-blue-light",
    border: "border-kid-blue",
    text: "text-kid-blue-dark",
  },
  diferenta: {
    bg: "bg-kid-coral",
    soft: "bg-kid-coral-light",
    border: "border-kid-coral",
    text: "text-kid-coral-dark",
  },
  dublu: {
    bg: "bg-kid-green",
    soft: "bg-kid-green-light",
    border: "border-kid-green",
    text: "text-kid-green-dark",
  },
  mixt: {
    bg: "bg-kid-purple",
    soft: "bg-kid-purple-light",
    border: "border-kid-purple",
    text: "text-kid-purple-dark",
  },
};

export default function GameScreen({
  problems,
  category,
  onFinish,
  onHome,
}) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [showHint, setShowHint] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const canvasRef = useRef(null);

  const problem = problems[index];
  const total = problems.length;
  const catColor = CAT_COLORS[category] || CAT_COLORS.mixt;

  function handleCheck() {
    const val = parseInt(answer, 10);
    if (isNaN(val)) {
      setFeedback("empty");
      return;
    }
    if (val === problem.answer) {
      setFeedback("correct");
      scoreRef.current += 1;
      setScore(scoreRef.current);
    } else {
      setFeedback("wrong");
    }
    setShowSteps(true);
  }

  function handleNext() {
    if (index + 1 >= total) {
      onFinish(scoreRef.current, total);
      return;
    }
    setIndex((i) => i + 1);
    setAnswer("");
    setFeedback(null);
    setShowHint(false);
    setShowSteps(false);
    canvasRef.current?.clear();
  }

  const isAnswered = feedback === "correct" || feedback === "wrong";

  return (
    <div className="space-y-4 px-1 pb-6">
      <section className="studio-panel px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`status-chip ${catColor.soft} ${catColor.text}`}>
              Scor {score}
            </span>
            <span className="status-chip bg-white/80 text-slate-500">
              Problema {index + 1} din {total}
            </span>
          </div>
          <button
            onClick={onHome}
            className="utility-pill studio-button text-xs"
          >
            Ieși
          </button>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEE5D4]">
          <div
            className={`h-full rounded-full ${catColor.bg} transition-all duration-500`}
            style={{ width: `${((index + (isAnswered ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      </section>

      <section className="paper-panel px-5 py-5">
        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${catColor.soft} ${catColor.text}`}>
          {CAT_LABELS[problem.category] || CAT_LABELS[category]}
        </span>
        <p className="mt-5 text-sm font-semibold leading-6 text-slate-600">
          {problem.text}
        </p>
        <div className={`mt-4 rounded-[22px] px-4 py-4 ${catColor.soft}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Întrebarea
          </p>
          <p className={`mt-1 text-lg font-black leading-snug ${catColor.text}`}>
            {problem.question}
          </p>
        </div>
      </section>

      <DrawingCanvas ref={canvasRef} />

      {showHint && (
        <section className="rounded-[26px] border border-kid-amber bg-kid-amber-light px-4 py-4 shadow-[0_18px_38px_-30px_rgba(133,79,11,0.45)]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-kid-amber-dark">
            Indiciu
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-kid-amber-dark">
            {problem.hint}
          </p>
        </section>
      )}

      {!isAnswered && (
        <section className="studio-panel px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                Răspunsul tău
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Scrie rezultatul în centimetri.
              </p>
            </div>
            <span className={`status-chip ${catColor.soft} ${catColor.text}`}>
              cm
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="?"
              className={`h-14 flex-1 rounded-[22px] border border-[#DCCDB1] bg-[#FFFDF8] px-4 text-center text-2xl font-black ${catColor.text} outline-none transition focus:border-[var(--color-board-ink)] focus:bg-white`}
            />
            <div className="rounded-[22px] bg-[#F5EDDE] px-4 py-4 text-sm font-black text-slate-500">
              cm
            </div>
          </div>

          {feedback === "empty" && (
            <p className="mt-3 text-center text-xs font-black text-kid-coral-dark">
              Scrie un număr în căsuță.
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowHint(true)}
              className={`action-secondary studio-button border border-[var(--color-board-line)] bg-white/90 text-[var(--color-board-ink)] ${showHint ? `${catColor.soft} ${catColor.text} ${catColor.border}` : ""}`}
            >
              Indiciu
            </button>
            <button
              onClick={handleCheck}
              className={`action-primary studio-button ${catColor.bg} text-white`}
            >
              Verifică
            </button>
          </div>
        </section>
      )}

      {feedback === "correct" && (
        <section className="rounded-[26px] border border-kid-green bg-kid-green-light px-5 py-4 shadow-[0_18px_38px_-30px_rgba(59,109,17,0.45)]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-kid-green-dark">
            Rezultat
          </p>
          <p className="mt-2 text-xl font-black text-kid-green-dark">
            Bravo! Răspuns corect!
          </p>
        </section>
      )}

      {feedback === "wrong" && (
        <section className="rounded-[26px] border border-kid-coral bg-kid-coral-light px-5 py-4 shadow-[0_18px_38px_-30px_rgba(153,60,29,0.4)]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-kid-coral-dark">
            Rezultat
          </p>
          <p className="mt-2 text-xl font-black text-kid-coral-dark">
            Nu e corect.
          </p>
          <p className="mt-2 text-sm font-semibold text-kid-coral-dark">
            Răspunsul este <span className="font-black">{problem.answer} cm</span>
          </p>
        </section>
      )}

      {showSteps && (
        <section className="studio-panel px-4 py-4">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-kid-teal-dark">
            Cum se rezolvă
          </p>
          <div className="mt-3 space-y-2">
            {problem.steps.map((step, i) => (
              <p
                key={i}
                className="rounded-[18px] bg-kid-teal-light px-3 py-2 text-sm font-semibold text-kid-teal-dark"
              >
                {i + 1}. {step}
              </p>
            ))}
          </div>
        </section>
      )}

      {isAnswered && (
        <section className="studio-panel px-3 py-3">
          <button
            onClick={handleNext}
            className="action-primary studio-button w-full bg-[var(--color-board-ink)] text-white"
          >
            {index + 1 >= total ? "Vezi rezultatele" : "Problema următoare"}
          </button>
        </section>
      )}
    </div>
  );
}
