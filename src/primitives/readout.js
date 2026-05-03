import { el } from "./dom.js";

export function createReadout({ kicker, value, subtitle }) {
  const node = el("div", { className: "viz-readout" });
  const kickerEl = el("span", { className: "viz-readout-kicker", text: kicker });
  const valueEl = el("span", { className: "viz-readout-value", text: value });
  const subtitleEl = el("span", { className: "viz-readout-subtitle", text: subtitle });
  node.append(kickerEl, valueEl, subtitleEl);
  return {
    node,
    setValue: (next) => { valueEl.textContent = next; },
    setSubtitle: (next) => { subtitleEl.textContent = next; },
  };
}
