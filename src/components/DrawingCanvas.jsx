import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  COLORS,
  TOOLS,
  GRID_STEP,
  HALF_GRID_STEP,
  SEGMENT_MIN_LENGTH,
  getPointerPos,
  getGuideMessage,
  getGuideSegments,
  getConnectedSpan,
  getDifferenceSpan,
  hitTestSegment,
  normalizeSegment,
  redrawCanvas,
  snapX,
  snapYToRow,
} from "../utils/canvas";

function createEmptyCanvasState() {
  return {
    segments: [],
    braces: [],
    labels: [],
  };
}

function cloneCanvasState(state) {
  return {
    segments: state.segments.map((segment) => ({ ...segment })),
    braces: state.braces.map((brace) => ({ ...brace })),
    labels: state.labels.map((label) => ({ ...label })),
  };
}

function removeSegmentsAndArtifacts(state, segmentIds) {
  const removedSegmentIds = new Set(segmentIds);
  const removedBraceIds = new Set(
    state.braces
      .filter((brace) => brace.targetIds.some((id) => removedSegmentIds.has(id)))
      .map((brace) => brace.id),
  );

  return {
    segments: state.segments.filter((segment) => !removedSegmentIds.has(segment.id)),
    braces: state.braces.filter((brace) => !removedBraceIds.has(brace.id)),
    labels: state.labels.filter((label) => {
      if (label.targetType === "segment" && removedSegmentIds.has(label.targetId)) {
        return false;
      }
      if (label.targetType === "brace" && removedBraceIds.has(label.targetId)) {
        return false;
      }
      return true;
    }),
  };
}

function upsertLabel(state, nextLabel) {
  const labels = state.labels.filter(
    (label) =>
      !(
        label.targetType === nextLabel.targetType &&
        label.targetId === nextLabel.targetId
      ),
  );

  if (!nextLabel.text.trim()) {
    return {
      ...state,
      labels,
    };
  }

  return {
    ...state,
    labels: [...labels, nextLabel],
  };
}

function getLabelValue(labels, targetType, targetId) {
  return (
    labels.find(
      (label) =>
        label.targetType === targetType && label.targetId === targetId,
    )?.text || ""
  );
}

const DrawingCanvas = forwardRef(function DrawingCanvas({ problem }, ref) {
  const canvasRef = useRef(null);
  const historyRef = useRef([]);
  const nextIdRef = useRef(1);
  const interactionRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const labelInputRef = useRef(null);
  const [canvasState, setCanvasState] = useState(createEmptyCanvasState());
  const [boardSize, setBoardSize] = useState({ w: 0, h: 0 });
  const [draftSegment, setDraftSegment] = useState(null);
  const [activeColor, setActiveColor] = useState("blue");
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);
  const [actionSegmentId, setActionSegmentId] = useState(null);
  const [labelEditor, setLabelEditor] = useState(null);
  const [labelDraft, setLabelDraft] = useState("");

  const { segments, braces, labels } = canvasState;
  const guideSegments = getGuideSegments(problem, boardSize.w);
  const guideMessage = getGuideMessage(problem);
  const actionSegment =
    segments.find((segment) => segment.id === actionSegmentId) || null;
  const connectedSpan = actionSegment
    ? getConnectedSpan(segments, actionSegment.id)
    : null;
  const differenceSpan = actionSegment
    ? getDifferenceSpan(segments, actionSegment.id)
    : null;

  function nextId(prefix) {
    const id = `${prefix}-${nextIdRef.current}`;
    nextIdRef.current += 1;
    return id;
  }

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function resetTransientUi() {
    clearLongPressTimer();
    interactionRef.current = null;
    longPressTriggeredRef.current = false;
    setDraftSegment(null);
    setActionSegmentId(null);
    setLabelEditor(null);
    setLabelDraft("");
  }

  function clearCanvasState() {
    historyRef.current = [];
    resetTransientUi();
    setSelectedSegmentId(null);
    setCanvasState(createEmptyCanvasState());
  }

  function commitCanvas(update) {
    setCanvasState((prev) => {
      const next = update(prev);
      if (next === prev) {
        return prev;
      }
      historyRef.current.push(cloneCanvasState(prev));
      return next;
    });
  }

  function openLabelEditor(targetType, targetId, title, initialText = "", position = "above") {
    setActionSegmentId(null);
    setLabelDraft(initialText);
    setLabelEditor({
      targetType,
      targetId,
      title,
      position,
    });
  }

  useImperativeHandle(ref, () => ({
    clear: clearCanvasState,
  }));

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = window.innerWidth < 420 ? 260 : 300;

    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    setBoardSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => {
      clearLongPressTimer();
      window.removeEventListener("resize", resize);
    };
  }, [resize]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !boardSize.w || !boardSize.h) {
      return;
    }

    redrawCanvas(ctx, boardSize.w, boardSize.h, {
      guides: guideSegments,
      segments,
      braces,
      labels,
      draftSegment,
      selectedSegmentId,
    });
  }, [
    boardSize,
    guideSegments,
    segments,
    braces,
    labels,
    draftSegment,
    selectedSegmentId,
  ]);

  useEffect(() => {
    if (!selectedSegmentId) {
      return;
    }
    if (!segments.some((segment) => segment.id === selectedSegmentId)) {
      setSelectedSegmentId(null);
      setActionSegmentId(null);
    }
  }, [segments, selectedSegmentId]);

  useEffect(() => {
    if (!labelEditor) {
      return;
    }

    const labelTargetExists =
      labelEditor.targetType === "segment"
        ? segments.some((segment) => segment.id === labelEditor.targetId)
        : braces.some((brace) => brace.id === labelEditor.targetId);

    if (!labelTargetExists) {
      setLabelEditor(null);
      setLabelDraft("");
    }
  }, [labelEditor, segments, braces]);

  useEffect(() => {
    if (labelEditor) {
      labelInputRef.current?.focus();
    }
  }, [labelEditor]);

  function handlePointerDown(e) {
    e.preventDefault();
    clearLongPressTimer();
    setActionSegmentId(null);
    setLabelEditor(null);
    setLabelDraft("");

    const canvas = canvasRef.current;
    const pos = getPointerPos(canvas, e);
    const hitSegment = hitTestSegment(segments, pos.x, pos.y);

    canvas.setPointerCapture?.(e.pointerId);

    if (hitSegment) {
      setSelectedSegmentId(hitSegment.id);
      interactionRef.current = {
        mode: "segment-press",
        segmentId: hitSegment.id,
        startX: pos.x,
        startY: pos.y,
        pointerId: e.pointerId,
      };
      longPressTriggeredRef.current = false;
      longPressTimerRef.current = window.setTimeout(() => {
        longPressTriggeredRef.current = true;
        setActionSegmentId(hitSegment.id);
      }, 420);
      return;
    }

    const snappedY = snapYToRow(pos.y, boardSize.h);
    const snappedX = snapX(pos.x, boardSize.w, segments, guideSegments);
    setSelectedSegmentId(null);
    interactionRef.current = {
      mode: "drawing",
      startX: snappedX,
      startY: snappedY,
      pointerId: e.pointerId,
    };
    setDraftSegment({
      id: "draft",
      x1: snappedX,
      x2: snappedX,
      y: snappedY,
      color: activeColor,
    });
  }

  function handlePointerMove(e) {
    const interaction = interactionRef.current;
    if (!interaction) {
      return;
    }

    const pos = getPointerPos(canvasRef.current, e);

    if (interaction.mode === "segment-press") {
      const movedX = Math.abs(pos.x - interaction.startX);
      const movedY = Math.abs(pos.y - interaction.startY);
      if (movedX > 8 || movedY > 8) {
        clearLongPressTimer();
      }
      return;
    }

    const snappedX = snapX(pos.x, boardSize.w, segments, guideSegments);
    setDraftSegment({
      id: "draft",
      ...normalizeSegment(interaction.startX, snappedX, interaction.startY, activeColor),
      color: activeColor,
    });
  }

  function handlePointerUp(e) {
    const interaction = interactionRef.current;
    clearLongPressTimer();
    interactionRef.current = null;

    if (!interaction) {
      return;
    }

    canvasRef.current?.releasePointerCapture?.(e.pointerId);

    if (interaction.mode === "segment-press") {
      if (!longPressTriggeredRef.current) {
        setActionSegmentId(null);
      }
      longPressTriggeredRef.current = false;
      return;
    }

    const pos = getPointerPos(canvasRef.current, e);
    const snappedX = snapX(pos.x, boardSize.w, segments, guideSegments);
    const nextSegment = {
      id: nextId("segment"),
      ...normalizeSegment(interaction.startX, snappedX, interaction.startY, activeColor),
      color: activeColor,
    };

    setDraftSegment(null);

    if (nextSegment.x2 - nextSegment.x1 < SEGMENT_MIN_LENGTH) {
      return;
    }

    commitCanvas((prev) => ({
      ...prev,
      segments: [...prev.segments, nextSegment],
    }));
    setSelectedSegmentId(nextSegment.id);
  }

  function handlePointerCancel(e) {
    clearLongPressTimer();
    interactionRef.current = null;
    longPressTriggeredRef.current = false;
    setDraftSegment(null);
    canvasRef.current?.releasePointerCapture?.(e.pointerId);
  }

  function handleUndo() {
    clearLongPressTimer();
    const previous = historyRef.current.pop();
    if (!previous) {
      return;
    }
    setActionSegmentId(null);
    setLabelEditor(null);
    setLabelDraft("");
    setSelectedSegmentId(null);
    setDraftSegment(null);
    setCanvasState(previous);
  }

  function handleClear() {
    setCanvasState((prev) => {
      if (
        prev.segments.length === 0 &&
        prev.braces.length === 0 &&
        prev.labels.length === 0
      ) {
        return prev;
      }
      historyRef.current.push(cloneCanvasState(prev));
      return createEmptyCanvasState();
    });
    setSelectedSegmentId(null);
    resetTransientUi();
  }

  function createBrace(span, position, suggestedText = "") {
    if (!actionSegment) {
      return;
    }

    const braceId = nextId("brace");
    commitCanvas((prev) => ({
      ...prev,
      braces: [
        ...prev.braces,
        {
          id: braceId,
          targetIds: span.targetIds,
          x1: span.x1,
          x2: span.x2,
          anchorY: span.anchorY,
          position,
          color: actionSegment.color,
        },
      ],
    }));
    openLabelEditor("brace", braceId, "Eticheta acoladei", suggestedText, position);
  }

  function handleSegmentLabel() {
    if (!actionSegment) {
      return;
    }

    openLabelEditor(
      "segment",
      actionSegment.id,
      "Eticheta segmentului",
      getLabelValue(labels, "segment", actionSegment.id),
      "above",
    );
  }

  function handleDuplicate() {
    if (!actionSegment) {
      return;
    }

    const length = actionSegment.x2 - actionSegment.x1;
    let x1 = actionSegment.x2;
    let x2 = x1 + length;
    let y = actionSegment.y;

    if (x2 > boardSize.w - GRID_STEP) {
      x1 = actionSegment.x1;
      x2 = x1 + length;
      y = snapYToRow(actionSegment.y + GRID_STEP * 3, boardSize.h);
    }

    const duplicated = {
      id: nextId("segment"),
      ...normalizeSegment(
        snapX(x1, boardSize.w, segments, guideSegments),
        snapX(x2, boardSize.w, segments, guideSegments),
        y,
        actionSegment.color,
      ),
      color: actionSegment.color,
    };

    commitCanvas((prev) => ({
      ...prev,
      segments: [...prev.segments, duplicated],
    }));
    setActionSegmentId(null);
    setSelectedSegmentId(duplicated.id);
  }

  function handleSplit() {
    if (!actionSegment) {
      return;
    }

    const midpoint = Math.round(
      ((actionSegment.x1 + actionSegment.x2) / 2) / HALF_GRID_STEP,
    ) * HALF_GRID_STEP;

    if (
      midpoint - actionSegment.x1 < SEGMENT_MIN_LENGTH / 2 ||
      actionSegment.x2 - midpoint < SEGMENT_MIN_LENGTH / 2
    ) {
      return;
    }

    const firstHalf = {
      id: nextId("segment"),
      x1: actionSegment.x1,
      x2: midpoint,
      y: actionSegment.y,
      color: actionSegment.color,
    };
    const secondHalf = {
      id: nextId("segment"),
      x1: midpoint,
      x2: actionSegment.x2,
      y: actionSegment.y,
      color: actionSegment.color,
    };

    commitCanvas((prev) => {
      const cleaned = removeSegmentsAndArtifacts(prev, [actionSegment.id]);
      return {
        ...cleaned,
        segments: [...cleaned.segments, firstHalf, secondHalf],
      };
    });
    setActionSegmentId(null);
    setSelectedSegmentId(firstHalf.id);
  }

  function handleDelete() {
    if (!actionSegment) {
      return;
    }

    commitCanvas((prev) => removeSegmentsAndArtifacts(prev, [actionSegment.id]));
    setActionSegmentId(null);
    setSelectedSegmentId(null);
  }

  function handleSaveLabel() {
    if (!labelEditor) {
      return;
    }

    commitCanvas((prev) =>
      upsertLabel(prev, {
        id: `${labelEditor.targetType}-${labelEditor.targetId}`,
        targetType: labelEditor.targetType,
        targetId: labelEditor.targetId,
        text: labelDraft.trim(),
        position: labelEditor.position,
      }),
    );
    setLabelEditor(null);
    setLabelDraft("");
  }

  const labelSuggestions = Array.from(
    new Set(
      [
        ...(problem?.segments?.map((segment) => segment.label) || []),
        "? cm",
        "Total",
        "Diferența",
        "AB",
      ].filter(Boolean),
    ),
  );

  const colorKeys = ["blue", "coral", "green", "teal", "purple"];

  return (
    <div className="space-y-3">
      <section className="studio-panel overflow-hidden px-3 py-3">
        <div className="flex items-start justify-between gap-3 px-1 pb-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              Tabla de lucru
            </p>
            <h3 className="mt-1 text-lg font-black text-[var(--color-board-ink)]">
              Desenează segmentele pe liniile caietului
            </h3>
          </div>
          <span className="status-chip bg-kid-amber-light text-kid-amber-dark">
            Ține apăsat pe segment
          </span>
        </div>

        <div className="rounded-[20px] bg-kid-blue-light px-3 py-3 text-sm font-semibold leading-6 text-kid-blue-dark">
          {guideMessage}
        </div>

        <div className="mt-3 workspace-board">
          <div className="workspace-grid">
            <canvas
              ref={canvasRef}
              className="relative z-[1] block w-full rounded-[22px]"
              style={{ touchAction: "none" }}
              onContextMenu={(e) => e.preventDefault()}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            />
          </div>
        </div>
      </section>

      {actionSegment && (
        <section className="studio-panel px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                Acțiuni pentru segment
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Alege o etichetă, o acoladă sau o transformare utilă pentru rezolvare.
              </p>
            </div>
            <button
              onClick={() => setActionSegmentId(null)}
              className="utility-pill studio-button text-xs"
            >
              Închide
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={handleSegmentLabel}
              className="action-secondary studio-button border border-[var(--color-board-line)] bg-white/90 text-[var(--color-board-ink)]"
            >
              Etichetă
            </button>
            <button
              onClick={() => createBrace({
                targetIds: [actionSegment.id],
                x1: actionSegment.x1,
                x2: actionSegment.x2,
                anchorY: actionSegment.y,
              }, "above", "? cm")}
              className="action-secondary studio-button border border-[var(--color-board-line)] bg-white/90 text-[var(--color-board-ink)]"
            >
              Acoladă sus
            </button>
            <button
              onClick={() => createBrace({
                targetIds: [actionSegment.id],
                x1: actionSegment.x1,
                x2: actionSegment.x2,
                anchorY: actionSegment.y,
              }, "below", "? cm")}
              className="action-secondary studio-button border border-[var(--color-board-line)] bg-white/90 text-[var(--color-board-ink)]"
            >
              Acoladă jos
            </button>
            <button
              onClick={handleDuplicate}
              className="action-secondary studio-button border border-[var(--color-board-line)] bg-white/90 text-[var(--color-board-ink)]"
            >
              Dublează
            </button>
            <button
              onClick={handleSplit}
              className="action-secondary studio-button border border-[var(--color-board-line)] bg-white/90 text-[var(--color-board-ink)]"
            >
              Împarte în 2
            </button>
            <button
              onClick={handleDelete}
              className="action-secondary studio-button border border-kid-coral bg-kid-coral-light text-kid-coral-dark"
            >
              Șterge
            </button>
            {connectedSpan && (
              <button
                onClick={() => createBrace(connectedSpan, "above", "? cm")}
                className="action-secondary studio-button col-span-2 border border-kid-purple bg-kid-purple-light text-kid-purple-dark"
              >
                Acoladă peste tot
              </button>
            )}
            {differenceSpan && (
              <button
                onClick={() => createBrace(differenceSpan, "above", "? cm")}
                className="action-secondary studio-button col-span-2 border border-kid-teal bg-kid-teal-light text-kid-teal-dark"
              >
                Arată diferența
              </button>
            )}
          </div>
        </section>
      )}

      {labelEditor && (
        <section className="studio-panel px-4 py-4">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            {labelEditor.title}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <input
              ref={labelInputRef}
              type="text"
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveLabel();
                }
              }}
              placeholder="Scrie eticheta"
              className="h-12 flex-1 rounded-[20px] border border-[var(--color-board-line)] bg-white px-4 text-sm font-semibold text-[var(--color-board-ink)] outline-none focus:border-[var(--color-board-ink)]"
            />
            <button
              onClick={handleSaveLabel}
              className="action-primary studio-button rounded-[20px] bg-[var(--color-board-ink)] px-5 text-white"
            >
              Salvează
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {labelSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setLabelDraft(suggestion)}
                className="utility-pill studio-button text-xs"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="studio-panel px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Instrumente
          </p>
          <p className="text-xs font-semibold text-slate-500">
            Segmente drepte, snap pe linii și culori distincte
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="tool-pill text-sm" data-active="true">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[var(--color-board-ink)]">
              {TOOLS.segment.icon}
            </span>
            <span>{TOOLS.segment.label}</span>
          </span>
          {colorKeys.map((colorKey) => (
            <button
              key={colorKey}
              onClick={() => setActiveColor(colorKey)}
              data-active={activeColor === colorKey}
              className="color-pill studio-button text-sm"
              style={{
                color: COLORS[colorKey].stroke,
                backgroundColor:
                  activeColor === colorKey
                    ? COLORS[colorKey].fill
                    : "rgba(255,255,255,0.78)",
              }}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[colorKey].stroke }}
              />
              <span>{COLORS[colorKey].label}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--color-board-line)] pt-3">
          <button onClick={handleUndo} className="utility-pill studio-button text-sm">
            Anulează
          </button>
          <button onClick={handleClear} className="utility-pill studio-button text-sm">
            Șterge tot
          </button>
        </div>
      </section>
    </div>
  );
});

export default DrawingCanvas;
