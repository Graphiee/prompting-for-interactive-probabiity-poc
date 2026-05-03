import { formatProbability } from "./probabilityModel.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export function createVenn(root, config) {
  const svg = createSvgElement("svg", {
    class: "venn-svg",
    viewBox: `0 0 ${config.svg.width} ${config.svg.height}`,
    role: "img",
    "aria-label": "Venn diagram showing probabilities A, B, their intersection, and union",
  });

  const grid = createSvgElement("g", { class: "grid-layer" });
  const workArea = createSvgElement("rect", { class: "work-area" });
  const circleB = createSvgElement("circle", { class: "circle-b", "data-circle": "b", tabindex: "0" });
  const circleA = createSvgElement("circle", { class: "circle-a", "data-circle": "a", tabindex: "0" });
  const labelB = createSvgElement("text", { class: "circle-label circle-label-b" });
  const labelA = createSvgElement("text", { class: "circle-label circle-label-a" });
  const sampleLabel = createSvgElement("text", { class: "sample-label", x: 17, y: 25 });
  const sampleSpace = createSvgElement("rect", { class: "sample-space" });

  sampleLabel.textContent = "Sample Space";
  labelA.textContent = "A";
  labelB.textContent = "B";

  svg.append(sampleSpace, grid, sampleLabel, workArea, circleB, circleA, labelB, labelA);
  root.replaceChildren(svg);

  return {
    svg,
    workArea,
    circleA,
    circleB,
    labelA,
    labelB,
    sampleSpace,
    grid,
  };
}

export function renderStaticVenn(elements, config) {
  setAttributes(elements.sampleSpace, {
    x: config.sampleSpace.x,
    y: config.sampleSpace.y,
    width: config.sampleSpace.width,
    height: config.sampleSpace.height,
    rx: config.sampleSpace.cornerRadius,
  });

  setAttributes(elements.workArea, {
    x: config.workArea.x,
    y: config.workArea.y,
    width: config.workArea.width,
    height: config.workArea.height,
    rx: config.workArea.cornerRadius,
  });

  elements.grid.replaceChildren(...buildGridLines(config));
}

export function renderVenn(elements, model) {
  setCircleGeometry(elements.circleA, model.circles.a);
  setCircleGeometry(elements.circleB, model.circles.b);
  setLabelGeometry(elements.labelA, model.circles.a);
  setLabelGeometry(elements.labelB, model.circles.b);
}

export function renderReadout(elements, model) {
  const values = {
    a: formatProbability(model.probabilities.a),
    b: formatProbability(model.probabilities.b),
    intersection: formatProbability(model.probabilities.intersection),
    union: formatProbability(model.probabilities.union),
  };

  elements.probAOutput.value = values.a;
  elements.probBOutput.value = values.b;
  elements.metricA.textContent = values.a;
  elements.metricB.textContent = values.b;
  elements.metricIntersection.textContent = values.intersection;
  elements.metricUnion.textContent = values.union;
  elements.formulaA.textContent = values.a;
  elements.formulaB.textContent = values.b;
  elements.formulaIntersection.textContent = values.intersection;
  elements.formulaUnion.textContent = values.union;
  elements.insight.textContent = buildInsight(model.probabilities.overlapShare);
}

function buildGridLines(config) {
  const lines = [];
  const { width, height, gridSize } = config.sampleSpace;

  for (let x = gridSize; x < width; x += gridSize) {
    lines.push(createSvgElement("line", { class: "sample-grid", x1: x, y1: 0, x2: x, y2: height }));
  }

  for (let y = gridSize; y < height; y += gridSize) {
    lines.push(createSvgElement("line", { class: "sample-grid", x1: 0, y1: y, x2: width, y2: y }));
  }

  return lines;
}

function buildInsight(overlapShare) {
  if (overlapShare <= 0) {
    return "No overlap detected. The union is simply P(A) + P(B), because no shared region is double-counted.";
  }

  const percent = Math.round(overlapShare * 100);
  return `Overlap detected: roughly ${percent}% of the union is in the intersection. Adding P(A) + P(B) double-counts that shared region, so subtracting P(A ∩ B) fixes it.`;
}

function setCircleGeometry(element, circle) {
  setAttributes(element, {
    cx: circle.cx,
    cy: circle.cy,
    r: circle.radius,
  });
}

function setLabelGeometry(element, circle) {
  setAttributes(element, {
    x: circle.cx,
    y: circle.cy + 2,
  });
}

function createSvgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  setAttributes(element, attributes);
  return element;
}

function setAttributes(element, attributes) {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}
