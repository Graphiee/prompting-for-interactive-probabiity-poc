export function buildProfiles({ genders, seasons }) {
  return genders.flatMap((gender) => seasons.map((season) => ({
    key: `${gender.key}${season.key}`,
    gender: gender.key,
    genderLabel: gender.label,
    season: season.key,
    seasonLabel: season.label,
    label: `${gender.key}/${season.key}`,
    isGirl: gender.key === "G",
    isWinter: season.key === "W",
    isGirlWinter: gender.key === "G" && season.key === "W",
  })));
}

export function buildSampleSpace(profiles) {
  return profiles.flatMap((first) => profiles.map((second) => {
    const condition = first.isGirlWinter || second.isGirlWinter;
    const bothGirls = first.isGirl && second.isGirl;
    return {
      key: `${first.key}-${second.key}`,
      first,
      second,
      condition,
      bothGirls,
      numerator: condition && bothGirls,
    };
  }));
}

export function summarizeSampleSpace(cells) {
  return {
    total: cells.length,
    conditionCount: cells.filter((cell) => cell.condition).length,
    numeratorCount: cells.filter((cell) => cell.numerator).length,
  };
}

export function normalizeFormula(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace("÷", "/");
}

export function isCorrectResponse(step, rawValue) {
  const correctValues = step.systemResponse.correct;

  if (step.userAction.kind === "numeric") {
    const numericValue = Number(rawValue);
    return correctValues.some((answer) => numericValue === Number(answer));
  }

  if (step.userAction.kind === "formula") {
    const normalized = normalizeFormula(rawValue);
    return correctValues.some((answer) => normalized === normalizeFormula(answer));
  }

  return correctValues.includes(rawValue);
}

export function progressForStep(index, total) {
  if (total <= 1) return 1;
  return (index + 1) / total;
}
