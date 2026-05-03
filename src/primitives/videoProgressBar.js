import { el } from "./dom.js";
import { createPlayPauseButton } from "./playPauseButton.js";

export function createVideoProgressBar({
  duration = 100,
  currentTime = 0,
  playing = false,
  label = "Video progress",
  playLabel = "Play or pause video",
  onPlayPause,
  onSeek,
} = {}) {
  const playPauseButton = createPlayPauseButton({
    playing,
    label: playLabel,
    onClick: () => onPlayPause?.(),
  });
  const wrapper = el("div", { className: "viz-video-progress-control" });
  const progress = el("div", { className: "viz-video-progress" });
  const track = el("div", { className: "viz-video-progress-track" });
  const activeTrack = el("div", { className: "viz-video-progress-track-active" });
  const input = el("input", {
    className: "viz-video-progress-hit-area",
    type: "range",
    min: 0,
    max: duration,
    step: "any",
    value: currentTime,
    "aria-label": label,
  });
  const thumb = el("div", { className: "viz-video-progress-thumb" });

  track.append(activeTrack);
  progress.append(track, input, thumb);
  wrapper.append(playPauseButton.node, progress);

  function setProgress(nextCurrentTime = Number(input.value), nextDuration = Number(input.max)) {
    const safeDuration = Math.max(0, Number(nextDuration) || 0);
    const safeCurrentTime = Math.min(Math.max(0, Number(nextCurrentTime) || 0), safeDuration);
    const pct = safeDuration === 0 ? 0 : (safeCurrentTime / safeDuration) * 100;

    input.max = safeDuration;
    input.value = safeCurrentTime;
    activeTrack.style.width = `${pct}%`;
    thumb.style.left = `${pct}%`;
  }

  function setDuration(nextDuration) {
    setProgress(Number(input.value), nextDuration);
  }

  input.addEventListener("input", () => {
    const nextCurrentTime = Number(input.value);
    setProgress(nextCurrentTime, Number(input.max));
    onSeek?.(nextCurrentTime);
  });

  setProgress(currentTime, duration);

  return {
    node: wrapper,
    input,
    playPauseButton: playPauseButton.node,
    setDuration,
    setPlaying: playPauseButton.setPlaying,
    setProgress,
  };
}
