import { useEffect, useState } from "react";
import { TOTAL_BADGES } from "../utils/gamification";
import { formatElapsedTime, loadLeaderboard } from "../utils/leaderboard";

const categories = [
  {
    id: "suma",
    label: "Suma segmentelor",
    borderClass: "border-kid-blue",
    lightClass: "bg-kid-blue-light",
    textClass: "text-kid-blue-dark",
    description: "Adună două lungimi și găsește totalul.",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36">
        <line x1="4" y1="18" x2="32" y2="18" stroke="#378ADD" strokeWidth="3" strokeLinecap="round" />
        <circle cx="4" cy="18" r="3.5" fill="#378ADD" />
        <circle cx="32" cy="18" r="3.5" fill="#378ADD" />
        <text x="18" y="12" textAnchor="middle" fontSize="11" fontWeight="700" fill="#185FA5">A+B</text>
      </svg>
    ),
  },
  {
    id: "diferenta",
    label: "Diferența segmentelor",
    borderClass: "border-kid-coral",
    lightClass: "bg-kid-coral-light",
    textClass: "text-kid-coral-dark",
    description: "Compară două segmente și află cu cât diferă.",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36">
        <line x1="4" y1="13" x2="32" y2="13" stroke="#D85A30" strokeWidth="3" strokeLinecap="round" />
        <line x1="4" y1="25" x2="20" y2="25" stroke="#F0997B" strokeWidth="3" strokeLinecap="round" />
        <circle cx="4" cy="13" r="2.5" fill="#D85A30" />
        <circle cx="32" cy="13" r="2.5" fill="#D85A30" />
        <circle cx="4" cy="25" r="2.5" fill="#F0997B" />
        <circle cx="20" cy="25" r="2.5" fill="#F0997B" />
      </svg>
    ),
  },
  {
    id: "dublu",
    label: "Dublul / jumătatea",
    borderClass: "border-kid-green",
    lightClass: "bg-kid-green-light",
    textClass: "text-kid-green-dark",
    description: "Lucrează cu dublul și jumătatea segmentelor.",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36">
        <line x1="4" y1="13" x2="18" y2="13" stroke="#639922" strokeWidth="3" strokeLinecap="round" />
        <line x1="4" y1="25" x2="32" y2="25" stroke="#97C459" strokeWidth="3" strokeLinecap="round" />
        <text x="11" y="10" textAnchor="middle" fontSize="9" fontWeight="700" fill="#3B6D11">×1</text>
        <text x="18" y="33" textAnchor="middle" fontSize="9" fontWeight="700" fill="#3B6D11">×2</text>
      </svg>
    ),
  },
  {
    id: "mixt",
    label: "Probleme mixte",
    borderClass: "border-kid-purple",
    lightClass: "bg-kid-purple-light",
    textClass: "text-kid-purple-dark",
    description: "Primești provocări din toate categoriile.",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36">
        <line x1="4" y1="10" x2="32" y2="10" stroke="#7F77DD" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="4" y1="20" x2="22" y2="20" stroke="#AFA9EC" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="4" y1="30" x2="14" y2="30" stroke="#CECBF6" strokeWidth="2.5" strokeLinecap="round" />
        <text x="18" y="8" textAnchor="middle" fontSize="9" fontWeight="700" fill="#3C3489">?</text>
      </svg>
    ),
  },
  {
    id: "tabla",
    label: "Tabla înmulțirii",
    borderClass: "border-kid-teal",
    lightClass: "bg-kid-teal-light",
    textClass: "text-kid-teal-dark",
    description: "10 înmulțiri în 5 minute. Bate-ți recordul!",
    fullWidth: true,
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36">
        {[6, 18, 30].map((cy) =>
          [6, 18, 30].map((cx) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r="2.4"
              fill="#1D9E75"
            />
          )),
        )}
        <text x="18" y="22" textAnchor="middle" fontSize="11" fontWeight="800" fill="#085041">×</text>
      </svg>
    ),
  },
];

export default function MenuScreen({
  onStart,
  onStartDaily,
  progress,
  bestCategory,
  dailyChallenge,
}) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    setLeaderboard(loadLeaderboard());
  }, []);

  return (
    <div className="space-y-4 px-1 pb-6">
      <section className="studio-panel px-5 py-5 text-left">
        <span className="studio-kicker">Alege atelierul</span>
        <h2 className="mt-3 text-2xl font-black text-[var(--color-board-ink)]">
          Cu ce vrei să începi?
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Fiecare rundă are 5 probleme și spațiu pentru desen direct pe tablă.
        </p>
      </section>

      <section className="studio-panel px-5 py-5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="studio-kicker">Colecția ta</span>
            <h2 className="mt-3 text-2xl font-black text-[var(--color-board-ink)]">
              Progresul tău
            </h2>
          </div>
          <span className="status-chip bg-kid-amber-light text-kid-amber-dark">
            {progress.totalStars} stele
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-[24px] bg-kid-blue-light px-3 py-4 text-center">
            <div className="text-2xl font-black text-kid-blue-dark">{progress.sessionsPlayed}</div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-kid-blue-dark">
              Runde
            </div>
          </div>
          <div className="rounded-[24px] bg-kid-green-light px-3 py-4 text-center">
            <div className="text-2xl font-black text-kid-green-dark">
              {progress.badges.length}/{TOTAL_BADGES}
            </div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-kid-green-dark">
              Insigne
            </div>
          </div>
          <div className="rounded-[24px] bg-kid-purple-light px-3 py-4 text-center">
            <div className="text-2xl font-black text-kid-purple-dark">{progress.bestStreak}</div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-kid-purple-dark">
              Șir maxim
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
          {bestCategory ? (
            <>
              Cea mai bună categorie este{" "}
              <span className="font-black text-[var(--color-board-ink)]">{bestCategory.label}</span> cu{" "}
              <span className="font-black text-[var(--color-board-ink)]">{bestCategory.stars}/3 stele</span>.
            </>
          ) : (
            "Joacă prima rundă ca să începi colecția de stele și insigne."
          )}
        </p>
      </section>

      <button
        onClick={onStartDaily}
        className="paper-panel studio-button w-full border border-kid-amber px-5 py-5 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="studio-kicker">Provocarea zilei</span>
            <h2 className="mt-3 text-2xl font-black text-[var(--color-board-ink)]">
              Runda fixă de azi
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Primești 5 probleme mixte și poți câștiga un bonus de încă o stea la prima finalizare.
            </p>
          </div>
          <span className="rounded-[24px] bg-kid-amber-light px-4 py-3 text-center text-sm font-black text-kid-amber-dark">
            +1 stea
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="status-chip bg-white/85 text-slate-500">
            {dailyChallenge.id}
          </span>
          <span className={`status-chip ${dailyChallenge.completed ? "bg-kid-green-light text-kid-green-dark" : "bg-kid-amber-light text-kid-amber-dark"}`}>
            {dailyChallenge.completed ? "Bonus revendicat" : "Bonus disponibil"}
          </span>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onStart(cat.id)}
            className={`studio-panel studio-button flex min-h-[190px] flex-col items-start rounded-[26px] border p-4 text-left ${cat.borderClass} ${cat.fullWidth ? "col-span-2" : ""}`}
          >
            <span className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${cat.lightClass}`}>
              {cat.icon}
            </span>
            <span className={`text-sm font-black ${cat.textClass}`}>
              {cat.label}
            </span>
            <span className="mt-2 text-xs font-semibold leading-5 text-slate-500">
              {cat.description}
            </span>
            <span className={`mt-auto inline-flex rounded-full px-3 py-1 text-[11px] font-black ${cat.lightClass} ${cat.textClass}`}>
              Începe
            </span>
          </button>
        ))}
      </div>

      <section className="studio-panel px-5 py-5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="studio-kicker">Clasament</span>
            <h2 className="mt-3 text-xl font-black text-[var(--color-board-ink)]">
              Cele mai bune scoruri
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Tabla înmulțirii — 10 înmulțiri, 5 minute pe sesiune.
            </p>
          </div>
          <span className="status-chip bg-kid-teal-light text-kid-teal-dark">
            Top {Math.max(leaderboard.length, 1)}
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <p className="mt-4 rounded-[22px] bg-kid-teal-light px-4 py-4 text-sm font-semibold text-kid-teal-dark">
            Nu există încă scoruri. Joacă tabla înmulțirii și fii primul!
          </p>
        ) : (
          <ol className="mt-4 space-y-2">
            {leaderboard.map((entry, i) => (
              <li
                key={`${entry.completedAt}-${i}`}
                className="flex items-center justify-between gap-3 rounded-[22px] bg-white/85 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(232,218,192,0.6)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-kid-teal-light text-sm font-black text-kid-teal-dark">
                    {i + 1}
                  </span>
                  <span className="text-sm font-black text-[var(--color-board-ink)]">
                    {entry.name}
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
            ))}
          </ol>
        )}
      </section>

      <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        Categoriile clasice au 5 probleme. Tabla înmulțirii are 10 contra cronometru.
      </p>
    </div>
  );
}
