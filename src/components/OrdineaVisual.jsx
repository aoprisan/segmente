export default function OrdineaVisual({ problem }) {
  const expression = problem?.expression || problem?.question?.replace(/\s*=\s*\?$/, "") || "";

  return (
    <section className="paper-panel px-5 py-6">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-kid-pink-dark">
        Ordinea operațiilor
      </p>
      <div className="mt-3 flex items-center justify-center rounded-[24px] bg-kid-pink-light px-4 py-7">
        <span className="text-3xl font-black tracking-tight text-kid-pink-dark sm:text-4xl">
          {expression} = ?
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-[18px] bg-kid-pink-light px-2 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-kid-pink-dark">
            1. Paranteze
          </p>
          <p className="mt-1 text-lg font-black text-kid-pink-dark">( )</p>
        </div>
        <div className="rounded-[18px] bg-kid-pink-light px-2 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-kid-pink-dark">
            2. Înmulțire / Împărțire
          </p>
          <p className="mt-1 text-lg font-black text-kid-pink-dark">× ÷</p>
        </div>
        <div className="rounded-[18px] bg-kid-pink-light px-2 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-kid-pink-dark">
            3. Adunare / Scădere
          </p>
          <p className="mt-1 text-lg font-black text-kid-pink-dark">+ −</p>
        </div>
      </div>
    </section>
  );
}
