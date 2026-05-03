export function buildChildProfiles({ genders, seasons }) {
  return genders.flatMap((gender) => seasons.map((season) => ({
    key: `${gender.key}-${season.key}`,
    label: `${gender.key}/${season.key}`,
    gender: gender.key,
    genderLabel: gender.label,
    season: season.key,
    seasonLabel: season.label,
    isGirl: gender.key === "G",
    isWinter: season.key === "W",
    isGirlWinter: gender.key === "G" && season.key === "W",
  })));
}

export function buildFamilyOutcomes(profiles) {
  return profiles.flatMap((first) => profiles.map((second) => {
    const condition = first.isGirlWinter || second.isGirlWinter;
    const bothGirls = first.isGirl && second.isGirl;

    return {
      key: `${first.key}__${second.key}`,
      first,
      second,
      condition,
      bothGirls,
      numerator: condition && bothGirls,
    };
  }));
}

export function summarizeOutcomes(outcomes) {
  return {
    total: outcomes.length,
    conditionCount: outcomes.filter((outcome) => outcome.condition).length,
    numeratorCount: outcomes.filter((outcome) => outcome.numerator).length,
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

  const rawNumber = parseFormula(raw);
  const expectedNumber = parseFormula(expected);
  if (rawNumber === null || expectedNumber === null) return false;

  return Math.abs(rawNumber - expectedNumber) < 0.0005;
}

export function normalizeFormula(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace("÷", "/");
}

function parseFormula(value) {
  if (!value) return null;

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
