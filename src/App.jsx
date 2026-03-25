import { useState, useCallback } from "react";
import MenuScreen from "./components/MenuScreen";
import GameScreen from "./components/GameScreen";
import ResultsScreen from "./components/ResultsScreen";
import { generateSession } from "./utils/problems";

export default function App() {
  const [screen, setScreen] = useState("menu"); // menu | game | results
  const [category, setCategory] = useState("suma");
  const [problems, setProblems] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTotal, setFinalTotal] = useState(5);

  const startGame = useCallback((cat) => {
    setCategory(cat);
    setProblems(generateSession(cat, 5));
    setScreen("game");
  }, []);

  const handleFinish = useCallback((score, total) => {
    setFinalScore(score);
    setFinalTotal(total);
    setScreen("results");
  }, []);

  const goHome = useCallback(() => setScreen("menu"), []);

  const replay = useCallback(() => {
    startGame(category);
  }, [category, startGame]);

  const isGameScreen = screen === "game";

  return (
    <div className="mx-auto min-h-dvh max-w-[560px] px-3 py-4 sm:px-4 sm:py-6">
      <div className={`studio-shell ${isGameScreen ? "px-3 py-3 sm:px-5 sm:py-5" : "px-4 py-5 sm:px-5"}`}>
        <header className={`relative px-1 text-center ${isGameScreen ? "pb-3 sm:pb-5" : "pb-5"}`}>
          <span className="studio-kicker">Matematica vizuală</span>
          <h1 className={`font-black tracking-tight text-[var(--color-board-ink)] ${isGameScreen ? "mt-2 text-[1.6rem] sm:mt-3 sm:text-[2.25rem]" : "mt-3 text-[2rem] sm:text-[2.25rem]"}`}>
            Probleme cu segmente
          </h1>
          <p className={`text-sm font-semibold text-slate-500 ${isGameScreen ? "mt-1 hidden sm:block" : "mt-2"}`}>
            Clasa a III-a • Desenează, compară și rezolvă
          </p>
        </header>

        <main className="relative">
          {screen === "menu" && <MenuScreen onStart={startGame} />}

          {screen === "game" && (
            <GameScreen
              key={problems[0]?.text}
              problems={problems}
              category={category}
              onFinish={handleFinish}
              onHome={goHome}
            />
          )}

          {screen === "results" && (
            <ResultsScreen
              score={finalScore}
              total={finalTotal}
              onHome={goHome}
              onReplay={replay}
            />
          )}
        </main>
      </div>
    </div>
  );
}
