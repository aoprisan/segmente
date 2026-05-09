import {
  CATEGORY_LABELS,
  getDaysActiveCount,
  getOverallAccuracy,
} from "../utils/gamification";
import { formatElapsedTime } from "../utils/leaderboard";

const CATEGORY_ACCENTS = {
  suma: { soft: "bg-kid-blue-light", text: "text-kid-blue-dark" },
  diferenta: { soft: "bg-kid-coral-light", text: "text-kid-coral-dark" },
  dublu: { soft: "bg-kid-green-light", text: "text-kid-green-dark" },
  mixt: { soft: "bg-kid-purple-light", text: "text-kid-purple-dark" },
  tabla: { soft: "bg-kid-teal-light", text: "text-kid-teal-dark" },
  ordinea: { soft: "bg-kid-pink-light", text: "text-kid-pink-dark" },
  romanToArabic: { soft: "bg-kid-purple-light", text: "text-kid-purple-dark" },
  arabicToRoman: { soft: "bg-kid-red-light", text: "text-kid-red-dark" },
};

const DEFAULT_ACCENT = { soft: "bg-kid-amber-light", text: "text-kid-amber-dark" };

function formatAccuracy(ratio) {
  return `${Math.round((ratio || 0) * 100)}%`;
}

function formatDate(timestamp) {
  if (!timestamp) {
    return "—";
  }
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function SummaryTile({ label, value, sublabel, soft, text }) {
  return (
    <div className={`rounded-[24px] ${soft} px-4 py-4 text-center`}>
      <div className={`text-2xl font-black ${text}`}>{value}</div>
      <div className={`mt-1 text-[11px] font-black uppercase tracking-[0.18em] ${text}`}>
        {label}
      </div>
      {sublabel && (
        <div className={`mt-1 text-[11px] font-semibold ${text} opacity-80`}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

function StarRow({ count }) {
  const filled = Math.max(0, Math.min(3, count || 0));
  return (
    <span aria-label={`${filled} din 3 stele`} className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`text-sm font-black ${i < filled ? "text-kid-amber-dark" : "text-slate-300"}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function StatsScreen({ progress, onBack }) {
  const stats = progress?.stats;
  const totalProblems = stats?.totalProblems || 0;
  const accuracy = getOverallAccuracy(stats);
  const daysActive = getDaysActiveCount(stats);
  const currentStreak = stats?.currentStreak || 0;
  const longestStreak = stats?.longestStreak || 0;
  const totalElapsedMs = stats?.totalElapsedMs || 0;
  const totalHintsUsed = stats?.totalHintsUsed || 0;
  const recentSessions = stats?.recentSessions || [];

  const playedCategories = Object.entries(stats?.perCategory || {})
    .filter(([, value]) => value && value.sessions > 0)
    .sort((a, b) => b[1].problems - a[1].problems);

  const isEmpty = totalProblems === 0;

  return (
    <div className="space-y-4 px-1 pb-6">
      {onBack && (
        <div className="px-1">
          <button
            onClick={onBack}
            className="utility-pill studio-button text-xs"
          >
            ← Înapoi
          </button>
        </div>
      )}

      <section className="studio-panel px-5 py-5 text-left">
        <span className="studio-kicker">Statisticile tale</span>
        <h2 className="mt-3 text-2xl font-black text-[var(--color-board-ink)]">
          Cât ai exersat
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Tot ce ai construit până acum, într-un singur loc.
        </p>
      </section>

      {isEmpty ? (
        <section className="studio-panel px-5 py-6 text-center">
          <div className="text-4xl">📊</div>
          <h3 className="mt-3 text-lg font-black text-[var(--color-board-ink)]">
            Nu există încă statistici
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            Joacă prima rundă și revino aici ca să vezi cât ai exersat și unde te descurci cel mai bine.
          </p>
        </section>
      ) : (
        <>
          <section className="studio-panel px-5 py-5 text-left">
            <span className="studio-kicker">Pe scurt</span>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <SummaryTile
                label="Probleme"
                value={totalProblems}
                sublabel={`${stats.totalCorrect} corecte`}
                soft="bg-kid-blue-light"
                text="text-kid-blue-dark"
              />
              <SummaryTile
                label="Acuratețe"
                value={formatAccuracy(accuracy)}
                sublabel={totalHintsUsed > 0 ? `${totalHintsUsed} indicii` : "fără indicii"}
                soft="bg-kid-green-light"
                text="text-kid-green-dark"
              />
              <SummaryTile
                label="Timp total"
                value={formatElapsedTime(totalElapsedMs)}
                sublabel={`${progress.sessionsPlayed} runde`}
                soft="bg-kid-amber-light"
                text="text-kid-amber-dark"
              />
              <SummaryTile
                label="Serie zile"
                value={currentStreak}
                sublabel={`record: ${longestStreak}`}
                soft="bg-kid-purple-light"
                text="text-kid-purple-dark"
              />
            </div>
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
              Ai jucat în <span className="font-black text-[var(--color-board-ink)]">{daysActive}</span> {daysActive === 1 ? "zi" : "zile"}.
              {stats.lastPlayedDate && (
                <> Ultima sesiune: <span className="font-black text-[var(--color-board-ink)]">{stats.lastPlayedDate}</span>.</>
              )}
            </p>
          </section>

          <section className="studio-panel px-5 py-5 text-left">
            <span className="studio-kicker">Pe categorii</span>
            <h3 className="mt-3 text-xl font-black text-[var(--color-board-ink)]">
              Unde ai exersat
            </h3>

            {playedCategories.length === 0 ? (
              <p className="mt-4 rounded-[22px] bg-white/85 px-4 py-4 text-sm font-semibold text-slate-500">
                Joacă o rundă ca să vezi defalcarea pe categorii.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {playedCategories.map(([categoryId, value]) => {
                  const accent = CATEGORY_ACCENTS[categoryId] || DEFAULT_ACCENT;
                  const catAccuracy = value.problems > 0 ? value.correct / value.problems : 0;
                  return (
                    <li
                      key={categoryId}
                      className="rounded-[22px] bg-white/85 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(232,218,192,0.6)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-sm font-black ${accent.text}`}>
                          {CATEGORY_LABELS[categoryId] || categoryId}
                        </span>
                        <span className={`status-chip ${accent.soft} ${accent.text}`}>
                          {value.sessions} {value.sessions === 1 ? "rundă" : "runde"}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.14em]">
                        <span className="status-chip bg-kid-blue-light text-kid-blue-dark">
                          {value.correct}/{value.problems}
                        </span>
                        <span className="status-chip bg-kid-green-light text-kid-green-dark">
                          {formatAccuracy(catAccuracy)}
                        </span>
                        <span className="status-chip bg-kid-amber-light text-kid-amber-dark">
                          {formatElapsedTime(value.elapsedMs)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="studio-panel px-5 py-5 text-left">
            <span className="studio-kicker">Ultimele runde</span>
            <h3 className="mt-3 text-xl font-black text-[var(--color-board-ink)]">
              Sesiuni recente
            </h3>

            {recentSessions.length === 0 ? (
              <p className="mt-4 rounded-[22px] bg-white/85 px-4 py-4 text-sm font-semibold text-slate-500">
                Nu există încă sesiuni înregistrate.
              </p>
            ) : (
              <ol className="mt-4 space-y-2">
                {recentSessions.map((session) => {
                  const accent = CATEGORY_ACCENTS[session.category] || DEFAULT_ACCENT;
                  return (
                    <li
                      key={session.completedAt}
                      className="rounded-[22px] bg-white/85 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(232,218,192,0.6)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className={`truncate text-sm font-black ${accent.text}`}>
                            {CATEGORY_LABELS[session.category] || session.category}
                          </div>
                          <div className="mt-0.5 text-[11px] font-semibold text-slate-500">
                            {formatDate(session.completedAt)}
                            {session.mode === "daily" && " · Provocarea zilei"}
                          </div>
                        </div>
                        <StarRow count={session.stars} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.14em]">
                        <span className="status-chip bg-kid-blue-light text-kid-blue-dark">
                          {session.score}/{session.total}
                        </span>
                        <span className="status-chip bg-kid-amber-light text-kid-amber-dark">
                          {formatElapsedTime(session.elapsedMs)}
                        </span>
                        {session.bestStreak > 0 && (
                          <span className="status-chip bg-kid-purple-light text-kid-purple-dark">
                            șir {session.bestStreak}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </>
      )}
    </div>
  );
}
