import { svgEl } from "./dom.js";

export function drawAxes(svg, { plot, xScale, yScale, xTicks, yTicks, xLabel, yLabel }) {
  const group = svgEl("g", { className: "viz-axes" });

  group.append(svgEl("line", {
    className: "viz-axis-line",
    x1: plot.x,
    x2: plot.x + plot.width,
    y1: plot.y + plot.height,
    y2: plot.y + plot.height,
  }));

  group.append(svgEl("line", {
    className: "viz-axis-line",
    x1: plot.x,
    x2: plot.x,
    y1: plot.y,
    y2: plot.y + plot.height,
  }));

  xTicks.forEach((tick) => {
    const x = xScale(tick);
    group.append(svgEl("line", {
      className: "viz-tick-line",
      x1: x,
      x2: x,
      y1: plot.y + plot.height,
      y2: plot.y + plot.height + 9,
    }));
    group.append(svgEl("text", {
      className: "viz-tick-label",
      x,
      y: plot.y + plot.height + 26,
      "text-anchor": "middle",
      text: String(tick),
    }));
  });

  yTicks.forEach((tick) => {
    const y = yScale(tick);
    group.append(svgEl("line", {
      className: "viz-tick-line",
      x1: plot.x - 9,
      x2: plot.x,
      y1: y,
      y2: y,
    }));
    group.append(svgEl("text", {
      className: "viz-tick-label",
      x: plot.x - 18,
      y: y + 4,
      "text-anchor": "end",
      text: tick === 0 ? "0" : Number(tick).toFixed(1),
    }));
  });

  if (yLabel) {
    const cx = plot.x - 42;
    const cy = plot.y + plot.height / 2;
    group.append(svgEl("rect", {
      className: "viz-axis-label-box",
      x: cx - 12,
      y: cy - 54,
      width: 24,
      height: 108,
    }));
    group.append(svgEl("text", {
      className: "viz-axis-label",
      x: cx + 4,
      y: cy,
      transform: `rotate(-90 ${cx} ${cy})`,
      "text-anchor": "middle",
      text: yLabel,
    }));
  }

  svg.append(group);
  return group;
}
