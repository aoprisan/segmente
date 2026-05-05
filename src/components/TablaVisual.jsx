export default function TablaVisual({ problem }) {
  const factors = problem?.factors;
  const rows = Math.max(1, Math.min(10, factors?.a ?? 1));
  const cols = Math.max(1, Math.min(10, factors?.b ?? 1));

  return (
    <section className="paper-panel px-5 py-6">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-kid-teal-dark">
        Tabla înmulțirii
      </p>
      <div className="mt-3 flex items-center justify-center rounded-[24px] bg-kid-teal-light px-4 py-6">
        <span className="text-4xl font-black tracking-tight text-kid-teal-dark sm:text-5xl">
          {factors ? `${factors.a} × ${factors.b}` : problem?.question} = ?
        </span>
      </div>

      <div className="mt-4 flex justify-center">
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: rows * cols }, (_, i) => (
            <span
              key={i}
              className="block h-3 w-3 rounded-full bg-kid-teal sm:h-4 sm:w-4"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-xs font-semibold text-slate-500">
        {rows} rânduri × {cols} coloane
      </p>
    </section>
  );
}
