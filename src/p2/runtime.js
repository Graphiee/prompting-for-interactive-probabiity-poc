import { spec } from "./spec.js";
import {
  createPlayPauseButton,
  createSvg,
  createTickSlider,
  createVizShell,
  drawAxes,
  drawCurve,
  drawGrid,
  drawHorizontalReference,
  drawMarker,
  el,
  linearScale,
  setAttrs,
  svgEl,
  ticks,
} from "../primitives/index.js";
import {
  buildExperimentSeries,
  buildVisibleRunTicks,
  filterSeriesWindow,
  selectRun,
  visibleRunWindow,
} from "./model.js";

const state = {
  selectedRun: spec.slider.value,
  playing: false,
  timerId: null,
};

const shell = createVizShell({ width: spec.shell.width });
const svg = createSvg({
  width: spec.svg.width,
  height: spec.svg.height,
  ariaLabel: spec.title,
});
svg.append(svgEl("title", { text: spec.title }));

const yScale = linearScale(
  [spec.axes.y.min, spec.axes.y.max],
  [spec.plot.y + spec.plot.height, spec.plot.y],
);
let xScale = createXScale(state.selectedRun);

const series = buildExperimentSeries({
  min: spec.axes.x.min,
  max: spec.axes.x.max,
  successProbability: spec.experiment.successProbability,
  seed: spec.experiment.seed,
});

let gridGroup;
let axesGroup;
let curve = drawCurve(svg, { points: [] });
const referenceLine = drawHorizontalReference(svg, {
  y: yScale(spec.referenceLine.value),
  plot: spec.plot,
});
const marker = drawMarker(svg, { x: 0, y: 0 });
const probabilityText = drawCenteredText(svg, {
  plot: spec.plot,
  text: "",
  offset: 46,
});
drawXAxisLabel(svg, { plot: spec.plot, label: spec.axes.x.label });

const controls = el("section", {
  className: "viz-control-region",
  "aria-label": "Long running frequency chart controls",
});
const sliderLabel = el("span", { className: "viz-control-symbol", text: spec.slider.label });
const slider = createTickSlider({
  min: spec.slider.min,
  max: spec.slider.max,
  value: spec.slider.value,
  label: spec.slider.label,
  onInput: (nextRun) => {
    state.selectedRun = nextRun;
    update();
  },
});
const playButton = createPlayPauseButton({
  label: "Play or pause runs",
  onClick: () => {
    if (state.playing) pause();
    else play();
  },
});
const experimentBadge = el("div", {
  className: "viz-x-label-badge",
  text: "",
});
const badgeRow = el("section", { className: "viz-control-region" }, [
  el("span", { className: "viz-control-symbol", text: "" }),
  experimentBadge,
  el("span", { className: "viz-control-symbol", text: "" }),
]);

controls.append(sliderLabel, slider.node, playButton.node);
shell.append(svg, controls, badgeRow);
document.querySelector("#app").append(shell);

update();

function update() {
  const selected = selectRun(series, state.selectedRun);
  const window = visibleRunWindow({
    selectedRun: selected.run,
    min: spec.axes.x.min,
    max: spec.axes.x.max,
    visibleTickCount: spec.axes.x.visibleTickCount,
  });
  const visibleSeries = filterSeriesWindow(series, window, selected.run);
  const visibleTicks = buildVisibleRunTicks(window);

  xScale = createXScale(selected.run);
  renderGridAndAxes(visibleTicks);
  renderCurve(visibleSeries);
  setAttrs(marker, {
    cx: xScale(selected.run),
    cy: yScale(selected.probability),
  });
  setAttrs(probabilityText, {
    text: `Estimated probability = ${formatProbabilityValue(selected.probability)}`,
  });
  slider.update(selected.run);
  slider.input.value = selected.run;
  experimentBadge.textContent = `${selected.run} Experiments`;

  if (selected.run >= spec.slider.max) pause();
}

function renderGridAndAxes(xTickValues) {
  gridGroup?.remove();
  axesGroup?.remove();
  gridGroup = drawGrid(svg, {
    plot: spec.plot,
    xScale,
    yScale,
    xTicks: xTickValues,
    yTicks: ticks(spec.axes.y.min, spec.axes.y.max, spec.axes.y.tickStep),
  });
  axesGroup = drawAxes(svg, {
    plot: spec.plot,
    xScale,
    yScale,
    xTicks: xTickValues,
    yTicks: ticks(spec.axes.y.min, spec.axes.y.max, spec.axes.y.tickStep),
    yLabel: spec.axes.y.label,
  });
  svg.insertBefore(gridGroup, curve);
  svg.insertBefore(axesGroup, curve);
}

function renderCurve(visibleSeries) {
  const points = visibleSeries.map((point) => ({
    x: xScale(point.run),
    y: yScale(point.probability),
  }));
  setAttrs(curve, { d: pathFromPoints(points) });
  svg.insertBefore(referenceLine, marker);
  svg.insertBefore(curve, marker);
}

function play() {
  if (state.playing) return;
  state.playing = true;
  playButton.setPlaying(true);
  state.timerId = window.setInterval(() => {
    state.selectedRun = Math.min(spec.slider.max, state.selectedRun + spec.animation.step);
    update();
  }, spec.animation.intervalMs);
}

function pause() {
  state.playing = false;
  playButton.setPlaying(false);
  if (state.timerId !== null) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function createXScale(selectedRun) {
  const window = visibleRunWindow({
    selectedRun,
    min: spec.axes.x.min,
    max: spec.axes.x.max,
    visibleTickCount: spec.axes.x.visibleTickCount,
  });
  return linearScale([window.start, window.end], [spec.plot.x, spec.plot.x + spec.plot.width]);
}

function formatProbabilityValue(probability) {
  return probability.toFixed(3);
}

// Shared curve primitive owns the path element, but does not export its path
// serializer. This chart-local helper lets updates reuse the same curve node.
function pathFromPoints(points) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
}

// Shared axes currently render only the vertical label, so this local helper
// adds the required x-axis label without extending the shared primitive API.
function drawXAxisLabel(svgNode, { plot, label }) {
  const x = plot.x + plot.width / 2;
  const y = plot.y + plot.height + 78;
  const labelNode = svgEl("text", {
    className: "viz-axis-label",
    x,
    y,
    "text-anchor": "middle",
    text: label,
  });
  svgNode.append(labelNode);
  return labelNode;
}

function drawCenteredText(svgNode, { plot, text, offset }) {
  const x = plot.x + plot.width / 2;
  const y = plot.y + plot.height + offset;
  const textNode = svgEl("text", {
    className: "viz-tick-label",
    x,
    y,
    "text-anchor": "middle",
    text,
  });
  svgNode.append(textNode);
  return textNode;
}
