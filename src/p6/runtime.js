import { spec } from "./spec.js";
import {
  createSvg,
  createTickSlider,
  createVizShell,
  el,
  setAttrs,
  svgEl,
} from "../primitives/index.js";
import {
  buildFrame,
  buildRegionGeometry,
  clampStep,
  interpolateRegionStates,
  transitionProgress,
} from "./model.js";

const regionKeys = spec.regions.map((region) => region.key);
const geometry = buildRegionGeometry({
  universe: spec.universe,
  sets: spec.sets,
});

const state = {
  modeKey: spec.controls.modeDefault,
  step: spec.controls.stepDefault,
  hoverRegion: null,
  transitionStart: null,
  transitionFrom: Object.fromEntries(regionKeys.map((region) => [region, 0])),
  transitionTo: Object.fromEntries(regionKeys.map((region) => [region, 0])),
  renderedRegions: Object.fromEntries(regionKeys.map((region) => [region, 0])),
  transitionProgress: 1,
  rafId: null,
};

const shell = createVizShell({ width: spec.shell.width });
const svg = createSvg({
  width: spec.svg.width,
  height: spec.svg.height,
  ariaLabel: spec.title,
});
svg.append(svgEl("title", { text: spec.title }));

const modeTabs = createModeTabs();
const regionLayers = createRegionLayers();
const universeLabel = svgEl("text", {
  className: "viz-axis-label",
  x: spec.labels.universe.x,
  y: spec.labels.universe.y,
  text: spec.universe.label,
});
const labelA = svgEl("text", {
  className: "viz-axis-label",
  x: spec.labels.a.x,
  y: spec.labels.a.y,
  "text-anchor": "middle",
  text: spec.sets.a.label,
});
const labelB = svgEl("text", {
  className: "viz-axis-label",
  x: spec.labels.b.x,
  y: spec.labels.b.y,
  "text-anchor": "middle",
  text: spec.sets.b.label,
});
const formulaLabel = svgEl("text", {
  className: "viz-axis-label",
  x: spec.labels.formula.x,
  y: spec.labels.formula.y,
  "text-anchor": "middle",
});
const universeBackground = svgEl("rect", {
  x: spec.universe.x,
  y: spec.universe.y,
  width: spec.universe.width,
  height: spec.universe.height,
  fill: spec.visual.universeFill,
});
const outlines = createOutlines();

svg.append(
  modeTabs.group,
  universeBackground,
  ...regionKeys.flatMap((region) => [
    regionLayers[region].base,
    regionLayers[region].active,
    regionLayers[region].outline,
  ]),
  outlines.universe,
  outlines.circleA,
  outlines.circleB,
  universeLabel,
  labelA,
  labelB,
  formulaLabel,
);

const stepSlider = createTickSlider({
  min: spec.controls.scrubber.min,
  max: spec.controls.scrubber.max,
  step: spec.controls.scrubber.step,
  value: state.step,
  label: spec.controls.scrubber.label,
  onInput: (nextStep) => setStep(nextStep),
});
const controls = el("section", {
  className: "viz-control-region",
  "aria-label": "De Morgan transformation controls",
}, [
  el("span", { className: "viz-control-symbol", text: "s" }),
  stepSlider.node,
  el("span", { className: "viz-control-symbol", text: "3" }),
]);

shell.append(svg, controls);
document.querySelector("#app").append(shell);

commitFrame();
render();

function setStep(nextStep) {
  const clampedStep = clampStep(
    nextStep,
    spec.controls.scrubber.min,
    spec.controls.scrubber.max,
  );
  state.step = clampedStep;
  beginTransition();
}

function switchMode(modeKey) {
  state.modeKey = modeKey;
  state.step = spec.controls.stepDefault;
  state.hoverRegion = null;
  stepSlider.input.value = state.step;
  stepSlider.update(state.step);
  beginTransition();
}

function setHover(regionKey) {
  state.hoverRegion = regionKey;
  beginTransition();
}

function beginTransition() {
  const nextFrame = nextModelFrame();
  state.transitionFrom = state.renderedRegions;
  state.transitionTo = nextFrame.regionTargets;
  state.transitionStart = null;
  state.transitionProgress = 0;
  requestRender();
}

function requestRender() {
  if (state.rafId !== null) return;
  state.rafId = window.requestAnimationFrame(render);
}

function render(frameTime = 0) {
  state.rafId = null;
  const frame = nextModelFrame();
  const regionStates = currentRegionStates(frameTime);
  state.renderedRegions = regionStates;

  renderModeTabs();
  renderLabels(frame);
  renderRegions(regionStates);

  if (state.transitionProgress < 1) {
    requestRender();
  }
}

function currentRegionStates(frameTime = 0) {
  if (state.transitionProgress >= 1) return state.transitionTo;
  if (state.transitionStart === null) state.transitionStart = frameTime;

  state.transitionProgress = transitionProgress({
    elapsedMs: frameTime - state.transitionStart,
    durationMs: spec.animation.stepDurationMs,
  });

  return interpolateRegionStates({
    from: state.transitionFrom,
    to: state.transitionTo,
    regions: spec.regions,
    progress: state.transitionProgress,
  });
}

function commitFrame() {
  const frame = nextModelFrame();
  state.transitionFrom = frame.regionTargets;
  state.transitionTo = frame.regionTargets;
  state.renderedRegions = frame.regionTargets;
  state.transitionProgress = 1;
}

function nextModelFrame() {
  return buildFrame({
    mode: spec.modes[state.modeKey],
    step: state.step,
    regions: spec.regions,
    hoverRegion: state.hoverRegion,
  });
}

function renderModeTabs() {
  spec.modeTabs.forEach((tab) => {
    const active = tab.key === state.modeKey;
    const nodes = modeTabs.items[tab.key];
    setAttrs(nodes.underline, {
      opacity: active ? spec.visual.outlineOpacity : 0,
    });
    setAttrs(nodes.text, {
      opacity: active ? spec.visual.labelActiveOpacity : 0.48,
    });
  });
}

function renderLabels(frame) {
  const showSetLabels = frame.labelsVisible.includes("labelA")
    || frame.labelsVisible.includes("labelB");
  const showFormula = frame.labelsVisible.includes("labelFormula");

  setAttrs(labelA, {
    opacity: showSetLabels ? spec.visual.labelActiveOpacity : spec.visual.labelMutedOpacity,
  });
  setAttrs(labelB, {
    opacity: showSetLabels ? spec.visual.labelActiveOpacity : spec.visual.labelMutedOpacity,
  });
  setAttrs(formulaLabel, {
    opacity: showFormula ? spec.visual.labelActiveOpacity : spec.visual.labelMutedOpacity,
    text: frame.formula,
    "aria-label": frame.formulaText,
  });
}

function renderRegions(regionStates) {
  spec.regions.forEach((region) => {
    const value = regionStates[region.key] ?? 0;
    setAttrs(regionLayers[region.key].active, {
      opacity: value * spec.visual.activeOpacity,
    });
    setAttrs(regionLayers[region.key].outline, {
      opacity: value > 0 ? spec.visual.outlineOpacity * Math.max(0.35, value) : 0,
    });
  });
}

function createRegionLayers() {
  return Object.fromEntries(spec.regions.map((region) => {
    const attrs = {
      d: geometry[region.key],
      "data-region": region.key,
      "fill-rule": region.fillRule,
      tabindex: 0,
      role: "button",
      "aria-label": region.textEquivalent,
    };
    const base = svgEl("path", {
      ...attrs,
      fill: spec.visual.inactiveFill,
      opacity: spec.visual.inactiveOpacity,
    });
    const active = svgEl("path", {
      ...attrs,
      className: "viz-marker",
      fill: spec.visual.activeFill,
      opacity: 0,
    });
    const outline = svgEl("path", {
      ...attrs,
      className: "viz-reference-line",
      fill: "none",
      opacity: 0,
    });

    [base, active, outline].forEach((node) => {
      node.addEventListener("mouseenter", () => setHover(region.key));
      node.addEventListener("mouseleave", () => setHover(null));
      node.addEventListener("focus", () => setHover(region.key));
      node.addEventListener("blur", () => setHover(null));
    });

    return [region.key, { base, active, outline }];
  }));
}

function createOutlines() {
  return {
    universe: svgEl("rect", {
      className: "viz-reference-line-muted",
      x: spec.universe.x,
      y: spec.universe.y,
      width: spec.universe.width,
      height: spec.universe.height,
      fill: "none",
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
    });
    const text = svgEl("text", {
      className: "viz-axis-label",
      x: tab.x + tab.width / 2,
      y: spec.labels.modeTabs.y + 22,
      "text-anchor": "middle",
      text: tab.display,
    });
    const underline = svgEl("line", {
      className: "viz-reference-line",
      x1: tab.x + 12,
      x2: tab.x + tab.width - 12,
      y1: spec.labels.modeTabs.y + 38,
      y2: spec.labels.modeTabs.y + 38,
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
