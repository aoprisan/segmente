import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import {
  COLORS,
  TOOLS,
  getPointerPos,
  drawStroke,
  redrawCanvas,
} from "../utils/canvas";

const DrawingCanvas = forwardRef(function DrawingCanvas(_, ref) {
  const canvasRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const [activeTool, setActiveTool] = useState("segment");
  const [activeColor, setActiveColor] = useState("blue");
  const [drawing, setDrawing] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const dims = useRef({ w: 0, h: 0 });

  useImperativeHandle(ref, () => ({
    clear: () => setStrokes([]),
  }));

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = window.innerWidth < 420 ? 260 : 300;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dims.current = { w, h };
    redrawCanvas(ctx, w, h, strokes);
  }, [strokes]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) redrawCanvas(ctx, dims.current.w, dims.current.h, strokes);
  }, [strokes]);

  const handleStart = (e) => {
    e.preventDefault();
    setDrawing(true);
    startPos.current = getPointerPos(canvasRef.current, e);
  };

  const handleMove = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPointerPos(canvasRef.current, e);
    redrawCanvas(ctx, dims.current.w, dims.current.h, strokes);
    drawStroke(ctx, {
      tool: activeTool,
      x1: startPos.current.x,
      y1: startPos.current.y,
      x2: pos.x,
      y2: pos.y,
      color: COLORS[activeColor].stroke,
    });
  };

  const handleEnd = (e) => {
    if (!drawing) return;
    setDrawing(false);
    const pos = getPointerPos(canvasRef.current, e.changedTouches?.[0] ? e : e);
    const dx = Math.abs(pos.x - startPos.current.x);
    const dy = Math.abs(pos.y - startPos.current.y);
    if (dx < 5 && dy < 5) return;

    if (activeTool === "label") {
      const text = prompt("Scrie eticheta (ex: 12 cm, AB):");
      if (!text) return;
      setStrokes((prev) => [
        ...prev,
        {
          tool: activeTool,
          x1: startPos.current.x,
          y1: startPos.current.y,
          x2: pos.x,
          y2: pos.y,
          color: COLORS[activeColor].stroke,
          text,
        },
      ]);
    } else {
      setStrokes((prev) => [
        ...prev,
        {
          tool: activeTool,
          x1: startPos.current.x,
          y1: startPos.current.y,
          x2: pos.x,
          y2: pos.y,
          color: COLORS[activeColor].stroke,
        },
      ]);
    }
  };

  const undo = () => setStrokes((prev) => prev.slice(0, -1));
  const clear = () => setStrokes([]);

  const toolKeys = ["segment", "brace", "label"];
  const colorKeys = ["blue", "coral", "green"];

  return (
    <div className="space-y-3">
      <section className="studio-panel overflow-hidden px-3 py-3">
        <div className="flex items-start justify-between gap-3 px-1 pb-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              Tabla de lucru
            </p>
            <h3 className="mt-1 text-lg font-black text-[var(--color-board-ink)]">
              Desenează segmentele
            </h3>
          </div>
          <span className="status-chip bg-kid-amber-light text-kid-amber-dark">
            Trasează cu degetul
          </span>
        </div>

        <div className="workspace-board">
          <div className="workspace-grid">
            <canvas
              ref={canvasRef}
              className="relative z-[1] block w-full rounded-[22px]"
              style={{ touchAction: "none" }}
              onPointerDown={handleStart}
              onPointerMove={handleMove}
              onPointerUp={handleEnd}
            />
          </div>
        </div>
      </section>

      <section className="studio-panel px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Unelte
          </p>
          <p className="text-xs font-semibold text-slate-500">
            Atinge, trasează, etichetează
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {toolKeys.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTool(t)}
              data-active={activeTool === t}
              className="tool-pill studio-button text-sm"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                activeTool === t
                  ? "bg-white text-[var(--color-board-ink)]"
                  : "bg-[#F4EDDF] text-slate-500"
              }`}
              >
                {TOOLS[t].icon}
              </span>
              <span>{TOOLS[t].label}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--color-board-line)] pt-3">
          {colorKeys.map((c) => (
            <button
              key={c}
              onClick={() => setActiveColor(c)}
              data-active={activeColor === c}
              className="color-pill studio-button text-sm"
              style={{
                color: COLORS[c].stroke,
                backgroundColor:
                  activeColor === c ? COLORS[c].fill : "rgba(255,255,255,0.78)",
              }}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[c].stroke }}
              />
              <span>{COLORS[c].label}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--color-board-line)] pt-3">
          <button onClick={undo} className="utility-pill studio-button text-sm">
            Anulează
          </button>
          <button onClick={clear} className="utility-pill studio-button text-sm">
            Șterge tot
          </button>
        </div>
      </section>
    </div>
  );
});

export default DrawingCanvas;
