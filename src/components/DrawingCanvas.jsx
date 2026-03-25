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
    const w = parent.clientWidth - 16;
    const h = 220;
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
    <div className="mt-3">
      {/* Canvas */}
      <div className="mx-4 rounded-2xl border-2 border-dashed border-kid-amber bg-canvas-bg p-2">
        <canvas
          ref={canvasRef}
          className="block w-full rounded-xl"
          style={{ touchAction: "none" }}
          onPointerDown={handleStart}
          onPointerMove={handleMove}
          onPointerUp={handleEnd}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap justify-center gap-1.5 px-4 py-2">
        {toolKeys.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTool(t)}
            className={`rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition-all ${
              activeTool === t
                ? "border-kid-purple bg-kid-purple-light text-kid-purple-dark"
                : "border-gray-200 bg-white text-gray-600"
            }`}
          >
            {TOOLS[t].label}
          </button>
        ))}

        <div className="mx-1 w-px bg-gray-200" />

        {colorKeys.map((c) => (
          <button
            key={c}
            onClick={() => setActiveColor(c)}
            className="rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition-all"
            style={{
              borderColor:
                activeColor === c ? COLORS[c].stroke : "transparent",
              backgroundColor:
                activeColor === c ? COLORS[c].fill : "transparent",
              color: COLORS[c].stroke,
            }}
          >
            {COLORS[c].label}
          </button>
        ))}

        <div className="mx-1 w-px bg-gray-200" />

        <button
          onClick={undo}
          className="rounded-xl border-2 border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-500"
        >
          Anulează
        </button>
        <button
          onClick={clear}
          className="rounded-xl border-2 border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-500"
        >
          Șterge tot
        </button>
      </div>
    </div>
  );
});

export default DrawingCanvas;
