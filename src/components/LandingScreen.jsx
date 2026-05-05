import { useEffect, useState } from "react";
import { formatElapsedTime, loadLeaderboard } from "../utils/leaderboard";

const segmenteIcon = (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <line x1="6" y1="16" x2="42" y2="16" stroke="#378ADD" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="6" cy="16" r="3.5" fill="#378ADD" />
    <circle cx="42" cy="16" r="3.5" fill="#378ADD" />
    <line x1="6" y1="32" x2="28" y2="32" stroke="#D85A30" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="6" cy="32" r="3.5" fill="#D85A30" />
    <circle cx="28" cy="32" r="3.5" fill="#D85A30" />
  </svg>
);

const tablaIcon = (
  <svg width="48" height="48" viewBox="0 0 48 48">
    {[8, 24, 40].map((cy) =>
      [8, 24, 40].map((cx) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.2" fill="#1D9E75" />
      )),
    )}
    <text x="24" y="29" textAnchor="middle" fontSize="14" fontWeight="800" fill="#085041">
      ×
    </text>
  </svg>
);

export default function LandingScreen({ onChooseSegmente, onChooseTabla }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    setLeaderboard(loadLeaderboard());
  }, []);

  return (
    <div className="space-y-4 px-1 pb-6">
      <section className="studio-panel px-5 py-5 text-left">
        <span className="studio-kicker">Alege jocul</span>
        <h2 className="mt-3 text-2xl font-black text-[var(--color-board-ink)]">
          Cu ce vrei să te joci azi?
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Două jocuri de matematică pentru clasa a III-a. Alege și începe.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={onChooseSegmente}
          className="studio-panel studio-button flex min-h-[170px] flex-col items-start rounded-[26px] border border-kid-blue p-5 text-left"
        >
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-kid-blue-light">
            {segmenteIcon}
          </span>
          <span className="text-lg font-black text-kid-blue-dark">
            Probleme cu segmente
          </span>
          <span className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            Desenează, compară și rezolvă probleme cu segmente. 5 probleme pe rundă.
          </span>
          <span className="mt-auto inline-flex rounded-full bg-kid-blue-light px-4 py-1.5 text-xs font-black text-kid-blue-dark">
            Începe
          </span>
        </button>

        <button
          onClick={onChooseTabla}
          className="studio-panel studio-button flex min-h-[170px] flex-col items-start rounded-[26px] border border-kid-teal p-5 text-left"
        >
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-kid-teal-light">
            {tablaIcon}
          </span>
          <span className="text-lg font-black text-kid-teal-dark">
            Tabla înmulțirii
          </span>
          <span className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            10 înmulțiri în 5 minute. Bate-ți recordul și intră în clasament!
          </span>
          <span className="mt-auto inline-flex rounded-full bg-kid-teal-light px-4 py-1.5 text-xs font-black text-kid-teal-dark">
            Începe
          </span>
        </button>
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
    </div>
  );
}
