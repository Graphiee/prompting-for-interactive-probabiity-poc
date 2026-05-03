import {
  createReadout,
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
  svgEl,
  ticks,
} from "../vis-primitives/index.js";
import {
  buildBirthdaySeries,
  buildSelectedBirthday,
} from "./model.js";
import { spec } from "./spec.js";

const state = {
  selectedN: spec.slider.value,
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

const series = buildBirthdaySeries({
  min: spec.axes.x.min,
  max: spec.axes.x.max,
  daysInYear: spec.daysInYear,
});
const curvePoints = series.map((point) => ({
  x: xScale(point.n),
  y: yScale(point.probability),
}));

drawGrid(svg, {
  plot: spec.plot,
  xScale,
  yScale,
  xTicks: ticks(10, spec.axes.x.max, spec.axes.x.tickStep),
  yTicks: ticks(spec.axes.y.min, spec.axes.y.max, spec.axes.y.tickStep),
});
drawAxes(svg, {
  plot: spec.plot,
  xScale,
  yScale,
  xTicks: ticks(10, spec.axes.x.max, spec.axes.x.tickStep),
  yTicks: ticks(spec.axes.y.min, spec.axes.y.max, spec.axes.y.tickStep),
  xLabel: spec.axes.x.label,
  yLabel: spec.axes.y.label,
});
drawXAxisLabel(svg, { plot: spec.plot, label: spec.axes.x.label });
drawCurve(svg, { points: curvePoints });
drawHorizontalReference(svg, {
  y: yScale(spec.referenceLine.value),
  plot: spec.plot,
});

const marker = drawMarker(svg, { x: 0, y: 0 });
const controls = el("section", {
  className: "viz-control-region",
  "aria-label": "Shared birthday probability controls",
});
const sliderLabel = el("span", { className: "viz-control-symbol", text: spec.slider.label });
const slider = createTickSlider({
  min: spec.slider.min,
  max: spec.slider.max,
  value: spec.slider.value,
  label: spec.slider.label,
  onInput: (nextN) => {
    state.selectedN = nextN;
    update();
  },
});
const readout = createReadout({
  kicker: "shared birthday",
  value: "",
  subtitle: "",
});

controls.append(sliderLabel, slider.node, readout.node);
shell.append(svg, controls);
document.querySelector("#app").append(shell);

update();

function update() {
  const selected = buildSelectedBirthday({
    n: state.selectedN,
    daysInYear: spec.daysInYear,
  });

  marker.setAttribute("cx", xScale(selected.n));
  marker.setAttribute("cy", yScale(selected.probability));
  readout.setValue(formatProbability(selected.probability));
  readout.setSubtitle(`n=${selected.n}`);
}

function formatProbability(probability) {
  return `${(probability * 100).toFixed(1)}%`;
}

// Shared axes currently render only the vertical label, so this local helper
// adds the missing x-axis label without extending the shared primitive API.
function drawXAxisLabel(svgNode, { plot, label }) {
  const x = plot.x + plot.width / 2;
  const y = plot.y + plot.height + 56;
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
