export default function ResultsScreen({ score, total, onHome, onReplay }) {
  const wrong = total - score;
  const ratio = score / total;

  let emoji, title, subtitle;
  if (ratio === 1) {
    emoji = "star";
    title = "Felicitări! Totul corect!";
    subtitle = "Ești un campion la segmente!";
  } else if (ratio >= 0.6) {
    emoji = "smile";
    title = "Foarte bine!";
    subtitle = "Mai exersează puțin și vei fi perfect!";
  } else {
    emoji = "think";
    title = "Mai încearcă!";
    subtitle = "Exercițiul face perfecțiunea!";
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
    <div className="px-4 pt-8 pb-8 text-center">
      <div className="mb-3 flex justify-center">{faces[emoji]}</div>

      <h2 className="text-2xl font-extrabold text-kid-purple">{title}</h2>
      <p className="mt-1 text-sm font-semibold text-gray-400">{subtitle}</p>

      <div className="mx-auto mt-6 flex max-w-[240px] gap-3">
        <div className="flex-1 rounded-2xl bg-kid-green-light px-4 py-4 text-center">
          <div className="text-3xl font-black text-kid-green-dark">{score}</div>
          <div className="text-xs font-bold text-kid-green-dark">Corecte</div>
        </div>
        <div className="flex-1 rounded-2xl bg-kid-coral-light px-4 py-4 text-center">
          <div className="text-3xl font-black text-kid-coral-dark">{wrong}</div>
          <div className="text-xs font-bold text-kid-coral-dark">Greșite</div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-[320px] flex-col gap-2">
        <button
          onClick={onHome}
          className="w-full rounded-xl bg-kid-purple py-3.5 text-sm font-bold text-white transition-transform active:scale-95"
        >
          Alege altă categorie
        </button>
        <button
          onClick={onReplay}
          className="w-full rounded-xl border-2 border-kid-purple bg-white py-3 text-sm font-bold text-kid-purple transition-transform active:scale-95"
        >
          Joacă din nou
        </button>
      </div>
    </div>
  );
}
