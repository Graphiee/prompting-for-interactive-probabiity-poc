export function buildVennGeometry({ universe, circles }) {
  const intersectionPath = buildIntersectionPath(circles.a, circles.b);
  const unionPath = buildUnionPath(circles.a, circles.b);
  return {
    outside: `${rectPath(universe)} ${unionPath}`,
    aOnly: `${circlePath(circles.a)} ${intersectionPath}`,
    bOnly: `${circlePath(circles.b)} ${intersectionPath}`,
    intersection: intersectionPath,
    circleA: circlePath(circles.a),
    circleB: circlePath(circles.b),
  };
}

export function buildFrame({ timeMs, mode, regions, durationMs, loop = true }) {
  const localTimeMs = normalizeTime(timeMs, durationMs, loop);
  const segment = findSegment(mode.segments, localTimeMs);
  const progress = segmentProgress(segment, localTimeMs);
  const easedProgress = easeInOutCubic(progress);
  const emphases = interpolateRegions(segment.from, segment.to, regions, easedProgress);
  const circleProgress = easeOutBack(clamp(localTimeMs / 1000, 0, 1));
  const finalProgress = segment.final ? progress : 0;
  const pulse = finalProgress > 0 ? 0.5 + Math.sin(finalProgress * Math.PI * 4) * 0.5 : 0;

  return {
    timeMs: localTimeMs,
    progress: localTimeMs / durationMs,
    segment,
    segmentProgress: progress,
    label: segment.label,
    emphases,
    circleProgress,
    pulse,
    complementWipe: segment.complement ? easedProgress : 0,
    final: Boolean(segment.final),
  };
}

export function mergeHoverEmphases(baseEmphases, hoverKey, mode, regions) {
  if (!hoverKey) return baseEmphases;
  const hoverRegions = mode.hoverRegions[hoverKey] ?? {};
  return Object.fromEntries(
    regions.map((region) => [
      region,
      Math.max(baseEmphases[region] ?? 0, hoverRegions[region] ?? 0),
    ]),
  );
}

export function normalizeTime(timeMs, durationMs, loop) {
  if (durationMs <= 0) return 0;
  if (!loop) return clamp(timeMs, 0, durationMs);
  return ((timeMs % durationMs) + durationMs) % durationMs;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function interpolateRegions(from = {}, to = {}, regions, t) {
  return Object.fromEntries(
    regions.map((region) => {
      const start = from[region] ?? 0;
      const end = to[region] ?? 0;
      return [region, start + (end - start) * t];
    }),
  );
}

function findSegment(segments, timeMs) {
  return segments.find((segment) => (
    timeMs >= segment.startMs && timeMs < segment.endMs
  )) ?? segments[segments.length - 1];
}

function segmentProgress(segment, timeMs) {
  return clamp(
    (timeMs - segment.startMs) / (segment.endMs - segment.startMs),
    0,
    1,
  );
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

function fmt(value) {
  return Number(value.toFixed(3));
}

function easeInOutCubic(value) {
  const t = clamp(value, 0, 1);
  return t < 0.5 ? 4 * t ** 3 : 1 - ((-2 * t + 2) ** 3) / 2;
}

function easeOutBack(value) {
  const t = clamp(value, 0, 1);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}
