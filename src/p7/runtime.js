import { spec } from "./spec.js";
import {
  createSvg,
  createVideoProgressBar,
  createVizShell,
  el,
  setAttrs,
  svgEl,
} from "../primitives/index.js";
import { buildFrame, buildVennGeometry, normalizeTime } from "./model.js";

const state = {
  currentTimeMs: 0,
  playing: true,
  lastFrameTime: null,
  rafId: null,
};

const geometry = buildVennGeometry({
  sampleSpace: spec.sampleSpace,
  circles: spec.circles,
});

const shell = createVizShell({ width: spec.shell.width });
const svg = createSvg({
  width: spec.svg.width,
  height: spec.svg.height,
  ariaLabel: spec.title,
});
svg.append(svgEl("title", { text: spec.title }));

const sampleSpace = svgEl("rect", {
  className: "viz-axis-label-box",
  x: spec.sampleSpace.x,
  y: spec.sampleSpace.y,
  width: spec.sampleSpace.width,
  height: spec.sampleSpace.height,
});
const sampleSpaceOutline = svgEl("rect", {
  className: "viz-reference-line-muted",
  x: spec.sampleSpace.x,
  y: spec.sampleSpace.y,
  width: spec.sampleSpace.width,
  height: spec.sampleSpace.height,
  fill: "none",
});
const sampleSpaceLabel = svgEl("text", {
  className: "viz-axis-label",
  x: spec.labels.sampleSpace.x,
  y: spec.labels.sampleSpace.y,
  text: spec.sampleSpace.label,
});

const baseCircleA = createCircleLayer("circleA");
const baseCircleB = createCircleLayer("circleB");
const activeCircleA = createActiveLayer("circleA");
const activeCircleB = createActiveLayer("circleB");
const activeOverlap = createActiveLayer("overlap");
const activeOutside = createActiveLayer("outside", true);
const circleAOutline = createOutline("circleA");
const circleBOutline = createOutline("circleB");
const labelA = createSetLabel("a");
const labelB = createSetLabel("b");
const badge = createBadge();

svg.append(
  sampleSpace,
  baseCircleA,
  baseCircleB,
  activeOutside,
  activeCircleA,
  activeCircleB,
  activeOverlap,
  circleAOutline,
  circleBOutline,
  sampleSpaceOutline,
  sampleSpaceLabel,
  labelA,
  labelB,
  badge.group,
);

const progress = createVideoProgressBar({
  duration: spec.animation.durationMs,
  currentTime: state.currentTimeMs,
  playing: state.playing,
  label: spec.controls.progressLabel,
  playLabel: spec.controls.playLabel,
  onPlayPause: togglePlayback,
  onSeek: seekTo,
});
const controls = el("section", {
  className: "viz-control-region",
  "aria-label": "Animation controls",
}, [
  el("span", { className: "viz-control-symbol", text: "0" }),
  progress.node,
  el("span", { className: "viz-control-symbol", text: "t" }),
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
      spec.animation.durationMs,
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
}

function seekTo(nextTimeMs) {
  state.currentTimeMs = normalizeTime(
    nextTimeMs,
    spec.animation.durationMs,
    spec.animation.loop,
  );
  state.lastFrameTime = null;
  render();
}

function render() {
  const frame = buildFrame({
    timeMs: state.currentTimeMs,
    spec,
  });

  renderActiveLayer(activeCircleA, frame, "circleA");
  renderActiveLayer(activeCircleB, frame, "circleB");
  renderActiveLayer(activeOverlap, frame, "overlap");
  renderActiveLayer(activeOutside, frame, "outside");
  renderLabels(frame);
  renderBadge(frame);
  progress.setProgress(frame.timeMs, spec.animation.durationMs);
  progress.setPlaying(state.playing);
}

function renderActiveLayer(node, frame, target) {
  const active = frame.activeTarget === target;
  setAttrs(node, {
    opacity: active ? frame.activeOpacity * spec.visual.activeOpacity : 0,
    transform: active ? frame.transforms[target] : "",
  });
}

function renderLabels(frame) {
  setAttrs(labelA, {
    opacity: frame.activeTarget === "circleA"
      ? spec.visual.labelActiveOpacity
      : spec.visual.labelMutedOpacity,
    transform: frame.activeTarget === "circleA" ? frame.transforms.circleA : "",
  });
  setAttrs(labelB, {
    opacity: frame.activeTarget === "circleB"
      ? spec.visual.labelActiveOpacity
      : spec.visual.labelMutedOpacity,
    transform: frame.activeTarget === "circleB" ? frame.transforms.circleB : "",
  });
}

function renderBadge(frame) {
  setAttrs(badge.group, { opacity: frame.badgeOpacity });
  setAttrs(badge.text, { text: frame.badgeText });
}

function createCircleLayer(key) {
  return svgEl("path", {
    className: "viz-area-fill",
    d: geometry[key],
    opacity: spec.visual.baseOpacity,
  });
}

function createActiveLayer(key, evenOdd = false) {
  return svgEl("path", {
    className: "viz-curve",
    d: geometry[key],
    "fill-rule": evenOdd ? "evenodd" : undefined,
    opacity: 0,
  });
}

function createOutline(key) {
  return svgEl("path", {
    className: "viz-reference-line-muted",
    d: geometry[key],
    fill: "none",
    opacity: spec.visual.outlineOpacity,
  });
}

function createSetLabel(key) {
  const circle = spec.circles[key];
  const label = spec.labels[key];
  return svgEl("text", {
    className: "viz-axis-label",
    x: label.x,
    y: label.y,
    "text-anchor": "middle",
    text: circle.label,
    opacity: spec.visual.labelMutedOpacity,
  });
}

function createBadge() {
  const { x, y, width, height } = spec.labels.badge;
  const group = svgEl("g", { opacity: 0 });
  const box = svgEl("rect", {
    className: "viz-axis-label-box",
    x: x - width / 2,
    y: y - height / 2,
    width,
    height,
  });
  const text = svgEl("text", {
    className: "viz-axis-label",
    x,
    y: y + 5,
    "text-anchor": "middle",
  });

  group.append(box, text);
  return { group, text };
}
