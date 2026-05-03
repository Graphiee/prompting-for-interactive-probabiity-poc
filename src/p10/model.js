export function factorial(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("factorial requires a nonnegative integer");
  }

  let product = 1;
  for (let value = 2; value <= n; value += 1) product *= value;
  return product;
}

export function derangementCount(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("derangementCount requires a nonnegative integer");
  }

  if (n === 0) return 1;
  if (n === 1) return 0;

  let previous = 1;
  let current = 0;

  for (let size = 2; size <= n; size += 1) {
    const next = (size - 1) * (previous + current);
    previous = current;
    current = next;
  }

  return current;
}

export function winningCount(n) {
  return factorial(n) - derangementCount(n);
}

export function losingProbability(n) {
  return derangementCount(n) / factorial(n);
}

export function winningProbability(n) {
  return 1 - losingProbability(n);
}

export function inclusionExclusionTerms(n) {
  return Array.from({ length: n + 1 }, (_, k) => ({
    k,
    sign: k % 2 === 0 ? 1 : -1,
    expression: `${k % 2 === 0 ? "+" : "-"} 1/${k}!`,
    value: (k % 2 === 0 ? 1 : -1) / factorial(k),
  }));
}

export function buildDemoPermutations(n, limit = 10) {
  const all = [];

  function visit(prefix, remaining) {
    if (all.length >= limit) return;
    if (remaining.length === 0) {
      all.push(prefix);
      return;
    }

    remaining.forEach((card, index) => {
      visit(
        [...prefix, card],
        [...remaining.slice(0, index), ...remaining.slice(index + 1)],
      );
    });
  }

  visit([], Array.from({ length: n }, (_, index) => index + 1));
  return all;
}

export function fixedPoints(permutation) {
  return permutation
    .map((card, index) => (card === index + 1 ? index + 1 : null))
    .filter((value) => value !== null);
}

export function isDerangement(permutation) {
  return fixedPoints(permutation).length === 0;
}

export function demoSummary(n) {
  const total = factorial(n);
  const losing = derangementCount(n);
  return {
    n,
    total,
    losing,
    winning: total - losing,
    losingProbability: losing / total,
    winningProbability: (total - losing) / total,
  };
}

export function progressForStep(index, total) {
  if (total <= 1) return 1;
  return (index + 1) / total;
}

export function validateResponse(step, rawValue) {
  const answers = step.systemResponse.correct;

  if (step.userAction.kind === "numeric") {
    const value = Number(String(rawValue ?? "").trim());
    return answers.some((answer) => value === Number(answer));
  }

  if (step.userAction.kind === "formula") {
    return answers.some((answer) => equivalentFormula(rawValue, answer));
  }

  return answers.includes(rawValue);
}

export function equivalentFormula(rawValue, answer) {
  const raw = normalizeFormula(rawValue);
  const expected = normalizeFormula(answer);

  if (raw === expected) return true;

  const rawNumber = parseNumericExpression(raw);
  const expectedNumber = parseNumericExpression(expected);
  if (rawNumber === null || expectedNumber === null) return false;

  return Math.abs(rawNumber - expectedNumber) < 0.0005;
}

export function normalizeFormula(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replaceAll("!", "!")
    .replace("derangements", "!n")
    .replace("dn", "!n");
}

function parseNumericExpression(value) {
  if (!value) return null;
  if (value.includes("!n") || value.includes("n!")) return null;

  if (value.includes("/")) {
    const [numerator, denominator, extra] = value.split("/");
    if (extra !== undefined) return null;
    const top = Number(numerator);
    const bottom = Number(denominator);
    if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom === 0) return null;
    return top / bottom;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
