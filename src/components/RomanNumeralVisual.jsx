const LEGEND = [
  { roman: "I", arabic: 1 },
  { roman: "V", arabic: 5 },
  { roman: "X", arabic: 10 },
  { roman: "L", arabic: 50 },
  { roman: "C", arabic: 100 },
];

const COLORS_BY_CATEGORY = {
  romanToArabic: {
    kicker: "text-kid-purple-dark",
    soft: "bg-kid-purple-light",
    text: "text-kid-purple-dark",
    label: "Numere romane → arabe",
  },
  arabicToRoman: {
    kicker: "text-kid-red-dark",
    soft: "bg-kid-red-light",
    text: "text-kid-red-dark",
    label: "Numere arabe → romane",
  },
};

export default function RomanNumeralVisual({ problem }) {
  const colors =
    COLORS_BY_CATEGORY[problem?.category] || COLORS_BY_CATEGORY.romanToArabic;

  return (
    <section className="paper-panel px-5 py-6">
      <p
        className={`text-[11px] font-black uppercase tracking-[0.18em] ${colors.kicker}`}
      >
        {colors.label}
      </p>
      <div
        className={`mt-3 flex items-center justify-center rounded-[24px] ${colors.soft} px-4 py-6`}
      >
        <span
          className={`text-4xl font-black tracking-tight ${colors.text} sm:text-5xl`}
        >
          {problem?.question}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-center text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
          Cifrele romane
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {LEGEND.map(({ roman, arabic }) => (
            <span
              key={roman}
              className="inline-flex items-baseline gap-1.5 rounded-full bg-white/70 px-3 py-1 text-sm font-black text-slate-600 shadow-[inset_0_0_0_1px_rgba(232,218,192,0.7)]"
            >
              <span className={colors.text}>{roman}</span>
              <span className="text-xs font-semibold text-slate-400">
                = {arabic}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
