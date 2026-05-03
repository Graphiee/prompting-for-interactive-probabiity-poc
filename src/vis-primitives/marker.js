import { svgEl } from "./dom.js";

export function drawMarker(svg, { x, y, radius = 12 }) {
  const marker = svgEl("circle", { className: "viz-marker", cx: x, cy: y, r: radius });
  svg.append(marker);
  return marker;
}

export function drawReferenceLines(svg, { x, y, plot }) {
  const group = svgEl("g", { className: "viz-reference-lines" });
  group.append(svgEl("line", {
    className: "viz-reference-line",
    x1: plot.x,
    x2: x,
    y1: y,
    y2: y,
  }));
  group.append(svgEl("line", {
    className: "viz-reference-line",
    x1: x,
    x2: x,
    y1: plot.y,
    y2: plot.y + plot.height,
  }));
  svg.append(group);
  return group;
}

export function drawHorizontalReference(svg, { y, plot }) {
  const line = svgEl("line", {
    className: "viz-reference-line-muted",
    x1: plot.x,
    x2: plot.x + plot.width,
    y1: y,
    y2: y,
  });
  svg.append(line);
  return line;
}
