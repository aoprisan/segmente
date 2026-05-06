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
    </section>
  );
}
