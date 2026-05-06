import { useState } from "react";

const MAX_NAME_LENGTH = 20;

const COPY = {
  tabla: {
    kicker: "Tabla înmulțirii",
    description:
      "Numele tău apare în clasament după fiecare sesiune. 10 înmulțiri în 5 minute — gata, start!",
    button: "bg-kid-teal",
    inputText: "text-kid-teal-dark",
    cancelText: "text-kid-teal-dark",
  },
  ordinea: {
    kicker: "Ordinea operațiilor",
    description:
      "Numele tău apare în clasament după fiecare sesiune. 10 probleme în 5 minute — gata, start!",
    button: "bg-kid-pink",
    inputText: "text-kid-pink-dark",
    cancelText: "text-kid-pink-dark",
  },
  romanToArabic: {
    kicker: "Numere romane → arabe",
    description:
      "Numele tău apare în clasament după fiecare sesiune. 10 exerciții în 5 minute — gata, start!",
    button: "bg-kid-purple",
    inputText: "text-kid-purple-dark",
    cancelText: "text-kid-purple-dark",
  },
  arabicToRoman: {
    kicker: "Numere arabe → romane",
    description:
      "Numele tău apare în clasament după fiecare sesiune. 10 exerciții în 5 minute — gata, start!",
    button: "bg-kid-red",
    inputText: "text-kid-red-dark",
    cancelText: "text-kid-red-dark",
  },
};

export default function NamePromptScreen({
  category = "tabla",
  initialName = "",
  onSubmit,
  onCancel,
}) {
  const [name, setName] = useState(initialName);
  const copy = COPY[category] || COPY.tabla;

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = name.trim().slice(0, MAX_NAME_LENGTH);
    onSubmit(trimmed || "Anonim");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-1 pb-6">
      <section className="paper-panel px-5 py-6 text-left">
        <span className="studio-kicker">{copy.kicker}</span>
        <h2 className="mt-3 text-2xl font-black text-[var(--color-board-ink)]">
          Cum te cheamă?
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          {copy.description}
        </p>

        <label className="mt-5 block">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Numele tău
          </span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, MAX_NAME_LENGTH))}
            placeholder="ex. Ana"
            maxLength={MAX_NAME_LENGTH}
            autoFocus
            className={`mt-2 h-14 w-full rounded-[22px] border border-[#DCCDB1] bg-[#FFFDF8] px-4 text-center text-2xl font-black ${copy.inputText} outline-none transition focus:border-[var(--color-board-ink)] focus:bg-white`}
          />
        </label>

        <p className="mt-3 text-center text-xs font-semibold text-slate-400">
          Maxim {MAX_NAME_LENGTH} caractere. Lasă gol pentru „Anonim".
        </p>
      </section>

      <div className="space-y-2">
        <button
          type="submit"
          className={`action-primary studio-button w-full ${copy.button} text-white`}
        >
          Începe sesiunea
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`action-secondary studio-button w-full border border-[var(--color-board-line)] bg-white/90 ${copy.cancelText}`}
        >
          Înapoi
        </button>
      </div>
    </form>
  );
}
