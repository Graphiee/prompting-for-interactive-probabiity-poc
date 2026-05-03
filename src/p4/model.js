export function buildTimeline({ steps, stepDurationMs }) {
  const durationMs = steps.length * stepDurationMs;
  return {
    durationMs,
    stepStartTimes: steps.map((_, index) => index * stepDurationMs),
  };
}

export function buildFrame({
  timeMs,
  steps,
  stepDurationMs,
  transitionMs,
  textDelayMs,
  textRevealMs,
  maxCharsPerLine,
  loop = true,
}) {
  const timeline = buildTimeline({ steps, stepDurationMs });
  const localTimeMs = normalizeTime(timeMs, timeline.durationMs, loop);
  const stepIndex = Math.min(
    steps.length - 1,
    Math.floor(localTimeMs / stepDurationMs),
  );
  const step = steps[stepIndex];
  const stepTimeMs = localTimeMs - stepIndex * stepDurationMs;
  const stepProgress = clamp(stepTimeMs / stepDurationMs, 0, 1);
  const transitionProgress = easeOutCubic(clamp(stepTimeMs / transitionMs, 0, 1));
  const textProgress = clamp((stepTimeMs - textDelayMs) / textRevealMs, 0, 1);
  const easedTextProgress = easeOutCubic(textProgress);
  const visibleCharCount = Math.round(step.text.length * easedTextProgress);

  return {
    timeMs: localTimeMs,
    stepIndex,
    step,
    stepProgress,
    transitionProgress,
    textProgress,
    textScale: buildTextScale(textProgress),
    visibleText: step.text.slice(0, visibleCharCount),
    textLines: wrapText(step.text.slice(0, visibleCharCount), maxCharsPerLine),
    regionStates: buildRegionStates(step.activeRegion, transitionProgress),
  };
}

export function buildRegionStates(activeRegion, activeEmphasis = 1) {
  return {
    sampleSpace: {
      active: activeRegion === "complement",
      muted: activeRegion !== "complement",
      emphasis: activeRegion === "complement" ? activeEmphasis : 0,
    },
    a: {
      active: activeRegion === "a",
      muted: activeRegion !== "a",
      emphasis: activeRegion === "a" ? activeEmphasis : 0,
    },
    b: {
      active: activeRegion === "b",
      muted: activeRegion !== "b",
      emphasis: activeRegion === "b" ? activeEmphasis : 0,
    },
  };
}

export function normalizeTime(timeMs, durationMs, loop) {
  if (durationMs <= 0) return 0;
  if (!loop) return clamp(timeMs, 0, durationMs);
  return ((timeMs % durationMs) + durationMs) % durationMs;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

export function wrapText(text, maxCharsPerLine) {
  if (!text) return [""];

  const lines = [];
  let current = "";
  text.split(" ").forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine || !current) {
      current = next;
      return;
    }
    lines.push(current);
    current = word;
  });

  if (current) lines.push(current);
  return lines;
}

function easeOutCubic(value) {
  const t = clamp(value, 0, 1);
  return 1 - (1 - t) ** 3;
}

function buildTextScale(textProgress) {
  if (textProgress <= 0 || textProgress >= 1) return 1;
  return 1 + Math.sin(textProgress * Math.PI) * 0.045;
}
