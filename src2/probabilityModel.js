const TAU = Math.PI * 2;

export function formatProbability(value) {
  return value.toFixed(3);
}

export function circleRadiusFromProbability(probability, universeArea) {
  return Math.sqrt((probability * universeArea) / Math.PI);
}

export function circleArea(radius) {
  return Math.PI * radius * radius;
}

export function distanceBetween(first, second) {
  return Math.hypot(first.cx - second.cx, first.cy - second.cy);
}

export function circleIntersectionArea(radiusA, radiusB, distance) {
  if (distance >= radiusA + radiusB) {
    return 0;
  }

  if (distance <= Math.abs(radiusA - radiusB)) {
    return circleArea(Math.min(radiusA, radiusB));
  }

  if (distance === 0) {
    return circleArea(Math.min(radiusA, radiusB));
  }

  const radiusASquared = radiusA * radiusA;
  const radiusBSquared = radiusB * radiusB;
  const firstAngle = 2 * Math.acos((distance * distance + radiusASquared - radiusBSquared) / (2 * distance * radiusA));
  const secondAngle = 2 * Math.acos((distance * distance + radiusBSquared - radiusASquared) / (2 * distance * radiusB));

  return 0.5 * radiusASquared * (firstAngle - Math.sin(firstAngle)) +
    0.5 * radiusBSquared * (secondAngle - Math.sin(secondAngle));
}

export function clampCircleToBounds(circle, radius, bounds) {
  return {
    cx: clamp(circle.cx, bounds.x + radius, bounds.x + bounds.width - radius),
    cy: clamp(circle.cy, bounds.y + radius, bounds.y + bounds.height - radius),
  };
}

export function buildProbabilityModel(state, config) {
  const universeArea = config.workArea.width * config.workArea.height;
  const radiusA = circleRadiusFromProbability(state.probabilities.a, universeArea);
  const radiusB = circleRadiusFromProbability(state.probabilities.b, universeArea);
  const circleA = clampCircleToBounds(state.circles.a, radiusA, config.workArea);
  const circleB = clampCircleToBounds(state.circles.b, radiusB, config.workArea);
  const distance = distanceBetween(circleA, circleB);
  const intersection = circleIntersectionArea(radiusA, radiusB, distance) / universeArea;
  const union = state.probabilities.a + state.probabilities.b - intersection;
  const overlapShare = union > 0 ? intersection / union : 0;

  return {
    circles: {
      a: { ...circleA, radius: radiusA },
      b: { ...circleB, radius: radiusB },
    },
    probabilities: {
      a: state.probabilities.a,
      b: state.probabilities.b,
      intersection,
      union,
      overlapShare,
    },
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
