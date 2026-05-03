import {
  clear,
  createChoiceGrid,
  createEquationRow,
  createFactGrid,
  createLabActionBar,
  createLabButton,
  createLabPage,
  createLabPanel,
  createProgressList,
  createSplit,
  createTokenList,
  el,
} from "../lab-primitives/index.js";
import {
  complexitySummary,
  containsDuplicate,
  duplicateTrace,
  firstDuplicate,
  progressForStep,
  seenBeforeIndex,
  validateResponse,
} from "./model.js";
import { spec } from "./spec.js";

const state = {
  stepIndex: 0,
  responses: {},
  feedback: {},
  hints: {},
};

const app = document.querySelector("#app");

render();

function render() {
  const step = getCurrentStep();

  clear(app);
  app.append(createLabPage({
    title: spec.title,
    question: spec.exerciseText,
    badges: [
      { label: "Interactive algorithm lab" },
      { label: step.type, tone: "plain" },
    ],
    assumptions: [
      `Objective: ${spec.objective}`,
      ...spec.assumptions,
    ],
    children: [
      createSplit({
        ratio: "wide-left",
        left: createVisualizationPanel(step),
        right: createStepPanel(step),
      }),
    ],
  }));
}

function getCurrentStep() {
  return spec.steps[state.stepIndex];
}

function createVisualizationPanel(step) {
  return createLabPanel({
    title: "Visualization Workspace",
    subtitle: "The diagram shows the current scan state. Instructions, answers, hints, and feedback stay in the lab panel.",
    children: [
      createVisualization(step),
    ],
  });
}

function createStepPanel(step) {
  const feedback = state.feedback[step.id];
  const answeredCorrectly = feedback?.status === "correct";

  return el("div", { className: "lab-step-panel-stack" }, [
    createProgressList({
      title: "Lab Progress",
      current: state.stepIndex,
      items: spec.steps.map((item) => ({ label: item.goal })),
    }),
    createLabPanel({
      title: `Step ${state.stepIndex + 1} of ${spec.steps.length}`,
      subtitle: step.goal,
      className: "lab-step-panel",
      children: [
        el("p", { className: "lab-step-prompt", text: step.prompt }),
        createUserInput(step),
        state.hints[step.id] ? createHint(step) : null,
        feedback ? createFeedback(step, feedback) : null,
        createLabActionBar({
          align: "between",
          secondary: [
            {
              label: "Back",
              variant: "ghost",
              disabled: state.stepIndex === 0,
              onClick: () => moveStep(-1),
            },
            {
              label: state.hints[step.id] ? "Hide hint" : "Hint",
              variant: "secondary",
              onClick: () => toggleHint(step),
            },
          ],
          primary: createPrimaryActions(step, answeredCorrectly),
        }),
      ],
      footer: createStepFooter(),
    }),
  ]);
}

function createPrimaryActions(step, answeredCorrectly) {
  const canMoveNext = state.stepIndex < spec.steps.length - 1;

  return el("div", { className: "lab-action-group" }, [
    createLabButton({
      label: "Check",
      variant: "primary",
      disabled: !hasResponse(step),
      onClick: () => checkStep(step),
    }),
    createLabButton({
      label: canMoveNext ? "Next" : "Finish",
      variant: "secondary",
      disabled: !answeredCorrectly,
      onClick: () => {
        if (canMoveNext) moveStep(1);
      },
    }),
  ]);
}

function createStepFooter() {
  return createEquationRow({
    label: "Progress",
    expression: `${state.stepIndex + 1}/${spec.steps.length}`,
    result: `${Math.round(progressForStep(state.stepIndex, spec.steps.length) * 100)}%`,
  });
}

function createUserInput(step) {
  const value = state.responses[step.id] ?? "";

  if (step.userAction.kind === "choice") {
    const choiceGrid = createChoiceGrid({
      name: step.id,
      selected: value,
      columns: step.userAction.options.length > 3 ? "two" : "one",
      choices: step.userAction.options,
      onChange: (nextValue) => {
        state.responses[step.id] = nextValue;
        checkStep(step);
      },
    });

    return choiceGrid.node;
  }

  return el("label", { className: "lab-answer-field" }, [
    el("span", { className: "lab-answer-label", text: "Condition" }),
    el("input", {
      className: "lab-answer-input",
      type: "text",
      inputmode: "text",
      value,
      placeholder: step.userAction.placeholder,
      autocomplete: "off",
      onInput: (event) => {
        state.responses[step.id] = event.target.value;
        state.feedback[step.id] = null;
        render();
      },
      onKeyDown: (event) => {
        if (event.key === "Enter" && hasResponse(step)) checkStep(step);
      },
    }),
  ]);
}

function createHint(step) {
  return el("section", { className: "lab-hint", "aria-label": "Hint" }, [
    el("h3", { className: "lab-hint-title", text: "Hint" }),
    el("p", { className: "lab-copy", text: step.hint }),
  ]);
}

function createFeedback(step, feedback) {
  return el("section", {
    className: ["lab-feedback", `lab-feedback-${feedback.status}`].join(" "),
    "aria-live": "polite",
  }, [
    el("h3", {
      className: "lab-feedback-title",
      text: feedback.status === "correct" ? "Correct" : "Try again",
    }),
    el("p", { className: "lab-copy", text: feedback.message }),
    feedback.status === "correct"
      ? el("p", { className: "lab-feedback-explanation", text: step.explanation })
      : null,
  ]);
}

function hasResponse(step) {
  const value = state.responses[step.id];
  return String(value ?? "").trim().length > 0;
}

function checkStep(step) {
  const correct = validateResponse(step, state.responses[step.id]);
  state.feedback[step.id] = {
    status: correct ? "correct" : "incorrect",
    message: correct
      ? step.systemResponse.feedback.correct
      : step.systemResponse.feedback.incorrect,
  };
  render();
}

function toggleHint(step) {
  state.hints[step.id] = !state.hints[step.id];
  render();
}

function moveStep(delta) {
  state.stepIndex = Math.min(spec.steps.length - 1, Math.max(0, state.stepIndex + delta));
  render();
}

function createVisualization(step) {
  if (step.visual.mode === "code") return createCodeView(step);
  if (step.visual.mode === "summary") return createSummaryView(step);

  return el("div", { className: "p12-viz" }, [
    createExampleReadouts(step),
    createArrayScan(step),
    createSeenPanel(step),
    step.visual.mode === "trace" ? createTraceTable(step) : null,
    el("p", { className: "p12-viz-caption", text: step.visual.caption }),
  ]);
}

function createExampleReadouts(step) {
  const nums = getSampleNums(step);
  const duplicate = firstDuplicate(nums);
  const summary = complexitySummary(nums);

  return createFactGrid({
    columns: "three",
    className: "p12-viz-readouts",
    items: [
      { label: "Input", value: `[${nums.join(", ")}]`, note: "Current sample." },
      { label: "Result", value: String(containsDuplicate(nums)), note: duplicate ? `${duplicate.value} repeats.` : "All values unique." },
      { label: "Checks", value: String(summary.checks), note: "Early exit when possible." },
    ],
  });
}

function createArrayScan(step) {
  const nums = getSampleNums(step);
  const duplicate = firstDuplicate(nums);

  return el("div", { className: "p12-array", role: "img", "aria-label": "Array scan state" }, nums.map((value, index) => {
    const active = index === step.visual.activeIndex;
    const priorRepeat = duplicate && value === duplicate.value && index < duplicate.index;
    const repeatedHere = duplicate && index === duplicate.index;

    return el("div", {
      className: [
        "p12-array-cell",
        active ? "is-active" : "",
        priorRepeat ? "is-prior-repeat" : "",
        repeatedHere ? "is-duplicate" : "",
      ].filter(Boolean).join(" "),
    }, [
      el("span", { className: "p12-array-index", text: String(index) }),
      el("span", { className: "p12-array-value", text: String(value) }),
    ]);
  }));
}

function createSeenPanel(step) {
  const nums = getSampleNums(step);
  const seen = seenBeforeIndex(nums, Math.min(step.visual.seenCount, nums.length));

  return createLabPanel({
    title: "Seen Set",
    subtitle: "Values from earlier positions only.",
    tone: "soft",
    children: [
      seen.length
        ? createTokenList({ items: seen.map((value) => ({ label: String(value), tone: "blue" })) })
        : el("p", { className: "lab-copy", text: "Empty before the scan begins." }),
    ],
  });
}

function createTraceTable(step) {
  const nums = getSampleNums(step);
  const rows = duplicateTrace(nums);

  return el("div", { className: "p12-trace", role: "table", "aria-label": "Duplicate scan trace" }, [
    createTraceRow(["i", "num", "seen before", "action"], true),
    ...rows.map((row) => createTraceRow([
      String(row.index),
      String(row.value),
      row.seenBefore.length ? `{${row.seenBefore.join(", ")}}` : "{}",
      row.action,
    ], false, row.duplicate)),
  ]);
}

function createTraceRow(cells, header = false, duplicate = false) {
  return el("div", {
    className: ["p12-trace-row", header ? "is-header" : "", duplicate ? "is-duplicate" : ""]
      .filter(Boolean)
      .join(" "),
    role: "row",
  }, cells.map((cell) => (
    el(header ? "strong" : "span", { className: "p12-trace-cell", role: "cell", text: cell })
  )));
}

function createCodeView(step) {
  return el("div", { className: "p12-viz" }, [
    createExampleReadouts(step),
    el("pre", { className: "p12-code", "aria-label": "JavaScript contains duplicate implementation" }, [
      el("code", { text: [
        "function containsDuplicate(nums) {",
        "  const seen = new Set();",
        "",
        "  for (const num of nums) {",
        "    if (seen.has(num)) return true;",
        "    seen.add(num);",
        "  }",
        "",
        "  return false;",
        "}",
      ].join("\n") }),
    ]),
    createEquationRow({
      label: "Invariant",
      expression: "seen contains values at indices < i",
      result: "check first",
    }),
    el("p", { className: "p12-viz-caption", text: step.visual.caption }),
  ]);
}

function createSummaryView(step) {
  const nums = getSampleNums(step);
  const summary = complexitySummary(nums);

  return el("div", { className: "p12-viz" }, [
    createArrayScan(step),
    createFactGrid({
      columns: "three",
      items: [
        { label: "Decision", value: summary.result ? "true" : "false", note: "Duplicate exists?" },
        { label: "Worst time", value: summary.worstTime, note: "Each value checked once." },
        { label: "Worst space", value: summary.worstSpace, note: "Set may hold every value." },
      ],
    }),
    createEquationRow({
      label: "Framework",
      expression: "for each num: if seen.has(num) return true; seen.add(num)",
      result: "return false",
    }),
    el("p", { className: "p12-viz-caption", text: step.visual.caption }),
  ]);
}

function getSampleNums(step) {
  return spec.demo[step.visual.sample] ?? spec.demo.duplicateArray;
}
