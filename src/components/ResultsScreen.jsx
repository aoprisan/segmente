import { useEffect, useRef, useState } from "react";
import {
  formatElapsedTime,
  loadLeaderboard,
  loadPlayerName,
  saveLeaderboardEntry,
} from "../utils/leaderboard";

function StarIcon({ filled }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.6 14.94 8.56l6.58.96-4.76 4.64 1.13 6.56L12 17.64l-5.89 3.08 1.13-6.56-4.76-4.64 6.58-.96L12 2.6Z"
        fill={filled ? "#EF9F27" : "#F4E8D0"}
        stroke={filled ? "#B46D0A" : "#D4C4A7"}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ResultsScreen({ result, onHome, onReplay }) {
  const {
    score,
    total,
    wrong,
    stars,
    hintsUsed,
    bestStreak,
    sessionAchievements,
    newlyUnlockedBadges,
    dailyBonusAwarded,
    totalStarsAdded,
    mode,
    sessionLabel,
    category,
    elapsedMs,
    timedOut,
  } = result;

  const isTabla = category === "tabla";
  const isOrdinea = category === "ordinea";
  const isTimed = isTabla || isOrdinea;
  const leaderboardCategory = isOrdinea ? "ordinea" : "tabla";
  const leaderboardAccent = isOrdinea
    ? {
        kicker: "text-kid-pink-dark",
        soft: "bg-kid-pink-light",
        softText: "text-kid-pink-dark",
        border: "border-kid-pink",
        chip: "bg-kid-pink-light text-kid-pink-dark",
        rankBg: "bg-kid-pink",
        timeChip: "bg-kid-pink-light text-kid-pink-dark",
      }
    : {
        kicker: "text-kid-teal-dark",
        soft: "bg-kid-teal-light",
        softText: "text-kid-teal-dark",
        border: "border-kid-teal",
        chip: "bg-kid-teal-light text-kid-teal-dark",
        rankBg: "bg-kid-teal",
        timeChip: "bg-kid-teal-light text-kid-teal-dark",
      };
  const savedRef = useRef(false);
  const [leaderboard, setLeaderboard] = useState(() =>
    isTimed ? loadLeaderboard(leaderboardCategory) : [],
  );
  const [highlightRank, setHighlightRank] = useState(null);

  useEffect(() => {
    if (!isTimed || savedRef.current) {
      return;
    }
    savedRef.current = true;
    const playerName = loadPlayerName() || "Anonim";
    const { entries, rank } = saveLeaderboardEntry(
      {
        name: playerName,
        score,
        total,
        elapsedMs: elapsedMs ?? 0,
        completedAt: Date.now(),
      },
      leaderboardCategory,
    );
    setLeaderboard(entries);
    setHighlightRank(rank);
  }, [isTimed, leaderboardCategory, score, total, elapsedMs]);

  let emoji;
  let title;
  let subtitle;

  if (stars === 3) {
    emoji = "star";
    title = "Rundă perfectă!";
    subtitle = "Ai păstrat un ritm excelent și ai luat toate cele 3 stele.";
  } else if (stars >= 2) {
    emoji = "smile";
    title = "Foarte bine!";
    subtitle = "Runda a ieșit puternic. Încă puțin și ajungi la perfecțiune.";
  } else if (stars === 1) {
    emoji = "smile";
    title = "Ai făcut progres!";
    subtitle = "Ai strâns deja o stea. Mai joacă o rundă pentru un rezultat și mai bun.";
  } else {
    emoji = "think";
    title = "Mai încearcă!";
    subtitle = "Runda aceasta a fost de încălzire. Desenul și pașii te pot ajuta la următoarea.";
  }

  const faces = {
    star: (
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="30" fill="#FAEEDA" />
        <circle cx="22" cy="26" r="3.5" fill="#854F0B" />
        <circle cx="42" cy="26" r="3.5" fill="#854F0B" />
        <path
          d="M20 38 Q32 50 44 38"
          stroke="#854F0B"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M32 2 L35 10 L43 10 L37 15 L39 23 L32 18 L25 23 L27 15 L21 10 L29 10 Z"
          fill="#EF9F27"
          opacity="0.6"
        />
      </svg>
    ),
    smile: (
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="30" fill="#E6F1FB" />
        <circle cx="22" cy="26" r="3.5" fill="#185FA5" />
        <circle cx="42" cy="26" r="3.5" fill="#185FA5" />
        <path
          d="M22 38 Q32 46 42 38"
          stroke="#185FA5"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    ),
    think: (
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="30" fill="#FBEAF0" />
        <circle cx="22" cy="26" r="3.5" fill="#72243E" />
        <circle cx="42" cy="26" r="3.5" fill="#72243E" />
        <line
          x1="24"
          y1="40"
          x2="40"
          y2="40"
          stroke="#72243E"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  };

  return (
    <div className="space-y-4 px-1 pt-2 pb-6 text-center">
      <section className="paper-panel px-5 py-6">
        <div className="mb-4 flex justify-center">{faces[emoji]}</div>
        <span className="studio-kicker">
          {sessionLabel || (mode === "daily" ? "Provocarea zilei" : "Rezumatul sesiunii")}
        </span>
        <h2 className="mt-4 text-2xl font-black text-[var(--color-board-ink)]">
          {title}
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          {subtitle}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <StarIcon key={index} filled={index < stars} />
          ))}
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-500">
          Ai adunat{" "}
          <span className="font-black text-[var(--color-board-ink)]">{totalStarsAdded}</span>{" "}
          stele pentru colecția ta.
        </p>
        {mode === "daily" && (
          <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-kid-amber-dark">
            {dailyBonusAwarded ? "Bonusul zilnic a fost adăugat." : "Bonusul zilnic a fost deja revendicat astăzi."}
          </p>
        )}
        {isTimed && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className={`status-chip ${leaderboardAccent.timeChip}`}>
              Timp: {formatElapsedTime(elapsedMs ?? 0)}
            </span>
            {timedOut && (
              <span className="status-chip bg-kid-coral-light text-kid-coral-dark">
                Timpul s-a scurs!
              </span>
            )}
            {highlightRank && (
              <span className="status-chip bg-kid-amber-light text-kid-amber-dark">
                Locul #{highlightRank}
              </span>
            )}
          </div>
        )}
      </section>

      <section className="studio-panel px-4 py-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[24px] bg-kid-green-light px-4 py-5 text-center">
            <div className="text-3xl font-black text-kid-green-dark">{score}</div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-kid-green-dark">
              Corecte
            </div>
          </div>
          <div className="rounded-[24px] bg-kid-coral-light px-4 py-5 text-center">
            <div className="text-3xl font-black text-kid-coral-dark">{wrong}</div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-kid-coral-dark">
              Greșite
            </div>
          </div>
          <div className="rounded-[24px] bg-kid-purple-light px-4 py-5 text-center">
            <div className="text-3xl font-black text-kid-purple-dark">{bestStreak}</div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-kid-purple-dark">
              Șir maxim
            </div>
          </div>
          <div className="rounded-[24px] bg-kid-amber-light px-4 py-5 text-center">
            <div className="text-3xl font-black text-kid-amber-dark">{hintsUsed}</div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-kid-amber-dark">
              Indicii
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Ai rezolvat <span className="font-black text-[var(--color-board-ink)]">{score}</span> din{" "}
          <span className="font-black text-[var(--color-board-ink)]">{total}</span> probleme.
        </p>
      </section>

      {sessionAchievements.length > 0 && (
        <section className="studio-panel px-4 py-4 text-left">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-kid-teal-dark">
            Insignele rundei
          </p>
          <div className="mt-3 space-y-2">
            {sessionAchievements.map((achievement) => {
              const isNewBadge = newlyUnlockedBadges.some(
                (badge) => badge.id === achievement.id,
              );

              return (
                <div
                  key={achievement.id}
                  className="rounded-[22px] border border-kid-teal bg-kid-teal-light px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-kid-teal-dark">
                        {achievement.title}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-kid-teal-dark">
                        {achievement.description}
                      </p>
                    </div>
                    {isNewBadge && (
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-kid-teal-dark">
                        Nouă
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {isTimed && (
        <section className="studio-panel px-4 py-4 text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`text-[11px] font-black uppercase tracking-[0.18em] ${leaderboardAccent.kicker}`}>
                Clasament
              </p>
              <h3 className="mt-1 text-lg font-black text-[var(--color-board-ink)]">
                Cele mai bune scoruri
              </h3>
            </div>
            <span className={`status-chip ${leaderboardAccent.chip}`}>
              Top 10
            </span>
          </div>

          {leaderboard.length === 0 ? (
            <p className={`mt-4 rounded-[22px] ${leaderboardAccent.soft} px-4 py-4 text-sm font-semibold ${leaderboardAccent.softText}`}>
              Nu există încă scoruri salvate.
            </p>
          ) : (
            <ol className="mt-3 space-y-2">
              {leaderboard.map((entry, i) => {
                const isCurrent = highlightRank === i + 1;
                return (
                  <li
                    key={`${entry.completedAt}-${i}`}
                    className={`flex items-center justify-between gap-3 rounded-[22px] px-4 py-3 ${
                      isCurrent
                        ? `border ${leaderboardAccent.border} ${leaderboardAccent.soft}`
                        : "bg-white/85 shadow-[inset_0_0_0_1px_rgba(232,218,192,0.6)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
                          isCurrent
                            ? `${leaderboardAccent.rankBg} text-white`
                            : `${leaderboardAccent.soft} ${leaderboardAccent.softText}`
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm font-black text-[var(--color-board-ink)]">
                        {entry.name}
                        {isCurrent && (
                          <span className={`ml-2 text-[10px] font-black uppercase tracking-[0.18em] ${leaderboardAccent.softText}`}>
                            Tu
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="status-chip bg-kid-green-light text-kid-green-dark">
                        {entry.score}/{entry.total}
                      </span>
                      <span className="status-chip bg-kid-amber-light text-kid-amber-dark">
                        {formatElapsedTime(entry.elapsedMs)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}

      <div className="space-y-2">
        <button
          onClick={onHome}
          className="action-primary studio-button w-full bg-kid-purple text-white"
        >
          Alege altă categorie
        </button>
        <button
          onClick={onReplay}
          className={`action-secondary studio-button w-full border border-[var(--color-board-line)] bg-white/90 ${
            isTimed ? leaderboardAccent.softText : "text-kid-purple-dark"
          }`}
        >
          {isTimed ? "Sesiune nouă" : "Joacă din nou"}
        </button>
      </div>
    </div>
  );
}
