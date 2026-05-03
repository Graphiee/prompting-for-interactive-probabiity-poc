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
  el,
} from "../lab-primitives/index.js";
import {
  buildDemoPermutations,
  demoSummary,
  fixedPoints,
  inclusionExclusionTerms,
  isDerangement,
  progressForStep,
  validateResponse,
  winningProbability,
} from "./model.js";
import { spec } from "./spec.js";

const demo = demoSummary(spec.demoDeckSize);
const demoRows = buildCuratedDemoRows(spec.demoDeckSize);

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
      { label: "Interactive probability lab" },
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
    subtitle: "Small-deck examples support the counting argument; the final formula is general.",
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
    el("span", {
      className: "lab-answer-label",
      text: step.userAction.kind === "formula" ? "Formula" : "Answer",
    }),
    el("input", {
      className: "lab-answer-input",
      type: step.userAction.kind === "numeric" ? "number" : "text",
      inputmode: step.userAction.kind === "numeric" ? "numeric" : "text",
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
  if (step.visual.mode === "counts") return createCountsView(step);
  if (step.visual.mode === "formula") return createFormulaView(step);
  if (step.visual.mode === "limit") return createLimitView(step);

  return el("div", { className: "p10-viz" }, [
    createDemoReadouts(step.visual.mode),
    createPermutationTable(step.visual.mode),
    el("p", { className: "p10-viz-caption", text: step.visual.caption }),
  ]);
}

function createDemoReadouts(mode) {
  const showCounts = ["counts", "derangements"].includes(mode);
  return createFactGrid({
    columns: "three",
    className: "p10-viz-readouts",
    items: [
      { label: "Demo deck", value: `n = ${demo.n}`, note: "Small enough to inspect." },
      { label: "All orderings", value: showCounts ? String(demo.total) : "5!", note: "Every shuffle." },
      { label: "No-match orders", value: showCounts ? String(demo.losing) : "!5", note: "Losing event." },
    ],
  });
}

function createCountsView(step) {
  return el("div", { className: "p10-viz" }, [
    createFactGrid({
      columns: "three",
      items: [
        { label: "All", value: String(demo.total), note: "5! deck orders." },
        { label: "Lose", value: String(demo.losing), note: "No fixed points." },
        { label: "Win", value: String(demo.winning), note: "At least one fixed point." },
      ],
    }),
    createPermutationTable("derangements"),
    el("p", { className: "p10-viz-caption", text: step.visual.caption }),
  ]);
}

function createFormulaView(step) {
  const terms = inclusionExclusionTerms(5);

  return el("div", { className: "p10-viz" }, [
    createEquationRow({
      label: "Lose",
      expression: "!n/n! = sum_{k=0}^n (-1)^k/k!",
      result: "no match",
    }),
    createEquationRow({
      label: "Win",
      expression: "1 - !n/n! = sum_{k=1}^n (-1)^{k+1}/k!",
      result: "at least one",
    }),
    el("div", { className: "p10-viz-term-table" }, terms.map((term) => (
      el("div", { className: "p10-viz-term" }, [
        el("span", { className: "p10-viz-term-label", text: `k = ${term.k}` }),
        el("code", { className: "p10-viz-term-expression", text: term.expression.replace("0!", "0!") }),
      ])
    ))),
    el("p", { className: "p10-viz-caption", text: step.visual.caption }),
  ]);
}

function createLimitView(step) {
  const points = Array.from({ length: 9 }, (_, index) => {
    const n = index + 2;
    return { n, probability: winningProbability(n) };
  });
  const limit = 1 - 1 / Math.E;

  return el("div", { className: "p10-viz" }, [
    createFactGrid({
      columns: "two",
      items: [
        { label: "Limit", value: "1 - 1/e", note: limit.toFixed(4) },
        { label: "n = 10", value: winningProbability(10).toFixed(4), note: "Already very close." },
      ],
    }),
    el("div", { className: "p10-viz-bars" }, points.map((point) => (
      el("div", { className: "p10-viz-bar-row" }, [
        el("span", { className: "p10-viz-bar-label", text: `n=${point.n}` }),
        el("span", { className: "p10-viz-bar-track" }, [
          el("span", {
            className: "p10-viz-bar-fill",
            style: { "--p10-bar-value": `${point.probability * 100}%` },
          }),
        ]),
        el("span", { className: "p10-viz-bar-value", text: point.probability.toFixed(3) }),
      ])
    ))),
    el("p", { className: "p10-viz-caption", text: step.visual.caption }),
  ]);
}

function createPermutationTable(mode) {
  const rows = mode === "derangements"
    ? demoRows.filter((row) => isDerangement(row.permutation))
    : demoRows;

  return el("div", { className: "p10-viz-table", role: "table" }, [
    el("div", { className: "p10-viz-row p10-viz-header-row", role: "row" }, [
      el("div", { className: "p10-viz-row-label", text: "position" }),
      ...Array.from({ length: spec.demoDeckSize }, (_, index) => (
        el("div", { className: "p10-viz-position", text: String(index + 1) })
      )),
    ]),
    ...rows.map((row) => createPermutationRow(row, mode)),
  ]);
}

function createPermutationRow(row, mode) {
  const matches = fixedPoints(row.permutation);
  const muted = mode === "derangements" && matches.length > 0;

  return el("div", {
    className: ["p10-viz-row", muted ? "is-muted" : ""].filter(Boolean).join(" "),
    role: "row",
  }, [
    el("div", { className: "p10-viz-row-label", text: row.label }),
    ...row.permutation.map((card, index) => {
      const matched = card === index + 1;
      const emphasize = matched && ["events", "sample"].includes(mode);
      const deranged = mode === "derangements" && matches.length === 0;

      return el("div", {
        className: [
          "p10-viz-card",
          emphasize ? "is-match" : "",
          deranged ? "is-deranged" : "",
        ].filter(Boolean).join(" "),
      }, [
        el("span", { className: "p10-viz-card-label", text: String(card) }),
      ]);
    }),
  ]);
}

function buildCuratedDemoRows(n) {
  return [
    { label: "A", permutation: [1, 3, 2, 5, 4] },
    { label: "B", permutation: [2, 1, 4, 5, 3] },
    { label: "C", permutation: [5, 1, 2, 3, 4] },
    { label: "D", permutation: [2, 3, 4, 5, 1] },
    { label: "E", permutation: [3, 4, 5, 1, 2] },
    ...buildDemoPermutations(n, 4).map((permutation, index) => ({
      label: String.fromCharCode(70 + index),
      permutation,
    })),
  ];
}
