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
  brace: { id: "brace", label: "Acoladă", icon: "}" },
  label: { id: "label", label: "Etichetă", icon: "A" },
  eraser: { id: "eraser", label: "Radieră", icon: "✕" },
};

export function getPointerPos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches ? e.touches[0] : e;
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

export function drawGrid(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.05)";
  ctx.lineWidth = 0.5;
  const step = 20;
  for (let x = 0; x <= width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSegment(ctx, x1, y1, x2, y2, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // endpoints
  [
    [x1, y1],
    [x2, y2],
  ].forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

export function drawBrace(ctx, x1, y1, x2, y2, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  const topY = Math.min(y1, y2) - 14;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1, topY);
  ctx.lineTo(x2, topY);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // arrow tip
  const mx = (x1 + x2) / 2;
  ctx.beginPath();
  ctx.moveTo(mx, topY);
  ctx.lineTo(mx, topY - 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mx - 5, topY - 15);
  ctx.lineTo(mx, topY - 10);
  ctx.lineTo(mx + 5, topY - 15);
  ctx.stroke();
  ctx.restore();
}

export function drawLabel(ctx, x, y, text, color) {
  ctx.save();
  ctx.font = '700 14px "Nunito", sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(text, x, y - 6);
  ctx.restore();
}

export function drawStroke(ctx, stroke) {
  const { tool, x1, y1, x2, y2, color, text } = stroke;
  if (tool === "segment") {
    drawSegment(ctx, x1, y1, x2, y2, color);
  } else if (tool === "brace") {
    drawBrace(ctx, x1, y1, x2, y2, color);
  } else if (tool === "label" && text) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    drawLabel(ctx, mx, my, text, color);
  }
}

export function redrawCanvas(ctx, width, height, strokes) {
  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height);
  strokes.forEach((s) => drawStroke(ctx, s));
}
