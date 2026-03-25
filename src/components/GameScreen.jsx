import { useState, useRef, useCallback } from "react";
import DrawingCanvas from "./DrawingCanvas";

const CAT_LABELS = {
  suma: "Suma",
  diferenta: "Diferența",
  dublu: "Dublu / Jumătate",
  mixt: "Mixt",
};

const CAT_COLORS = {
  suma: { bg: "bg-kid-blue", border: "border-kid-blue" },
  diferenta: { bg: "bg-kid-coral", border: "border-kid-coral" },
  dublu: { bg: "bg-kid-green", border: "border-kid-green" },
  mixt: { bg: "bg-kid-purple", border: "border-kid-purple" },
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
    <div className="pb-8">
      {/* Score bar */}
      <div className="flex items-center justify-between px-5 py-2 text-xs font-bold text-gray-400">
        <span>Scor: {score}</span>
        <span>
          Problema {index + 1}/{total}
        </span>
        <button
          onClick={onHome}
          className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-bold text-gray-400 transition-colors hover:text-gray-600"
        >
          Ieși
        </button>
      </div>

      {/* Progress bar */}
      <div className="mx-4 mb-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${catColor.bg} transition-all duration-500`}
          style={{ width: `${((index + (isAnswered ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      {/* Problem card */}
      <div className={`relative mx-4 rounded-2xl border-2 ${catColor.border} bg-white p-5`}>
        <span
          className={`absolute -top-3 left-5 rounded-full ${catColor.bg} px-3 py-0.5 text-xs font-bold text-white`}
        >
          {CAT_LABELS[problem.category] || CAT_LABELS[category]}
        </span>
        <p className="mt-1 text-base font-semibold leading-relaxed text-gray-800">
          {problem.text}
        </p>
        <p className="mt-2 text-sm font-bold text-kid-coral">
          {problem.question}
        </p>
      </div>

      {/* Drawing canvas */}
      <DrawingCanvas ref={canvasRef} />

      {/* Hint */}
      {showHint && (
        <div className="mx-4 mt-2 rounded-xl border-2 border-kid-amber bg-kid-amber-light px-4 py-3 text-xs font-semibold text-kid-amber-dark">
          {problem.hint}
        </div>
      )}

      {/* Answer input */}
      {!isAnswered && (
        <>
          <div className="mx-4 mt-3 flex items-center gap-2">
            <label className="text-sm font-bold text-gray-400">Răspuns:</label>
            <input
              type="number"
              inputMode="numeric"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="?"
              className="flex-1 rounded-xl border-2 border-kid-purple bg-kid-purple-light px-4 py-2.5 text-center text-lg font-bold text-kid-purple-dark outline-none focus:border-kid-coral focus:bg-kid-coral-light focus:text-kid-coral-dark"
            />
            <span className="text-sm font-bold text-gray-400">cm</span>
          </div>

          {feedback === "empty" && (
            <p className="mx-4 mt-2 text-center text-xs font-bold text-kid-coral">
              Scrie un număr în căsuță!
            </p>
          )}

          <div className="mx-4 mt-3 flex gap-2">
            <button
              onClick={() => setShowHint(true)}
              className="flex-1 rounded-xl border-2 border-kid-purple bg-white py-3 text-sm font-bold text-kid-purple transition-transform active:scale-95"
            >
              Indiciu
            </button>
            <button
              onClick={handleCheck}
              className="flex-1 rounded-xl border-2 border-kid-purple bg-kid-purple py-3 text-sm font-bold text-white transition-transform active:scale-95"
            >
              Verifică
            </button>
          </div>
        </>
      )}

      {/* Feedback */}
      {feedback === "correct" && (
        <div className="mx-4 mt-3 rounded-2xl border-2 border-kid-green bg-kid-green-light px-5 py-4 text-center text-lg font-extrabold text-kid-green-dark">
          Bravo! Răspuns corect!
        </div>
      )}
      {feedback === "wrong" && (
        <div className="mx-4 mt-3 rounded-2xl border-2 border-kid-coral bg-kid-coral-light px-5 py-4 text-center">
          <p className="text-lg font-extrabold text-kid-coral-dark">
            Nu e corect.
          </p>
          <p className="mt-1 text-sm font-bold text-kid-coral-dark">
            Răspunsul este{" "}
            <span className="text-kid-coral">{problem.answer} cm</span>
          </p>
        </div>
      )}

      {/* Steps */}
      {showSteps && (
        <div className="mx-4 mt-2 rounded-xl border-2 border-kid-teal bg-kid-teal-light px-4 py-3">
          <p className="mb-1 text-xs font-bold text-kid-teal-dark">
            Rezolvare:
          </p>
          {problem.steps.map((step, i) => (
            <p key={i} className="text-xs font-semibold text-kid-teal-dark">
              {step}
            </p>
          ))}
        </div>
      )}

      {/* Next button */}
      {isAnswered && (
        <div className="mx-4 mt-3">
          <button
            onClick={handleNext}
            className="w-full rounded-xl bg-kid-teal py-3.5 text-sm font-bold text-white transition-transform active:scale-95"
          >
            {index + 1 >= total ? "Vezi rezultatele" : "Problema următoare"}
          </button>
        </div>
      )}
    </div>
  );
}
