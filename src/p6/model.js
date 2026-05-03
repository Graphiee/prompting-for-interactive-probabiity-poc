export function buildRegionGeometry({ universe, sets }) {
  const intersectionPath = buildIntersectionPath(sets.a, sets.b);
  const unionPath = buildUnionPath(sets.a, sets.b);

  return {
    outside: `${rectPath(universe)} ${unionPath}`,
    aOnly: `${circlePath(sets.a)} ${intersectionPath}`,
    bOnly: `${circlePath(sets.b)} ${intersectionPath}`,
    overlap: intersectionPath,
    circleA: circlePath(sets.a),
    circleB: circlePath(sets.b),
  };
}

export function buildFrame({ mode, step, regions, hoverRegion = null }) {
  const selectedStep = getStep(mode.steps, step);
  const highlightedRegions = hoverRegion ? [hoverRegion] : selectedStep.highlightedRegions;
  const highlighted = new Set(highlightedRegions);

  return {
    step: selectedStep.step,
    formula: selectedStep.formula,
    formulaText: selectedStep.formulaText,
    labelsVisible: selectedStep.labelsVisible,
    regionTargets: Object.fromEntries(
      regions.map((region) => [region.key, highlighted.has(region.key) ? 1 : 0]),
    ),
  };
}

export function interpolateRegionStates({ from = {}, to = {}, regions, progress }) {
  const t = easeInOutCubic(clamp(progress, 0, 1));
  return Object.fromEntries(
    regions.map((region) => {
      const start = from[region.key] ?? 0;
      const end = to[region.key] ?? 0;
      return [region.key, start + (end - start) * t];
    }),
  );
}

export function clampStep(step, min, max) {
  return Math.min(max, Math.max(min, Math.round(Number(step) || 0)));
}

export function transitionProgress({ elapsedMs, durationMs }) {
  if (durationMs <= 0) return 1;
  return clamp(elapsedMs / durationMs, 0, 1);
}

function getStep(steps, step) {
  return steps.find((entry) => entry.step === step) ?? steps[0];
}

function buildIntersectionPath(a, b) {
  const { top, bottom } = circleIntersectionPoints(a, b);

  return [
    `M ${fmt(top.x)} ${fmt(top.y)}`,
    `A ${a.r} ${a.r} 0 0 1 ${fmt(bottom.x)} ${fmt(bottom.y)}`,
    `A ${b.r} ${b.r} 0 0 1 ${fmt(top.x)} ${fmt(top.y)}`,
    "Z",
  ].join(" ");
}

function buildUnionPath(a, b) {
  const { top, bottom } = circleIntersectionPoints(a, b);

  return [
    `M ${fmt(top.x)} ${fmt(top.y)}`,
    `A ${a.r} ${a.r} 0 1 0 ${fmt(bottom.x)} ${fmt(bottom.y)}`,
    `A ${b.r} ${b.r} 0 1 0 ${fmt(top.x)} ${fmt(top.y)}`,
    "Z",
  ].join(" ");
}

function circleIntersectionPoints(a, b) {
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  const distance = Math.hypot(dx, dy);
  const halfDistance = distance / 2;
  const height = Math.sqrt(Math.max(0, a.r ** 2 - halfDistance ** 2));
  const mx = (a.cx + b.cx) / 2;
  const my = (a.cy + b.cy) / 2;
  const ux = dx / distance;
  const uy = dy / distance;
  const px = -uy;
  const py = ux;

  return {
    top: {
      x: mx - px * height,
      y: my - py * height,
    },
    bottom: {
      x: mx + px * height,
      y: my + py * height,
    },
  };
}

function circlePath({ cx, cy, r }) {
  return [
    `M ${fmt(cx - r)} ${fmt(cy)}`,
    `A ${r} ${r} 0 1 0 ${fmt(cx + r)} ${fmt(cy)}`,
    `A ${r} ${r} 0 1 0 ${fmt(cx - r)} ${fmt(cy)}`,
    "Z",
  ].join(" ");
}

function rectPath({ x, y, width, height }) {
  return [
    `M ${fmt(x)} ${fmt(y)}`,
    `H ${fmt(x + width)}`,
    `V ${fmt(y + height)}`,
    `H ${fmt(x)}`,
    "Z",
  ].join(" ");
}

function easeInOutCubic(value) {
  const t = clamp(value, 0, 1);
  return t < 0.5 ? 4 * t ** 3 : 1 - ((-2 * t + 2) ** 3) / 2;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function fmt(value) {
  return Number(value.toFixed(3));
}
