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

const ordineaIcon = (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <text
      x="24"
      y="20"
      textAnchor="middle"
      fontSize="13"
      fontWeight="800"
      fill="#72243E"
    >
      (a+b)
    </text>
    <text
      x="24"
      y="38"
      textAnchor="middle"
      fontSize="14"
      fontWeight="800"
      fill="#D4537E"
    >
      × c
    </text>
  </svg>
);

function LeaderboardSection({
  title,
  subtitle,
  entries,
  emptyText,
  accentSoft,
  accentText,
  accentBorder,
}) {
  return (
    <section className="studio-panel px-5 py-5 text-left">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="studio-kicker">Clasament</span>
          <h2 className="mt-3 text-xl font-black text-[var(--color-board-ink)]">
            {title}
          </h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>
        </div>
        <span className={`status-chip ${accentSoft} ${accentText}`}>
          Top {Math.max(entries.length, 1)}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className={`mt-4 rounded-[22px] ${accentSoft} px-4 py-4 text-sm font-semibold ${accentText}`}>
          {emptyText}
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {entries.map((entry, i) => (
            <li
              key={`${entry.completedAt}-${i}`}
              className={`flex items-center justify-between gap-3 rounded-[22px] bg-white/85 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(232,218,192,0.6)] ${accentBorder ? `border ${accentBorder}` : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${accentSoft} text-sm font-black ${accentText}`}>
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
  );
}

export default function LandingScreen({
  onChooseSegmente,
  onChooseTabla,
  onChooseOrdinea,
}) {
  const [tablaLeaderboard, setTablaLeaderboard] = useState([]);
  const [ordineaLeaderboard, setOrdineaLeaderboard] = useState([]);

  useEffect(() => {
    setTablaLeaderboard(loadLeaderboard("tabla"));
    setOrdineaLeaderboard(loadLeaderboard("ordinea"));
  }, []);

  return (
    <div className="space-y-4 px-1 pb-6">
      <section className="studio-panel px-5 py-5 text-left">
        <span className="studio-kicker">Alege jocul</span>
        <h2 className="mt-3 text-2xl font-black text-[var(--color-board-ink)]">
          Cu ce vrei să te joci azi?
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Trei jocuri de matematică pentru clasa a III-a. Alege și începe.
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

        <button
          onClick={onChooseOrdinea}
          className="studio-panel studio-button flex min-h-[170px] flex-col items-start rounded-[26px] border border-kid-pink p-5 text-left"
        >
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-kid-pink-light">
            {ordineaIcon}
          </span>
          <span className="text-lg font-black text-kid-pink-dark">
            Ordinea operațiilor
          </span>
          <span className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            10 probleme în 5 minute. Paranteze, ×, ÷, +, − — în ordinea corectă.
          </span>
          <span className="mt-auto inline-flex rounded-full bg-kid-pink-light px-4 py-1.5 text-xs font-black text-kid-pink-dark">
            Începe
          </span>
        </button>
      </div>

      <LeaderboardSection
        title="Tabla înmulțirii"
        subtitle="10 înmulțiri, 5 minute pe sesiune."
        entries={tablaLeaderboard}
        emptyText="Nu există încă scoruri. Joacă tabla înmulțirii și fii primul!"
        accentSoft="bg-kid-teal-light"
        accentText="text-kid-teal-dark"
      />

      <LeaderboardSection
        title="Ordinea operațiilor"
        subtitle="10 probleme, 5 minute pe sesiune."
        entries={ordineaLeaderboard}
        emptyText="Nu există încă scoruri. Joacă ordinea operațiilor și fii primul!"
        accentSoft="bg-kid-pink-light"
        accentText="text-kid-pink-dark"
      />
    </div>
  );
}
