export function betaFunctionForIntegers(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0) {
    throw new Error("betaFunctionForIntegers requires positive integer parameters");
  }

  return (factorial(a - 1) * factorial(b - 1)) / factorial(a + b - 1);
}

export function betaDensity(x, a, b) {
  if (x < 0 || x > 1) return 0;
  return (x ** (a - 1) * (1 - x) ** (b - 1)) / betaFunctionForIntegers(a, b);
}

export function reflectedDensity(y, a, b) {
  return betaDensity(1 - y, a, b);
}

export function densityPoints(a, b, count = 41) {
  return Array.from({ length: count }, (_, index) => {
    const x = index / (count - 1);
    return { x, y: betaDensity(x, a, b) };
  });
}

export function betaLabel(a, b) {
  return `Beta(${a}, ${b})`;
}

export function transformedBetaLabel(a, b) {
  return betaLabel(b, a);
}

export function posteriorForSuccessProbability({ a, b, successes, failures }) {
  return {
    first: a + successes,
    second: b + failures,
    label: betaLabel(a + successes, b + failures),
  };
}

export function posteriorForFailureProbability({ a, b, successes, failures }) {
  return {
    first: b + failures,
    second: a + successes,
    label: betaLabel(b + failures, a + successes),
  };
}

export function progressForStep(index, total) {
  if (total <= 1) return 1;
  return (index + 1) / total;
}

export function validateResponse(step, rawValue) {
  if (step.userAction.kind === "formula") {
    return step.systemResponse.correct.some((answer) => (
      normalizeFormula(rawValue) === normalizeFormula(answer)
    ));
  }

  return step.systemResponse.correct.includes(rawValue);
}

export function normalizeFormula(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replaceAll("β", "beta")
    .replace(/^beta\(([^,]+),([^,]+)\)$/, "beta($1,$2)");
}

function factorial(n) {
  let product = 1;
  for (let value = 2; value <= n; value += 1) product *= value;
  return product;
}
