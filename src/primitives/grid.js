import { svgEl } from "./dom.js";

export function drawGrid(svg, { plot, xScale, yScale, xTicks, yTicks }) {
  const group = svgEl("g", { className: "viz-grid" });

  xTicks.forEach((tick) => {
    const x = xScale(tick);
    group.append(svgEl("line", {
      className: "viz-grid-line",
      x1: x,
      x2: x,
      y1: plot.y,
      y2: plot.y + plot.height,
    }));
  });

  yTicks.forEach((tick) => {
    const y = yScale(tick);
    group.append(svgEl("line", {
      className: "viz-grid-line",
      x1: plot.x,
      x2: plot.x + plot.width,
      y1: y,
      y2: y,
    }));
  });

  svg.append(group);
  return group;
}
