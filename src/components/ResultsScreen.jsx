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
  } = result;

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

      <div className="space-y-2">
        <button
          onClick={onHome}
          className="action-primary studio-button w-full bg-kid-purple text-white"
        >
          Alege altă categorie
        </button>
        <button
          onClick={onReplay}
          className="action-secondary studio-button w-full border border-[var(--color-board-line)] bg-white/90 text-kid-purple-dark"
        >
          Joacă din nou
        </button>
      </div>
    </div>
  );
}
