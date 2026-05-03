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
  buildVennGeometry,
  mergeHoverEmphases,
  normalizeTime,
} from "./model.js";
import { spec } from "./spec.js";

const state = {
  modeKey: "unionComplement",
  currentTimeMs: 0,
  playing: true,
  hoverKey: null,
  lastFrameTime: null,
  rafId: null,
};

const geometry = buildVennGeometry({
  universe: spec.universe,
  circles: spec.circles,
});
const shell = createVizShell({ width: spec.shell.width });
const svg = createSvg({
  width: spec.svg.width,
  height: spec.svg.height,
  ariaLabel: spec.title,
});
svg.append(svgEl("title", { text: spec.title }));

const modeTabs = createModeTabs();
const equationGroup = svgEl("g");
const vennGroup = svgEl("g");
const regionLayers = createRegionLayers();
const circleScaleGroup = svgEl("g");
const outlines = createOutlines();
const phaseLabel = svgEl("text", {
  className: "viz-axis-label",
  x: spec.labels.phase.x,
  y: spec.labels.phase.y,
  "text-anchor": "middle",
});
const wipeRing = svgEl("circle", {
  className: "viz-reference-line-muted",
  cx: (spec.circles.a.cx + spec.circles.b.cx) / 2,
  cy: spec.circles.a.cy,
  r: spec.circles.a.r,
  fill: "none",
  opacity: 0,
});
const miniThreeSet = createMiniThreeSet();

circleScaleGroup.append(
  outlines.circleA,
  outlines.circleB,
  outlines.labelA,
  outlines.labelB,
);
vennGroup.append(
  regionLayers.outside.base,
  regionLayers.outside.active,
  regionLayers.aOnly.base,
  regionLayers.bOnly.base,
  regionLayers.intersection.base,
  regionLayers.aOnly.active,
  regionLayers.bOnly.active,
  regionLayers.intersection.active,
  regionLayers.outside.outline,
  regionLayers.aOnly.outline,
  regionLayers.bOnly.outline,
  regionLayers.intersection.outline,
  circleScaleGroup,
  wipeRing,
  outlines.universe,
  outlines.universeLabel,
  miniThreeSet,
);
svg.append(modeTabs.group, equationGroup, vennGroup, phaseLabel);

const progress = createVideoProgressBar({
  duration: spec.animation.durationMs,
  currentTime: state.currentTimeMs,
  playing: state.playing,
  label: "Animation progress",
  playLabel: "Play or pause De Morgan transformation",
  onPlayPause: togglePlayback,
  onSeek: (nextTimeMs) => {
    state.currentTimeMs = normalizeTime(
      nextTimeMs,
      spec.animation.durationMs,
      spec.animation.loop,
    );
    state.lastFrameTime = null;
    render();
  },
});
const controls = el("section", {
  className: "viz-control-region",
  "aria-label": "Animation controls",
}, [
  el("span", { className: "viz-control-symbol", text: "↺" }),
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

function switchMode(modeKey) {
  state.modeKey = modeKey;
  state.currentTimeMs = 0;
  state.hoverKey = null;
  state.lastFrameTime = null;
  render();
}

function render() {
  const mode = spec.modes[state.modeKey];
  const frame = buildFrame({
    timeMs: state.currentTimeMs,
    mode,
    regions: spec.regions,
    durationMs: spec.animation.durationMs,
    loop: spec.animation.loop,
  });
  const emphases = mergeHoverEmphases(
    frame.emphases,
    state.hoverKey,
    mode,
    spec.regions,
  );

  renderModeTabs();
  renderEquation(mode);
  renderRegions(emphases, frame);
  renderCircleIntro(frame.circleProgress);
  setAttrs(phaseLabel, { text: frame.label });
  setAttrs(wipeRing, {
    r: spec.circles.a.r * (0.65 + frame.complementWipe * 1.25),
    opacity: frame.complementWipe * 0.8,
  });
  progress.setProgress(frame.timeMs, spec.animation.durationMs);
  progress.setPlaying(state.playing);
}

function renderRegions(emphases, frame) {
  spec.regions.forEach((region) => {
    const value = emphases[region] ?? 0;
    const pulseBoost = frame.final ? frame.pulse * 0.12 : 0;
    const activeOpacity = Math.min(1, value * spec.states.activeOpacity + pulseBoost);
    setAttrs(regionLayers[region].active, { opacity: activeOpacity });
    setAttrs(regionLayers[region].outline, {
      opacity: value > 0
        ? spec.states.outlineActiveOpacity * Math.max(value, spec.states.hoverOpacity)
        : 0,
    });
  });
}

function renderCircleIntro(progressValue) {
  const centerX = (spec.circles.a.cx + spec.circles.b.cx) / 2;
  const centerY = spec.circles.a.cy;
  const scale = Math.max(0.001, progressValue);
  setAttrs(circleScaleGroup, {
    transform: `translate(${centerX} ${centerY}) scale(${scale}) translate(${-centerX} ${-centerY})`,
    opacity: Math.min(1, progressValue),
  });
}

function renderModeTabs() {
  spec.modeTabs.forEach((tab) => {
    const nodes = modeTabs.items[tab.key];
    const active = tab.key === state.modeKey;
    setAttrs(nodes.underline, {
      opacity: active ? spec.states.outlineActiveOpacity : 0,
    });
    setAttrs(nodes.text, {
      opacity: active ? spec.states.labelActiveOpacity : spec.states.labelMutedOpacity,
    });
  });
}

function renderEquation(mode) {
  equationGroup.replaceChildren();
  const widths = mode.equationTokens.map((token) => token.text.length * 12);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0);
  let x = spec.labels.equation.x - totalWidth / 2;

  mode.equationTokens.forEach((token, index) => {
    const node = svgEl("text", {
      className: "viz-axis-label",
      x,
      y: spec.labels.equation.y,
      text: token.text,
      tabindex: token.hover ? 0 : undefined,
      role: token.hover ? "button" : undefined,
    });
    if (token.hover) {
      node.addEventListener("mouseenter", () => setHover(token.hover));
      node.addEventListener("mouseleave", () => setHover(null));
      node.addEventListener("focus", () => setHover(token.hover));
      node.addEventListener("blur", () => setHover(null));
      node.addEventListener("click", () => setHover(
        state.hoverKey === token.hover ? null : token.hover,
      ));
    }
    equationGroup.append(node);
    x += widths[index];
  });
}

function setHover(hoverKey) {
  state.hoverKey = hoverKey;
  render();
}

function createRegionLayers() {
  return {
    outside: createRegionPair("outside", geometry.outside, true),
    aOnly: createRegionPair("aOnly", geometry.aOnly, true),
    bOnly: createRegionPair("bOnly", geometry.bOnly, true),
    intersection: createRegionPair("intersection", geometry.intersection, false),
  };
}

function createRegionPair(region, path, evenOdd) {
  const attrs = {
    d: path,
    "data-region": region,
    "fill-rule": evenOdd ? "evenodd" : undefined,
  };
  return {
    base: svgEl("path", {
      ...attrs,
      className: "viz-axis-label-box",
      opacity: spec.states.mutedOpacity,
    }),
    active: svgEl("path", {
      ...attrs,
      className: "viz-curve",
      opacity: 0,
    }),
    outline: svgEl("path", {
      ...attrs,
      className: "viz-reference-line",
      fill: "none",
      opacity: 0,
    }),
  };
}

function createOutlines() {
  return {
    universe: svgEl("rect", {
      className: "viz-reference-line-muted",
      x: spec.universe.x,
      y: spec.universe.y,
      width: spec.universe.width,
      height: spec.universe.height,
      rx: spec.universe.rx,
      fill: "none",
    }),
    universeLabel: svgEl("text", {
      className: "viz-axis-label",
      x: spec.labels.universe.x,
      y: spec.labels.universe.y,
      text: spec.universe.label,
    }),
    circleA: svgEl("path", {
      className: "viz-reference-line-muted",
      d: geometry.circleA,
      fill: "none",
    }),
    circleB: svgEl("path", {
      className: "viz-reference-line-muted",
      d: geometry.circleB,
      fill: "none",
    }),
    labelA: svgEl("text", {
      className: "viz-axis-label",
      x: spec.labels.a.x,
      y: spec.labels.a.y,
      "text-anchor": "middle",
      text: spec.circles.a.label,
    }),
    labelB: svgEl("text", {
      className: "viz-axis-label",
      x: spec.labels.b.x,
      y: spec.labels.b.y,
      "text-anchor": "middle",
      text: spec.circles.b.label,
    }),
  };
}

function createModeTabs() {
  const group = svgEl("g");
  const items = {};
  spec.modeTabs.forEach((tab) => {
    const tabGroup = svgEl("g", {
      tabindex: 0,
      role: "button",
      "aria-label": tab.label,
    });
    const box = svgEl("rect", {
      className: "viz-axis-label-box",
      x: tab.x,
      y: spec.labels.modeTabs.y,
      width: tab.width,
      height: 34,
      rx: 0,
    });
    const text = svgEl("text", {
      className: "viz-axis-label",
      x: tab.x + tab.width / 2,
      y: spec.labels.modeTabs.y + 22,
      "text-anchor": "middle",
      text: tab.label,
    });
    const underline = svgEl("line", {
      className: "viz-reference-line",
      x1: tab.x + 12,
      x2: tab.x + tab.width - 12,
      y1: spec.labels.modeTabs.y + 36,
      y2: spec.labels.modeTabs.y + 36,
      opacity: 0,
    });
    tabGroup.addEventListener("click", () => switchMode(tab.key));
    tabGroup.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        switchMode(tab.key);
      }
    });
    tabGroup.append(box, text, underline);
    group.append(tabGroup);
    items[tab.key] = { text, underline };
  });
  return { group, items };
}

function createMiniThreeSet() {
  const mini = spec.miniThreeSet;
  const group = svgEl("g");
  group.append(
    svgEl("rect", {
      className: "viz-axis-label-box",
      x: mini.x,
      y: mini.y,
      width: mini.width,
      height: mini.height,
      rx: 0,
    }),
    svgEl("text", {
      className: "viz-axis-label",
      x: mini.x + mini.width / 2,
      y: mini.y - 12,
      "text-anchor": "middle",
      text: mini.label,
    }),
  );
  mini.circles.forEach((circle) => {
    group.append(svgEl("circle", {
      className: "viz-reference-line-muted",
      cx: circle.cx,
      cy: circle.cy,
      r: circle.r,
      fill: "none",
    }));
  });
  return group;
}
