import { spec } from "./spec.js";
import {
  createSvg,
  createTickSlider,
  createVizShell,
  drawAxes,
  drawGrid,
  drawMarker,
  el,
  linearScale,
  setAttrs,
  svgEl,
  ticks,
} from "../primitives/index.js";
import {
  buildBernoulliSeries,
  formatProbability,
  selectBernoulliPoint,
} from "./model.js";

const state = {
  p: spec.controls.p.value,
  k: spec.controls.k.value,
};

const shell = createVizShell({ width: spec.shell.width });
const svg = createSvg({
  width: spec.svg.width,
  height: spec.svg.height,
  ariaLabel: spec.title,
});
svg.append(svgEl("title", { text: spec.title }));

const xScale = linearScale(
  [spec.axes.x.min, spec.axes.x.max],
  [spec.plot.x, spec.plot.x + spec.plot.width],
);
const yScale = linearScale(
  [spec.axes.y.min, spec.axes.y.max],
  [spec.plot.y + spec.plot.height, spec.plot.y],
);
const xTickValues = ticks(spec.axes.x.min, spec.axes.x.max, spec.axes.x.tickStep);
const yTickValues = ticks(spec.axes.y.min, spec.axes.y.max, spec.axes.y.tickStep);

drawGrid(svg, {
  plot: spec.plot,
  xScale,
  yScale,
  xTicks: xTickValues,
  yTicks: yTickValues,
});
drawAxes(svg, {
  plot: spec.plot,
  xScale,
  yScale,
  xTicks: xTickValues,
  yTicks: yTickValues,
  yLabel: spec.axes.y.label,
});
drawXAxisLabel(svg, { plot: spec.plot, label: spec.axes.x.label });

const verticalBar = svgEl("line", { className: "viz-reference-line" });
const dotsGroup = svgEl("g", { className: "viz-bernoulli-dots" });
svg.append(verticalBar, dotsGroup);
const marker = drawMarker(svg, { x: 0, y: 0, radius: spec.dots.selectedRadius });

const pValue = el("span", {
  className: "viz-control-symbol",
  text: formatControlValue(state.p),
});
const pSlider = createTickSlider({
  min: spec.controls.p.min,
  max: spec.controls.p.max,
  step: spec.controls.p.step,
  value: spec.controls.p.value,
  label: spec.controls.p.label,
  onInput: (nextP) => {
    state.p = nextP;
    update();
  },
});
const pControls = el("section", {
  className: "viz-control-region",
  "aria-label": "Probability of success control",
}, [
  el("span", { className: "viz-control-symbol", text: spec.controls.p.label }),
  pSlider.node,
  pValue,
]);

const kValue = el("span", {
  className: "viz-control-symbol",
  text: String(state.k),
});
const kSlider = createTickSlider({
  min: spec.controls.k.min,
  max: spec.controls.k.max,
  value: spec.controls.k.value,
  label: spec.controls.k.label,
  onInput: (nextK) => {
    state.k = nextK;
    update();
  },
});
const kControls = el("section", {
  className: "viz-control-region",
  "aria-label": "Number of successes control",
}, [
  el("span", { className: "viz-control-symbol", text: spec.controls.k.label }),
  kSlider.node,
  kValue,
]);

const probabilitySvg = createSvg({
  width: spec.svg.width,
  height: spec.probabilityReadout.height,
  ariaLabel: "Selected Bernoulli probability",
});
const formulaText = svgEl("text", {
  className: "viz-axis-label",
  x: spec.svg.width / 2,
  y: 28,
  "text-anchor": "middle",
});
const probabilityText = svgEl("text", {
  className: "viz-axis-label",
  x: spec.svg.width / 2,
  y: 62,
  "text-anchor": "middle",
});
probabilitySvg.append(formulaText, probabilityText);

shell.append(svg, pControls, kControls, probabilitySvg);
document.querySelector("#app").append(shell);

update();

function update() {
  const series = buildBernoulliSeries({
    min: spec.axes.x.min,
    max: spec.axes.x.max,
    p: state.p,
  });
  const selected = selectBernoulliPoint({ p: state.p, k: state.k });
  const selectedX = xScale(selected.k);
  const selectedY = yScaleForPlot(selected.probability);

  renderDots(series);
  setAttrs(marker, {
    cx: selectedX,
    cy: selectedY,
  });
  setAttrs(verticalBar, {
    x1: selectedX,
    x2: selectedX,
    y1: selectedY,
    y2: spec.plot.y + spec.plot.height,
  });
  pValue.textContent = formatControlValue(state.p);
  kValue.textContent = String(state.k);
  setAttrs(formulaText, { text: `P(X = ${state.k})` });
  setAttrs(probabilityText, { text: formatProbability(selected.probability) });
  pSlider.update(state.p);
  kSlider.update(state.k);
}

function renderDots(series) {
  dotsGroup.replaceChildren();
  series.forEach((point) => {
    dotsGroup.append(svgEl("circle", {
      className: "viz-curve",
      cx: xScale(point.k),
      cy: yScaleForPlot(point.probability),
      r: spec.dots.radius,
    }));
  });
}

function yScaleForPlot(probability) {
  if (!Number.isFinite(probability)) return spec.plot.y;
  return yScale(Math.max(spec.axes.y.min, Math.min(spec.axes.y.max, probability)));
}

function formatControlValue(value) {
  return Number(value).toFixed(2);
}

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
