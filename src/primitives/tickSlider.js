import { el } from "./dom.js";

export function createTickSlider({ min, max, step = 1, value, label = "n", onInput }) {
  const wrapper = el("div", { className: "viz-tick-slider" });
  const track = el("div", { className: "viz-tick-track" });
  const activeTrack = el("div", { className: "viz-tick-track-active" });
  const input = el("input", {
    className: "viz-slider-hit-area",
    type: "range",
    min,
    max,
    step,
    value,
    "aria-label": label,
  });
  const thumb = el("div", { className: "viz-slider-thumb" });

  track.append(activeTrack);

  function update(nextValue = Number(input.value)) {
    const pct = ((nextValue - min) / (max - min)) * 100;
    thumb.style.left = `${pct}%`;
    activeTrack.style.width = `${pct}%`;
  }

  input.addEventListener("input", () => {
    const nextValue = Number(input.value);
    update(nextValue);
    onInput?.(nextValue);
  });

  wrapper.append(track, input, thumb);
  update(value);
  return { node: wrapper, input, update };
}
