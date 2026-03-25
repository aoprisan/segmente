import { useState, useCallback } from "react";
import MenuScreen from "./components/MenuScreen";
import GameScreen from "./components/GameScreen";
import ResultsScreen from "./components/ResultsScreen";
import { createSeededRng, generateSession } from "./utils/problems";
import {
  applySessionProgress,
  getBestCategory,
  getTodayChallengeKey,
  isDailyChallengeComplete,
  loadProgress,
  saveProgress,
} from "./utils/gamification";

export default function App() {
  const [screen, setScreen] = useState("menu"); // menu | game | results
  const [sessionConfig, setSessionConfig] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [progress, setProgress] = useState(loadProgress);
  const [gameKey, setGameKey] = useState(0);

  const dailyChallengeId = getTodayChallengeKey();
  const bestCategory = getBestCategory(progress);
  const dailyChallenge = {
    id: dailyChallengeId,
    completed: isDailyChallengeComplete(progress, dailyChallengeId),
  };

  const openSession = useCallback((nextSessionConfig) => {
    setSessionConfig(nextSessionConfig);
    setScreen("game");
    setGameKey((value) => value + 1);
  }, []);

  const startCategoryGame = useCallback((cat) => {
    openSession({
      category: cat,
      mode: "standard",
      sessionId: null,
      sessionLabel: null,
      problems: generateSession(cat, 5),
    });
  }, [openSession]);

  const startDailyChallenge = useCallback(() => {
    const sessionId = getTodayChallengeKey();
    const rng = createSeededRng(sessionId);

    openSession({
      category: "mixt",
      mode: "daily",
      sessionId,
      sessionLabel: "Provocarea zilei",
      problems: generateSession("mixt", 5, rng),
    });
  }, [openSession]);

  const handleFinish = useCallback((sessionResult) => {
    const appliedResult = applySessionProgress(progress, sessionResult);
    setProgress(appliedResult.progress);
    saveProgress(appliedResult.progress);
    setFinalResult({
      ...sessionResult,
      sessionAchievements: appliedResult.sessionAchievements,
      newlyUnlockedBadges: appliedResult.newlyUnlockedBadges,
      dailyBonusAwarded: appliedResult.dailyBonusAwarded,
      totalStarsAdded: appliedResult.totalStarsAdded,
    });
    setScreen("results");
  }, [progress]);

  const goHome = useCallback(() => setScreen("menu"), []);

  const replay = useCallback(() => {
    setSessionConfig((currentSession) => {
      if (!currentSession) {
        return currentSession;
      }

      if (currentSession.mode === "daily") {
        const rng = createSeededRng(currentSession.sessionId || getTodayChallengeKey());
        return {
          ...currentSession,
          problems: generateSession(currentSession.category, 5, rng),
        };
      }

      return {
        ...currentSession,
        problems: generateSession(currentSession.category, 5),
      };
    });

    setScreen("game");
    setGameKey((value) => value + 1);
  }, []);

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
          {screen === "menu" && (
            <MenuScreen
              onStart={startCategoryGame}
              onStartDaily={startDailyChallenge}
              progress={progress}
              bestCategory={bestCategory}
              dailyChallenge={dailyChallenge}
            />
          )}

          {screen === "game" && sessionConfig && (
            <GameScreen
              key={gameKey}
              problems={sessionConfig.problems}
              category={sessionConfig.category}
              sessionMode={sessionConfig.mode}
              sessionId={sessionConfig.sessionId}
              sessionLabel={sessionConfig.sessionLabel}
              onFinish={handleFinish}
              onHome={goHome}
            />
          )}

          {screen === "results" && finalResult && (
            <ResultsScreen
              result={finalResult}
              onHome={goHome}
              onReplay={replay}
            />
          )}
        </main>
      </div>
    </div>
  );
}
