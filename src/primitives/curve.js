import { svgEl } from "./dom.js";

function pathFromPoints(points) {
  return points.map((p, index) => `${index === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
}

export function drawAreaUnderCurve(svg, { points, baselineY }) {
  const first = points[0];
  const last = points[points.length - 1];
  const d = [`M${first.x},${baselineY}`, pathFromPoints(points), `L${last.x},${baselineY}`, "Z"].join(" ");
  const area = svgEl("path", { className: "viz-area-fill", d });
  svg.append(area);
  return area;
}

export function drawCurve(svg, { points }) {
  const path = svgEl("path", { className: "viz-curve", d: pathFromPoints(points) });
  svg.append(path);
  return path;
}
