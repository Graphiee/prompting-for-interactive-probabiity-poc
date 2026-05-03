import { el } from "./dom.js";

export function createPlayPauseButton({
  playing = false,
  label = "Play or pause",
  onClick,
} = {}) {
  const playIcon = el("span", { className: "viz-play-icon", "aria-hidden": "true" });
  const pauseIcon = el("span", { className: "viz-pause-icon", "aria-hidden": "true" }, [
    el("span"),
    el("span"),
  ]);
  const button = el("button", {
    className: "viz-play-pause-button",
    type: "button",
    "aria-label": label,
  }, [playIcon, pauseIcon]);

  function setPlaying(nextPlaying) {
    button.classList.toggle("is-playing", nextPlaying);
    button.setAttribute("aria-pressed", String(nextPlaying));
  }

  button.addEventListener("click", () => onClick?.());
  setPlaying(playing);

  return { node: button, setPlaying };
}
