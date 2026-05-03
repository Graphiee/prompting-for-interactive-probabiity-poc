import { el, svgEl } from "./dom.js";

export function createVizShell({ width = 860 } = {}) {
  const shell = el("main", { className: "viz-shell", style: `max-width:${width}px` });
  return shell;
}

export function createSvg({ width, height, className = "viz-svg", ariaLabel }) {
  return svgEl("svg", {
    className,
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": ariaLabel,
  });
}
