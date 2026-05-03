export function bernoulliProbability({ p, k }) {
  return p ** k * (1 - p) ** (1 - k);
}

export function buildBernoulliSeries({ min, max, p }) {
  const points = [];
  for (let k = min; k <= max; k += 1) {
    points.push({
      k,
      probability: bernoulliProbability({ p, k }),
    });
  }
  return points;
}

export function selectBernoulliPoint({ p, k }) {
  return {
    k,
    probability: bernoulliProbability({ p, k }),
  };
}

export function formatProbability(probability) {
  if (!Number.isFinite(probability)) return "∞";
  return probability.toFixed(4);
}
