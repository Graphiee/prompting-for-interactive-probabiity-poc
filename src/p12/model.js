export function containsDuplicate(nums) {
  const seen = new Set();

  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }

  return false;
}

export function duplicateTrace(nums) {
  const seen = new Set();
  const rows = [];

  for (let index = 0; index < nums.length; index += 1) {
    const value = nums[index];
    const duplicate = seen.has(value);
    rows.push({
      index,
      value,
      seenBefore: Array.from(seen),
      duplicate,
      action: duplicate ? "return true" : `add ${value}`,
    });

    if (duplicate) break;
    seen.add(value);
  }

  return rows;
}

export function seenBeforeIndex(nums, index) {
  return Array.from(new Set(nums.slice(0, Math.max(0, index))));
}

export function firstDuplicate(nums) {
  const seen = new Set();

  for (let index = 0; index < nums.length; index += 1) {
    const value = nums[index];
    if (seen.has(value)) {
      return { value, index };
    }
    seen.add(value);
  }

  return null;
}

export function complexitySummary(nums) {
  const duplicate = firstDuplicate(nums);
  return {
    checks: duplicate ? duplicate.index + 1 : nums.length,
    worstTime: "O(n)",
    worstSpace: "O(n)",
    result: containsDuplicate(nums),
  };
}

export function progressForStep(index, total) {
  if (total <= 1) return 1;
  return (index + 1) / total;
}

export function validateResponse(step, rawValue) {
  const answers = step.systemResponse.correct;

  if (step.userAction.kind === "formula") {
    return answers.some((answer) => normalizeCondition(rawValue) === normalizeCondition(answer));
  }

  return answers.includes(rawValue);
}

export function normalizeCondition(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replaceAll(";", "")
    .replace(/^if\((.*)\)returntrue$/, "$1")
    .replace(/^return(.*)$/, "$1");
}
