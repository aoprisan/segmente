import { useEffect, useRef, useState } from "react";
import DrawingCanvas from "./DrawingCanvas";
import TablaVisual from "./TablaVisual";
import OrdineaVisual from "./OrdineaVisual";
import RomanNumeralVisual from "./RomanNumeralVisual";
import { buildSessionResult } from "../utils/gamification";
import { formatElapsedTime } from "../utils/leaderboard";

const TIMED_TIME_LIMIT_MS = 5 * 60 * 1000;
const SESSION_TIMED_CATEGORIES = new Set([
  "tabla",
  "romanToArabic",
  "arabicToRoman",
]);
const EXERCISE_TIMED_CATEGORIES = new Set(["ordinea"]);

const CAT_LABELS = {
  suma: "Suma",
  diferenta: "Diferența",
  dublu: "Dublu / Jumătate",
  mixt: "Mixt",
  tabla: "Tabla înmulțirii",
  ordinea: "Ordinea operațiilor",
  romanToArabic: "Numere romane → arabe",
  arabicToRoman: "Numere arabe → romane",
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
  tabla: {
    bg: "bg-kid-teal",
    soft: "bg-kid-teal-light",
    border: "border-kid-teal",
    text: "text-kid-teal-dark",
  },
  ordinea: {
    bg: "bg-kid-pink",
    soft: "bg-kid-pink-light",
    border: "border-kid-pink",
    text: "text-kid-pink-dark",
  },
  romanToArabic: {
    bg: "bg-kid-purple",
    soft: "bg-kid-purple-light",
    border: "border-kid-purple",
    text: "text-kid-purple-dark",
  },
  arabicToRoman: {
    bg: "bg-kid-red",
    soft: "bg-kid-red-light",
    border: "border-kid-red",
    text: "text-kid-red-dark",
  },
};

const TIMER_BORDER_BY_CATEGORY = {
  tabla: "border-kid-teal bg-kid-teal-light",
  ordinea: "border-kid-pink bg-kid-pink-light",
  romanToArabic: "border-kid-purple bg-kid-purple-light",
  arabicToRoman: "border-kid-red bg-kid-red-light",
};

const TIMER_TEXT_BY_CATEGORY = {
  tabla: "text-kid-teal-dark",
  ordinea: "text-kid-pink-dark",
  romanToArabic: "text-kid-purple-dark",
  arabicToRoman: "text-kid-red-dark",
};

const MOBILE_BREAKPOINT = 640;

function getIsMobileViewport() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export default function GameScreen({
  problems,
  category,
  sessionMode = "standard",
  sessionId = null,
  sessionLabel = null,
  onFinish,
  onHome,
}) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const currentStreakRef = useRef(0);
  const [bestStreak, setBestStreak] = useState(0);
  const bestStreakRef = useRef(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [showHint, setShowHint] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [hintedProblems, setHintedProblems] = useState([]);
  const [isMobile, setIsMobile] = useState(getIsMobileViewport);
  const canvasRef = useRef(null);
  const startedAtRef = useRef(null);
  const exerciseStartedAtRef = useRef(null);
  const finishedRef = useRef(false);
  const isTabla = category === "tabla";
  const isOrdinea = category === "ordinea";
  const isRomanToArabic = category === "romanToArabic";
  const isArabicToRoman = category === "arabicToRoman";
  const isRomanNumeral = isRomanToArabic || isArabicToRoman;
  const isStringAnswer = isArabicToRoman;
  const isSessionTimed = SESSION_TIMED_CATEGORIES.has(category);
  const isExerciseTimed = EXERCISE_TIMED_CATEGORIES.has(category);
  const isTimed = isSessionTimed || isExerciseTimed;
  const isArithmetic = isTabla || isOrdinea || isRomanNumeral;
  const unitLabel = isArithmetic ? null : "cm";
  const [remainingMs, setRemainingMs] = useState(
    isTimed ? TIMED_TIME_LIMIT_MS : 0,
  );

  const problem = problems[index];
  const total = problems.length;
  const catColor = CAT_COLORS[category] || CAT_COLORS.mixt;
  const usedHintOnCurrentProblem = hintedProblems.includes(index);

  useEffect(() => {
    const handleResize = () => setIsMobile(getIsMobileViewport());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const now = Date.now();
    startedAtRef.current = now;
    exerciseStartedAtRef.current = now;
  }, []);

  function finishSession({ timedOut = false } = {}) {
    if (finishedRef.current) {
      return;
    }
    finishedRef.current = true;

    const startedAt = startedAtRef.current ?? Date.now();
    const rawElapsed = Date.now() - startedAt;
    const elapsedMs = isSessionTimed
      ? Math.min(rawElapsed, TIMED_TIME_LIMIT_MS)
      : rawElapsed;

    onFinish(
      buildSessionResult({
        score: scoreRef.current,
        total,
        hintsUsed: hintedProblems.length,
        bestStreak: bestStreakRef.current,
        category,
        mode: sessionMode,
        sessionId,
        sessionLabel,
        elapsedMs,
        timedOut,
      }),
    );
  }

  useEffect(() => {
    if (!isTimed) {
      return undefined;
    }

    const tick = () => {
      const startedAt = isSessionTimed
        ? (startedAtRef.current ?? Date.now())
        : (exerciseStartedAtRef.current ?? Date.now());
      const remaining = Math.max(
        0,
        TIMED_TIME_LIMIT_MS - (Date.now() - startedAt),
      );
      setRemainingMs(remaining);
      if (remaining <= 0) {
        if (isSessionTimed) {
          finishSession({ timedOut: true });
        } else {
          handleExerciseTimeout();
        }
      }
    };

    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimed, isSessionTimed, index]);

  function handleExerciseTimeout() {
    currentStreakRef.current = 0;
    setCurrentStreak(0);
    advanceToNext();
  }

  function advanceToNext() {
    if (index + 1 >= total) {
      finishSession();
      return;
    }
    setIndex((i) => i + 1);
    setAnswer("");
    setFeedback(null);
    setShowHint(false);
    setShowSteps(false);
    canvasRef.current?.clear();
    if (isExerciseTimed) {
      exerciseStartedAtRef.current = Date.now();
      setRemainingMs(TIMED_TIME_LIMIT_MS);
    }
  }

  function handleCheck() {
    let isCorrect;
    if (isStringAnswer) {
      const normalized = answer.trim().toUpperCase();
      if (!normalized) {
        setFeedback("empty");
        return;
      }
      isCorrect = normalized === problem.answer;
    } else {
      const val = parseInt(answer, 10);
      if (isNaN(val)) {
        setFeedback("empty");
        return;
      }
      isCorrect = val === problem.answer;
    }
    if (isCorrect) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      currentStreakRef.current += 1;
      setCurrentStreak(currentStreakRef.current);
      if (currentStreakRef.current > bestStreakRef.current) {
        bestStreakRef.current = currentStreakRef.current;
        setBestStreak(bestStreakRef.current);
      }
      if (isTimed) {
        advanceToNext();
        return;
      }
      setFeedback("correct");
    } else {
      setFeedback("wrong");
      currentStreakRef.current = 0;
      setCurrentStreak(0);
    }
    setShowSteps(true);
  }

  function handleNext() {
    advanceToNext();
  }

  function handleShowHint() {
    setShowHint(true);
    setHintedProblems((prev) => {
      if (prev.includes(index)) {
        return prev;
      }
      return [...prev, index];
    });
  }

  const isAnswered = feedback === "correct" || feedback === "wrong";

  return (
    <div className="space-y-3 px-1 pb-4 sm:space-y-4 sm:pb-6">
      {isMobile ? (
        <section className="studio-panel sticky top-0 z-20 px-4 py-3 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`status-chip ${catColor.soft} ${catColor.text}`}>
                Scor {score}
              </span>
              <span className="status-chip bg-white/80 text-slate-500">
                Șir {currentStreak}
              </span>
              <span className="status-chip bg-white/80 text-slate-500">
                Problema {index + 1} din {total}
              </span>
              {sessionMode === "daily" && (
                <span className="status-chip bg-kid-amber-light text-kid-amber-dark">
                  Provocarea zilei
                </span>
              )}
              {isTimed && (
                <span
                  className={`status-chip ${
                    remainingMs <= 30000
                      ? "bg-kid-coral-light text-kid-coral-dark"
                      : `${catColor.soft} ${catColor.text}`
                  }`}
                >
                  ⏱ {formatElapsedTime(remainingMs)}
                </span>
              )}
            </div>
            <button
              onClick={onHome}
              className="utility-pill studio-button text-xs"
            >
              Ieși
            </button>
          </div>

          <div className="mt-3 rounded-[24px] bg-white/72 px-4 py-4 shadow-[inset_0_0_0_1px_rgba(232,218,192,0.68)]">
            <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${catColor.soft} ${catColor.text}`}>
              {CAT_LABELS[problem.category] || CAT_LABELS[category]}
            </span>

            <p className={`mt-3 text-lg font-black leading-snug ${catColor.text}`}>
              {problem.question}
            </p>

            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              {problem.text}
            </p>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEE5D4]">
            <div
              className={`h-full rounded-full ${catColor.bg} transition-all duration-500`}
              style={{ width: `${((index + (isAnswered ? 1 : 0)) / total) * 100}%` }}
            />
          </div>
        </section>
      ) : (
        <>
          <section className="studio-panel px-4 py-4">
            <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`status-chip ${catColor.soft} ${catColor.text}`}>
                Scor {score}
              </span>
              <span className="status-chip bg-white/80 text-slate-500">
                Șir {currentStreak}
              </span>
              <span className="status-chip bg-white/80 text-slate-500">
                Problema {index + 1} din {total}
              </span>
              {sessionMode === "daily" && (
                <span className="status-chip bg-kid-amber-light text-kid-amber-dark">
                  Provocarea zilei
                </span>
              )}
              {isTimed && (
                <span
                  className={`status-chip ${
                    remainingMs <= 30000
                      ? "bg-kid-coral-light text-kid-coral-dark"
                      : `${catColor.soft} ${catColor.text}`
                  }`}
                >
                  ⏱ {formatElapsedTime(remainingMs)}
                </span>
              )}
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
            {sessionLabel && (
              <p className="mt-3 text-[11px] font-black uppercase tracking-[0.18em] text-kid-amber-dark">
                {sessionLabel}
              </p>
            )}
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
        </>
      )}

      {isTimed && (
        <section
          className={`flex items-center justify-between gap-4 rounded-[26px] border px-5 py-4 shadow-[0_18px_38px_-30px_rgba(8,80,65,0.45)] ${
            remainingMs <= 30000
              ? "border-kid-coral bg-kid-coral-light"
              : remainingMs <= 60000
                ? "border-kid-amber bg-kid-amber-light"
                : TIMER_BORDER_BY_CATEGORY[category] || TIMER_BORDER_BY_CATEGORY.tabla
          }`}
        >
          <div>
            <p
              className={`text-[11px] font-black uppercase tracking-[0.18em] ${
                remainingMs <= 30000
                  ? "text-kid-coral-dark"
                  : remainingMs <= 60000
                    ? "text-kid-amber-dark"
                    : TIMER_TEXT_BY_CATEGORY[category] || TIMER_TEXT_BY_CATEGORY.tabla
              }`}
            >
              Timp rămas
            </p>
            <p
              className={`mt-1 text-3xl font-black tabular-nums ${
                remainingMs <= 30000
                  ? "text-kid-coral-dark"
                  : remainingMs <= 60000
                    ? "text-kid-amber-dark"
                    : TIMER_TEXT_BY_CATEGORY[category] || TIMER_TEXT_BY_CATEGORY.tabla
              }`}
            >
              {formatElapsedTime(remainingMs)}
            </p>
          </div>
          <span
            className={`text-3xl ${
              remainingMs <= 30000 ? "animate-pulse" : ""
            }`}
            aria-hidden="true"
          >
            ⏱
          </span>
        </section>
      )}

      {isTabla ? (
        <TablaVisual problem={problem} />
      ) : isOrdinea ? (
        <OrdineaVisual problem={problem} />
      ) : isRomanNumeral ? (
        <RomanNumeralVisual problem={problem} />
      ) : (
        <DrawingCanvas ref={canvasRef} problem={problem} />
      )}

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
              {isTabla
                ? "Scrie rezultatul înmulțirii."
                : isOrdinea
                  ? "Scrie rezultatul calculului."
                  : isRomanToArabic
                    ? "Scrie numărul cu cifre arabe."
                    : isArabicToRoman
                      ? "Scrie numărul cu cifre romane."
                      : "Scrie rezultatul în centimetri."}
              </p>
            </div>
            <span className={`status-chip ${catColor.soft} ${catColor.text}`}>
              Indicii {hintedProblems.length}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input
              type={isStringAnswer ? "text" : "number"}
              inputMode={isStringAnswer ? "text" : "numeric"}
              value={answer}
              onChange={(e) =>
                setAnswer(
                  isStringAnswer
                    ? e.target.value.toUpperCase()
                    : e.target.value,
                )
              }
              placeholder="?"
              autoCapitalize={isStringAnswer ? "characters" : undefined}
              autoCorrect={isStringAnswer ? "off" : undefined}
              spellCheck={isStringAnswer ? false : undefined}
              maxLength={isStringAnswer ? 12 : undefined}
              className={`h-14 flex-1 rounded-[22px] border border-[#DCCDB1] bg-[#FFFDF8] px-4 text-center text-2xl font-black ${catColor.text} outline-none transition focus:border-[var(--color-board-ink)] focus:bg-white`}
            />
            {unitLabel && (
              <div className="rounded-[22px] bg-[#F5EDDE] px-4 py-4 text-sm font-black text-slate-500">
                {unitLabel}
              </div>
            )}
          </div>

          {feedback === "empty" && (
            <p className="mt-3 text-center text-xs font-black text-kid-coral-dark">
              {isStringAnswer
                ? "Scrie un răspuns în căsuță."
                : "Scrie un număr în căsuță."}
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={handleShowHint}
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

          <p className="mt-3 text-center text-xs font-semibold text-slate-400">
            Indiciile te ajută, dar pot reduce stelele finale.
          </p>
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
          <p className="mt-2 text-sm font-semibold text-kid-green-dark">
            {usedHintOnCurrentProblem
              ? "Ai găsit soluția cu ajutorul indiciului."
              : "Ai rezolvat curat, fără indiciu la această problemă."}
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
            Răspunsul este{" "}
            <span className="font-black">
              {problem.answer}
              {unitLabel ? ` ${unitLabel}` : ""}
            </span>
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
          <div className="mb-3 flex flex-wrap gap-2">
            <span className={`status-chip ${catColor.soft} ${catColor.text}`}>
              Șir maxim {bestStreak}
            </span>
            <span className="status-chip bg-white/80 text-slate-500">
              Indicii folosite {hintedProblems.length}
            </span>
          </div>
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
