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
];

export default function MenuScreen({ onStart }) {
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

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onStart(cat.id)}
            className={`studio-panel studio-button flex min-h-[190px] flex-col items-start rounded-[26px] border p-4 text-left ${cat.borderClass}`}
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

      <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        Alege o categorie și rezolvă 5 probleme
      </p>
    </div>
  );
}
