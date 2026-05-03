import {
  createSvg,
  createVideoProgressBar,
  createVizShell,
  el,
  setAttrs,
  svgEl,
} from "../vis-primitives/index.js";
import {
  buildFrame,
  buildTimeline,
  normalizeTime,
} from "./model.js";
import { spec } from "./spec.js";

const timeline = buildTimeline({
  steps: spec.steps,
  stepDurationMs: spec.animation.stepDurationMs,
});

const state = {
  currentTimeMs: 0,
  playing: true,
  lastFrameTime: null,
  rafId: null,
};

const shell = createVizShell({ width: spec.shell.width });
const svg = createSvg({
  width: spec.svg.width,
  height: spec.svg.height,
  ariaLabel: spec.title,
});
svg.append(svgEl("title", { text: spec.title }));

const defs = svgEl("defs", {}, [
  svgEl("filter", {
    id: "p4-active-region-shadow",
    x: "-12%",
    y: "-12%",
    width: "124%",
    height: "124%",
  }, [
    svgEl("feDropShadow", {
      dx: 0,
      dy: 7,
      stdDeviation: 7,
      "flood-opacity": 0.22,
    }),
  ]),
]);

const sampleSpace = svgEl("rect", {
  className: "viz-axis-label-box",
  x: spec.sampleSpace.x,
  y: spec.sampleSpace.y,
  width: spec.sampleSpace.width,
  height: spec.sampleSpace.height,
  rx: spec.sampleSpace.rx,
});
const sampleHighlight = svgEl("rect", {
  className: "viz-area-fill",
  x: spec.sampleSpace.x,
  y: spec.sampleSpace.y,
  width: spec.sampleSpace.width,
  height: spec.sampleSpace.height,
  rx: spec.sampleSpace.rx,
});
const sampleOutline = svgEl("rect", {
  className: "viz-reference-line",
  x: spec.sampleSpace.x,
  y: spec.sampleSpace.y,
  width: spec.sampleSpace.width,
  height: spec.sampleSpace.height,
  rx: spec.sampleSpace.rx,
  fill: "none",
});
const circleA = createCircle(spec.circles.a);
const circleB = createCircle(spec.circles.b);
const circleAOutline = createCircleOutline(spec.circles.a);
const circleBOutline = createCircleOutline(spec.circles.b);
const sampleLabel = svgEl("text", {
  className: "viz-axis-label",
  x: spec.labels.sample.x,
  y: spec.labels.sample.y,
  text: spec.sampleSpace.label,
});
const labelA = svgEl("text", {
  className: "viz-axis-label",
  x: spec.labels.a.x,
  y: spec.labels.a.y,
  "text-anchor": "middle",
  "dominant-baseline": "middle",
  text: spec.circles.a.label,
});
const labelB = svgEl("text", {
  className: "viz-axis-label",
  x: spec.labels.b.x,
  y: spec.labels.b.y,
  "text-anchor": "middle",
  "dominant-baseline": "middle",
  text: spec.circles.b.label,
});
const narrationGroup = svgEl("g");
const narrationText = svgEl("text", {
  className: "viz-axis-label",
  x: spec.narration.x,
  y: spec.narration.y,
  "text-anchor": "middle",
});
narrationGroup.append(narrationText);

svg.append(
  defs,
  sampleSpace,
  sampleHighlight,
  sampleOutline,
  sampleLabel,
  circleA,
  circleB,
  circleAOutline,
  circleBOutline,
  labelA,
  labelB,
  narrationGroup,
);

const progress = createVideoProgressBar({
  duration: timeline.durationMs,
  currentTime: state.currentTimeMs,
  playing: state.playing,
  label: "Animation timeline",
  playLabel: "Play or pause event highlight sequence",
  onPlayPause: togglePlayback,
  onSeek: (nextTimeMs) => {
    state.currentTimeMs = normalizeTime(
      nextTimeMs,
      timeline.durationMs,
      spec.animation.loop,
    );
    state.lastFrameTime = null;
    render();
  },
});
const controls = el("section", {
  className: "viz-control-region",
  "aria-label": "Venn diagram animation controls",
}, [
  el("span", { className: "viz-control-symbol", text: "" }),
  progress.node,
  el("span", { className: "viz-control-symbol", text: "" }),
]);

shell.append(svg, controls);
document.querySelector("#app").append(shell);

render();
startAnimation();

function startAnimation() {
  if (state.rafId !== null) return;
  state.rafId = window.requestAnimationFrame(tick);
}

function tick(frameTime) {
  if (state.playing) {
    if (state.lastFrameTime === null) state.lastFrameTime = frameTime;
    const elapsedMs = frameTime - state.lastFrameTime;
    state.lastFrameTime = frameTime;
    state.currentTimeMs = normalizeTime(
      state.currentTimeMs + elapsedMs,
      timeline.durationMs,
      spec.animation.loop,
    );
    render();
  } else {
    state.lastFrameTime = null;
  }
  state.rafId = window.requestAnimationFrame(tick);
}

function togglePlayback() {
  state.playing = !state.playing;
  progress.setPlaying(state.playing);
  if (state.playing) startAnimation();
}

function render() {
  const frame = buildFrame({
    timeMs: state.currentTimeMs,
    steps: spec.steps,
    stepDurationMs: spec.animation.stepDurationMs,
    transitionMs: spec.animation.transitionMs,
    textDelayMs: spec.animation.textDelayMs,
    textRevealMs: spec.animation.textRevealMs,
    maxCharsPerLine: spec.narration.maxCharsPerLine,
    loop: spec.animation.loop,
  });

  applyRegionState(frame.regionStates);
  renderNarration(frame.textLines, frame.textScale);
  progress.setProgress(frame.timeMs, timeline.durationMs);
  progress.setPlaying(state.playing);
}

function applyRegionState(regionStates) {
  const sampleOpacity = opacityFor(regionStates.sampleSpace);
  const aOpacity = opacityFor(regionStates.a);
  const bOpacity = opacityFor(regionStates.b);

  setAttrs(sampleHighlight, {
    opacity: sampleOpacity,
  });
  setOptionalAttr(
    sampleHighlight,
    "filter",
    regionStates.sampleSpace.active ? "url(#p4-active-region-shadow)" : null,
  );
  setAttrs(sampleOutline, {
    opacity: regionStates.sampleSpace.active ? spec.states.labelActiveOpacity : 0,
  });
  setAttrs(circleA, {
    opacity: aOpacity,
  });
  setOptionalAttr(
    circleA,
    "filter",
    regionStates.a.active ? "url(#p4-active-region-shadow)" : null,
  );
  setAttrs(circleB, {
    opacity: bOpacity,
  });
  setOptionalAttr(
    circleB,
    "filter",
    regionStates.b.active ? "url(#p4-active-region-shadow)" : null,
  );
  setAttrs(circleAOutline, {
    opacity: regionStates.a.active ? spec.states.labelActiveOpacity : 0,
  });
  setAttrs(circleBOutline, {
    opacity: regionStates.b.active ? spec.states.labelActiveOpacity : 0,
  });
  setAttrs(labelA, {
    opacity: regionStates.a.active ? spec.states.labelActiveOpacity : spec.states.labelMutedOpacity,
  });
  setAttrs(labelB, {
    opacity: regionStates.b.active ? spec.states.labelActiveOpacity : spec.states.labelMutedOpacity,
  });

  if (regionStates.a.active) svg.append(circleA, circleAOutline, labelA);
  if (regionStates.b.active) svg.append(circleB, circleBOutline, labelB);
  svg.append(narrationGroup);
}

function renderNarration(lines, scale) {
  narrationText.replaceChildren();
  lines.forEach((line, index) => {
    narrationText.append(svgEl("tspan", {
      x: spec.narration.x,
      dy: index === 0 ? 0 : spec.narration.lineHeight,
      text: line,
    }));
  });
  setAttrs(narrationGroup, {
    transform: `translate(${spec.narration.x} ${spec.narration.y}) scale(${scale}) translate(${-spec.narration.x} ${-spec.narration.y})`,
  });
}

function createCircle(circle) {
  return svgEl("circle", {
    className: "viz-area-fill",
    cx: circle.cx,
    cy: circle.cy,
    r: circle.r,
  });
}

function createCircleOutline(circle) {
  return svgEl("circle", {
    className: "viz-reference-line",
    cx: circle.cx,
    cy: circle.cy,
    r: circle.r,
    fill: "none",
  });
}

function opacityFor(regionState) {
  const emphasis = regionState.emphasis ?? (regionState.active ? 1 : 0);
  return spec.states.mutedOpacity +
    (spec.states.activeOpacity - spec.states.mutedOpacity) * emphasis;
}

function setOptionalAttr(node, key, value) {
  if (value === undefined || value === null) node.removeAttribute(key);
  else node.setAttribute(key, value);
}
