export function buildVennGeometry({ sampleSpace, circles }) {
  const intersectionPath = buildIntersectionPath(circles.a, circles.b);
  const unionPath = buildUnionPath(circles.a, circles.b);

  return {
    sampleSpace: rectPath(sampleSpace),
    circleA: circlePath(circles.a),
    circleB: circlePath(circles.b),
    overlap: intersectionPath,
    outside: `${rectPath(sampleSpace)} ${unionPath}`,
  };
}

export function buildFrame({ timeMs, spec }) {
  const localTimeMs = normalizeTime(timeMs, spec.animation.durationMs, spec.animation.loop);
  const eventTimeMs = localTimeMs - spec.animation.initialHoldMs;

  if (eventTimeMs < 0) {
    return emptyFrame(localTimeMs, spec.animation.durationMs);
  }

  const eventIndex = Math.min(
    spec.sequence.length - 1,
    Math.floor(eventTimeMs / spec.animation.eventDurationMs),
  );
  const eventKey = spec.sequence[eventIndex];
  const eventSpec = spec.regions[eventKey];
  const phaseTimeMs = eventTimeMs - eventIndex * spec.animation.eventDurationMs;
  const zoomInEndMs = spec.animation.zoomInMs;
  const typeEndMs = zoomInEndMs + spec.animation.typeMs;
  const fadeStartMs = typeEndMs;
  const fadeProgress = progressBetween(phaseTimeMs, fadeStartMs, spec.animation.fadeOutMs);
  const zoomInProgress = progressBetween(phaseTimeMs, 0, spec.animation.zoomInMs);
  const typeProgress = progressBetween(phaseTimeMs, zoomInEndMs, spec.animation.typeMs);
  const scaleProgress = phaseTimeMs < fadeStartMs
    ? easeOutCubic(zoomInProgress)
    : 1 - easeInOutCubic(fadeProgress);
  const scale = 1 + (spec.animation.maxScale - 1) * scaleProgress;
  const typedText = typeText(eventSpec.label, typeProgress);
  const badgeOpacity = phaseTimeMs < zoomInEndMs
    ? 0
    : Math.max(0, 1 - easeInOutCubic(fadeProgress));
  const activeOpacity = Math.max(0, easeOutCubic(zoomInProgress) - easeInOutCubic(fadeProgress));

  return {
    timeMs: localTimeMs,
    progress: localTimeMs / spec.animation.durationMs,
    activeKey: eventKey,
    activeTarget: eventSpec.target,
    activeOpacity,
    badgeText: typedText,
    badgeOpacity,
    transforms: buildTransforms({
      target: eventSpec.target,
      circles: spec.circles,
      sampleSpace: spec.sampleSpace,
      scale,
    }),
  };
}

export function normalizeTime(timeMs, durationMs, loop = true) {
  if (durationMs <= 0) return 0;
  if (!loop) return clamp(timeMs, 0, durationMs);
  return ((timeMs % durationMs) + durationMs) % durationMs;
}

function emptyFrame(timeMs, durationMs) {
  return {
    timeMs,
    progress: durationMs <= 0 ? 0 : timeMs / durationMs,
    activeKey: null,
    activeTarget: null,
    activeOpacity: 0,
    badgeText: "",
    badgeOpacity: 0,
    transforms: {
      circleA: "",
      circleB: "",
      overlap: "",
      outside: "",
    },
  };
}

function buildTransforms({ target, circles, sampleSpace, scale }) {
  return {
    circleA: target === "circleA" ? scaleAround(circles.a.cx, circles.a.cy, scale) : "",
    circleB: target === "circleB" ? scaleAround(circles.b.cx, circles.b.cy, scale) : "",
    overlap: target === "overlap"
      ? scaleAround((circles.a.cx + circles.b.cx) / 2, circles.a.cy, scale)
      : "",
    outside: target === "outside"
      ? scaleAround(sampleSpace.x + sampleSpace.width / 2, sampleSpace.y + sampleSpace.height / 2, scale)
      : "",
  };
}

function scaleAround(x, y, scale) {
  return `translate(${fmt(x)} ${fmt(y)}) scale(${fmt(scale)}) translate(${-fmt(x)} ${-fmt(y)})`;
}

function typeText(text, progress) {
  const visibleCount = Math.round(clamp(progress, 0, 1) * text.length);
  return text.slice(0, visibleCount);
}

function progressBetween(timeMs, startMs, durationMs) {
  if (durationMs <= 0) return 1;
  return clamp((timeMs - startMs) / durationMs, 0, 1);
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

function easeOutCubic(value) {
  const t = clamp(value, 0, 1);
  return 1 - (1 - t) ** 3;
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
