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

  return (
    <div className="mx-auto max-w-[480px] min-h-dvh">
      {/* Header */}
      <header className="pt-6 pb-2 text-center">
        <h1 className="text-xl font-extrabold tracking-tight text-kid-purple">
          Probleme cu segmente
        </h1>
        <p className="mt-0.5 text-xs font-semibold text-gray-400">
          Clasa a III-a — Desenează și rezolvă!
        </p>
      </header>

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
    </div>
  );
}
