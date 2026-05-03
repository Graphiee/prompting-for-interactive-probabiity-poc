export function sharedBirthdayProbability(n, daysInYear) {
  if (n <= 1) return 0;
  if (n > daysInYear) return 1;

  let allDifferentProbability = 1;
  for (let personIndex = 0; personIndex < n; personIndex += 1) {
    allDifferentProbability *= (daysInYear - personIndex) / daysInYear;
  }

  return 1 - allDifferentProbability;
}

export function buildBirthdaySeries({ min, max, daysInYear }) {
  const points = [];
  for (let n = min; n <= max; n += 1) {
    points.push({
      n,
      probability: sharedBirthdayProbability(n, daysInYear),
    });
  }
  return points;
}

export function buildSelectedBirthday({ n, daysInYear }) {
  return {
    n,
    probability: sharedBirthdayProbability(n, daysInYear),
  };
}
