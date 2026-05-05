import { useState } from "react";

const MAX_NAME_LENGTH = 20;

export default function NamePromptScreen({ initialName = "", onSubmit, onCancel }) {
  const [name, setName] = useState(initialName);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = name.trim().slice(0, MAX_NAME_LENGTH);
    onSubmit(trimmed || "Anonim");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-1 pb-6">
      <section className="paper-panel px-5 py-6 text-left">
        <span className="studio-kicker">Tabla înmulțirii</span>
        <h2 className="mt-3 text-2xl font-black text-[var(--color-board-ink)]">
          Cum te cheamă?
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Numele tău apare în clasament după fiecare sesiune. 10 înmulțiri în 5 minute — gata, start!
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
            className="mt-2 h-14 w-full rounded-[22px] border border-[#DCCDB1] bg-[#FFFDF8] px-4 text-center text-2xl font-black text-kid-teal-dark outline-none transition focus:border-[var(--color-board-ink)] focus:bg-white"
          />
        </label>

        <p className="mt-3 text-center text-xs font-semibold text-slate-400">
          Maxim {MAX_NAME_LENGTH} caractere. Lasă gol pentru „Anonim".
        </p>
      </section>

      <div className="space-y-2">
        <button
          type="submit"
          className="action-primary studio-button w-full bg-kid-teal text-white"
        >
          Începe sesiunea
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="action-secondary studio-button w-full border border-[var(--color-board-line)] bg-white/90 text-kid-teal-dark"
        >
          Înapoi
        </button>
      </div>
    </form>
  );
}
