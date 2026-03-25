export const COLORS = {
  blue: { stroke: "#378ADD", fill: "#E6F1FB", label: "Albastru" },
  coral: { stroke: "#D85A30", fill: "#FAECE7", label: "Roșu" },
  green: { stroke: "#639922", fill: "#EAF3DE", label: "Verde" },
  purple: { stroke: "#7F77DD", fill: "#EEEDFE", label: "Mov" },
  amber: { stroke: "#EF9F27", fill: "#FAEEDA", label: "Portocaliu" },
  teal: { stroke: "#1D9E75", fill: "#E1F5EE", label: "Turcoaz" },
};

export const TOOLS = {
  segment: { id: "segment", label: "Segment", icon: "—" },
};

export const GRID_STEP = 24;
export const HALF_GRID_STEP = GRID_STEP / 2;
export const SEGMENT_MIN_LENGTH = GRID_STEP;
export const SNAP_THRESHOLD = 16;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundToStep(value, step) {
  return Math.round(value / step) * step;
}

function findSegmentById(segments, id) {
  return segments.find((segment) => segment.id === id) || null;
}

export function getPointerPos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

export function drawGrid(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = "rgba(184, 146, 74, 0.12)";
  ctx.lineWidth = 0.75;
  for (let x = 0; x <= width; x += GRID_STEP) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += GRID_STEP) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function snapYToRow(y, height) {
  return clamp(roundToStep(y, GRID_STEP), GRID_STEP * 2, height - GRID_STEP * 2);
}

export function getGuideSegments(problem, width) {
  if (!problem?.segments?.length || width <= GRID_STEP * 4) {
    return [];
  }

  const margin = GRID_STEP * 2;
  const rowGap = GRID_STEP * 3;
  const topRow = GRID_STEP * 3;
  const [first, second] = problem.segments;
  const maxLength = Math.max(...problem.segments.map((segment) => segment.length), 1);
  const totalLength = problem.segments.reduce((sum, segment) => sum + segment.length, 0);
  const availableWidth = width - margin * 2;

  const toPixels = (length, scaleBase) =>
    Math.max(SEGMENT_MIN_LENGTH, roundToStep(length * scaleBase, HALF_GRID_STEP));

  if (problem.category === "suma") {
    const scale = availableWidth / Math.max(totalLength, 1);
    const firstLength = toPixels(first.length, scale);
    const secondLength = toPixels(second.length, scale);
    const x1 = margin;
    const x2 = x1 + firstLength;
    return [
      { id: "guide-1", x1, x2, y: topRow, color: first.color },
      { id: "guide-2", x1: x2, x2: x2 + secondLength, y: topRow, color: second.color },
    ];
  }

  if (problem.category === "diferenta") {
    const scale = availableWidth / maxLength;
    const x1 = margin;
    return [
      { id: "guide-1", x1, x2: x1 + toPixels(first.length, scale), y: topRow, color: first.color },
      { id: "guide-2", x1, x2: x1 + toPixels(second.length, scale), y: topRow + rowGap, color: second.color },
    ];
  }

  const scale = availableWidth / maxLength;
  const x1 = margin;
  return [
    { id: "guide-1", x1, x2: x1 + toPixels(first.length, scale), y: topRow, color: first.color },
    { id: "guide-2", x1, x2: x1 + toPixels(second.length, scale), y: topRow + rowGap, color: second.color },
  ];
}

export function getGuideMessage(problem) {
  if (!problem) {
    return "Desenează segmente drepte pe liniile caietului.";
  }

  if (problem.category === "suma") {
    return "Pentru sumă, așază segmentele cap la cap pe aceeași linie.";
  }

  if (problem.category === "diferenta") {
    return "Pentru diferență, pornește segmentele din același punct pe două linii apropiate.";
  }

  return "Pentru dublu sau jumătate, copiază segmentul sau împarte-l în două părți egale.";
}

function getXTargets(segments, guides) {
  const targets = segments.flatMap((segment) => [segment.x1, segment.x2]);
  guides.forEach((guide) => {
    targets.push(guide.x1, guide.x2);
  });
  return targets;
}

function snapToTargets(value, targets, threshold = SNAP_THRESHOLD) {
  let snapped = value;
  let minDistance = threshold;

  targets.forEach((target) => {
    const distance = Math.abs(target - value);
    if (distance <= minDistance) {
      minDistance = distance;
      snapped = target;
    }
  });

  return snapped;
}

export function snapX(value, width, segments = [], guides = []) {
  const clamped = clamp(roundToStep(value, HALF_GRID_STEP), GRID_STEP, width - GRID_STEP);
  return snapToTargets(clamped, getXTargets(segments, guides));
}

export function normalizeSegment(startX, endX, y, color) {
  const x1 = Math.min(startX, endX);
  const x2 = Math.max(startX, endX);
  return { x1, x2, y, color };
}

function drawGuideSegment(ctx, guide) {
  const palette = COLORS[guide.color] || COLORS.amber;
  ctx.save();
  ctx.strokeStyle = palette.stroke;
  ctx.fillStyle = palette.stroke;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.18;
  ctx.setLineDash([8, 6]);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(guide.x1, guide.y);
  ctx.lineTo(guide.x2, guide.y);
  ctx.stroke();
  ctx.setLineDash([]);
  [guide.x1, guide.x2].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, guide.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

export function drawSegment(ctx, segment, options = {}) {
  const { selected = false, ghost = false } = options;
  const palette = COLORS[segment.color] || COLORS.blue;

  ctx.save();
  if (selected) {
    ctx.strokeStyle = "rgba(36, 56, 75, 0.16)";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(segment.x1, segment.y);
    ctx.lineTo(segment.x2, segment.y);
    ctx.stroke();
  }

  ctx.strokeStyle = palette.stroke;
  ctx.fillStyle = palette.stroke;
  ctx.lineWidth = selected ? 4 : 3;
  ctx.lineCap = "round";
  ctx.globalAlpha = ghost ? 0.45 : 1;
  ctx.beginPath();
  ctx.moveTo(segment.x1, segment.y);
  ctx.lineTo(segment.x2, segment.y);
  ctx.stroke();

  [segment.x1, segment.x2].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, segment.y, selected ? 5 : 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function getBraceLineY(brace) {
  const offset = 18;
  return brace.position === "below"
    ? brace.anchorY + offset
    : brace.anchorY - offset;
}

export function drawBrace(ctx, brace) {
  const palette = COLORS[brace.color] || COLORS.teal;
  const lineY = getBraceLineY(brace);
  const stemDirection = brace.position === "below" ? 1 : -1;
  const span = Math.max(brace.x2 - brace.x1, GRID_STEP);
  const midX = (brace.x1 + brace.x2) / 2;
  const shoulder = Math.min(Math.max(span * 0.18, 8), 18);
  const notchWidth = Math.min(Math.max(span * 0.12, 6), 12);
  const notchDepth = 10;

  ctx.save();
  ctx.strokeStyle = palette.stroke;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(brace.x1, brace.anchorY);
  ctx.quadraticCurveTo(brace.x1, lineY, brace.x1 + shoulder, lineY);
  ctx.lineTo(midX - shoulder, lineY);
  ctx.quadraticCurveTo(
    midX - notchWidth,
    lineY,
    midX,
    lineY + stemDirection * notchDepth,
  );
  ctx.quadraticCurveTo(
    midX + notchWidth,
    lineY,
    midX + shoulder,
    lineY,
  );
  ctx.lineTo(brace.x2 - shoulder, lineY);
  ctx.quadraticCurveTo(brace.x2, lineY, brace.x2, brace.anchorY);
  ctx.stroke();
  ctx.restore();
}

function getLabelAnchor(targetType, targetId, segments, braces, position) {
  if (targetType === "segment") {
    const segment = findSegmentById(segments, targetId);
    if (!segment) {
      return null;
    }
    return {
      x: (segment.x1 + segment.x2) / 2,
      y: position === "below" ? segment.y + 22 : segment.y - 10,
    };
  }

  const brace = braces.find((item) => item.id === targetId);
  if (!brace) {
    return null;
  }

  const lineY = getBraceLineY(brace);
  return {
    x: (brace.x1 + brace.x2) / 2,
    y: brace.position === "below" ? lineY + 24 : lineY - 12,
  };
}

export function drawLabel(ctx, label, segments, braces) {
  const anchor = getLabelAnchor(
    label.targetType,
    label.targetId,
    segments,
    braces,
    label.position,
  );

  if (!anchor) {
    return;
  }

  ctx.save();
  ctx.font = '700 14px "Nunito", sans-serif';
  ctx.fillStyle = "#24384B";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label.text, anchor.x, anchor.y);
  ctx.restore();
}

export function hitTestSegment(segments, x, y) {
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const segment = segments[index];
    const isWithinX = x >= segment.x1 - SNAP_THRESHOLD && x <= segment.x2 + SNAP_THRESHOLD;
    const isWithinY = Math.abs(y - segment.y) <= SNAP_THRESHOLD;
    if (isWithinX && isWithinY) {
      return segment;
    }
  }

  return null;
}

export function getConnectedSpan(segments, segmentId) {
  const selected = findSegmentById(segments, segmentId);
  if (!selected) {
    return null;
  }

  const sameRow = segments
    .filter((segment) => Math.abs(segment.y - selected.y) <= HALF_GRID_STEP)
    .sort((left, right) => left.x1 - right.x1);

  const cluster = [selected];
  let minX = selected.x1;
  let maxX = selected.x2;
  let changed = true;

  while (changed) {
    changed = false;
    sameRow.forEach((segment) => {
      if (cluster.some((item) => item.id === segment.id)) {
        return;
      }
      const touchesCluster =
        segment.x1 <= maxX + SNAP_THRESHOLD && segment.x2 >= minX - SNAP_THRESHOLD;
      if (touchesCluster) {
        cluster.push(segment);
        minX = Math.min(minX, segment.x1);
        maxX = Math.max(maxX, segment.x2);
        changed = true;
      }
    });
  }

  if (cluster.length < 2 || maxX - minX < selected.x2 - selected.x1 + SNAP_THRESHOLD) {
    return null;
  }

  return {
    targetIds: cluster.map((segment) => segment.id),
    x1: minX,
    x2: maxX,
    anchorY: selected.y,
  };
}

export function getDifferenceSpan(segments, segmentId) {
  const selected = findSegmentById(segments, segmentId);
  if (!selected) {
    return null;
  }

  const candidate = segments
    .filter((segment) => segment.id !== segmentId)
    .filter((segment) => Math.abs(segment.x1 - selected.x1) <= SNAP_THRESHOLD)
    .filter((segment) => Math.abs(segment.y - selected.y) >= GRID_STEP)
    .sort((left, right) => Math.abs(left.y - selected.y) - Math.abs(right.y - selected.y))[0];

  if (!candidate) {
    return null;
  }

  const longer = selected.x2 - selected.x1 >= candidate.x2 - candidate.x1
    ? selected
    : candidate;
  const shorter = longer.id === selected.id ? candidate : selected;

  if (longer.x2 - shorter.x2 < SEGMENT_MIN_LENGTH / 2) {
    return null;
  }

  return {
    targetIds: [longer.id, shorter.id],
    x1: shorter.x2,
    x2: longer.x2,
    anchorY: longer.y,
  };
}

export function redrawCanvas(ctx, width, height, options) {
  const {
    guides = [],
    segments = [],
    braces = [],
    labels = [],
    draftSegment = null,
    selectedSegmentId = null,
  } = options;

  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height);
  guides.forEach((guide) => drawGuideSegment(ctx, guide));
  segments.forEach((segment) => {
    drawSegment(ctx, segment, { selected: segment.id === selectedSegmentId });
  });
  if (draftSegment) {
    drawSegment(ctx, draftSegment, { ghost: true });
  }
  braces.forEach((brace) => drawBrace(ctx, brace));
  labels.forEach((label) => drawLabel(ctx, label, segments, braces));
}
