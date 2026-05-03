export function buildExperimentSeries({ min, max, successProbability, seed }) {
  const random = createSeededRandom(seed);
  const points = [];
  let successes = 0;

  for (let run = 1; run <= max; run += 1) {
    if (random() < successProbability) successes += 1;
    if (run >= min) {
      points.push(buildRunPoint({ run, successes }));
    }
  }

  return points;
}

export function buildRunPoint({ run, successes }) {
  return {
    run,
    successes,
    probability: successes / run,
  };
}

export function selectRun(series, run) {
  return series.find((point) => point.run === run) ?? series[series.length - 1];
}

export function visibleRunWindow({ selectedRun, min, max, visibleTickCount }) {
  const initialEnd = Math.min(max, min + visibleTickCount - 1);
  const end = Math.min(max, Math.max(initialEnd, selectedRun));
  const start = Math.max(min, end - visibleTickCount + 1);
  return { start, end };
}

export function filterSeriesWindow(series, window, selectedRun = window.end) {
  return series.filter((point) => (
    point.run >= window.start &&
    point.run <= window.end &&
    point.run <= selectedRun
  ));
}

export function buildVisibleRunTicks(window) {
  const tickValues = [];
  for (let run = window.start; run <= window.end; run += 1) {
    tickValues.push(run);
  }
  return tickValues;
}

function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
