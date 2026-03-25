const categories = [
  {
    id: "suma",
    label: "Suma segmentelor",
    color: "kid-blue",
    borderClass: "border-kid-blue",
    textClass: "text-kid-blue-dark",
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
    color: "kid-coral",
    borderClass: "border-kid-coral",
    textClass: "text-kid-coral-dark",
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
    color: "kid-green",
    borderClass: "border-kid-green",
    textClass: "text-kid-green-dark",
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
    color: "kid-purple",
    borderClass: "border-kid-purple",
    textClass: "text-kid-purple-dark",
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
    <div className="px-4 pt-2 pb-8">
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onStart(cat.id)}
            className={`flex flex-col items-center rounded-2xl border-2 ${cat.borderClass} bg-white p-5 text-center transition-transform active:scale-95`}
          >
            <span className="mb-2">{cat.icon}</span>
            <span className={`text-sm font-bold ${cat.textClass}`}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-xs font-semibold text-gray-400">
        Alege o categorie și rezolvă 5 probleme!
      </p>
    </div>
  );
}
