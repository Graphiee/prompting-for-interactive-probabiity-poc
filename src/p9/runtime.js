import {
  clear,
  createChoiceGrid,
  createEquationRow,
  createLabActionBar,
  createLabButton,
  createLabPage,
  createLabPanel,
  createProgressList,
  createSplit,
  el,
} from "../lab-primitives/index.js";
import {
  buildChildProfiles,
  buildFamilyOutcomes,
  progressForStep,
  summarizeOutcomes,
  validateResponse,
} from "./model.js";
import { spec } from "./spec.js";

const profiles = buildChildProfiles(spec.childProfiles);
const outcomes = buildFamilyOutcomes(profiles);
const summary = summarizeOutcomes(outcomes);

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
    subtitle: "Ordered sample-space grid for the two children.",
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
      items: spec.steps.map((item) => ({
        label: item.goal,
      })),
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
    tone: "plain",
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
    el("span", { className: "lab-answer-label", text: step.userAction.kind === "formula" ? "Probability" : "Answer" }),
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
  return el("div", { className: "p9-viz", "data-mode": step.visual.mode }, [
    el("div", { className: "p9-viz-readouts" }, [
      createReadout("Full grid", summary.total),
      createReadout("Condition", shouldShowCondition(step) ? summary.conditionCount : "--"),
      createReadout("Both girls", shouldShowNumerator(step) ? summary.numeratorCount : "--"),
    ]),
    createProfileLegend(),
    createOutcomeGrid(step.visual.mode),
    el("p", { className: "p9-viz-caption", text: step.visual.caption }),
  ]);
}

function createReadout(label, value) {
  return el("div", { className: "p9-viz-readout" }, [
    el("span", { className: "p9-viz-readout-label", text: label }),
    el("strong", { className: "p9-viz-readout-value", text: String(value) }),
  ]);
}

function createProfileLegend() {
  const items = [
    { label: "Unit", value: "Profile", note: "One gender-season label." },
    { label: "Key profile", value: "G/W", note: "Girl born in winter." },
    { label: "Family", value: "Ordered pair", note: "Child 1 profile, child 2 profile." },
  ];

  return el("div", { className: "p9-viz-profile-strip" }, items.map((item) => (
    el("div", { className: "p9-viz-profile-fact" }, [
      el("span", { className: "p9-viz-profile-label", text: item.label }),
      el("strong", { className: "p9-viz-profile-value", text: item.value }),
      el("span", { className: "p9-viz-profile-note", text: item.note }),
    ])
  )));
}

function createOutcomeGrid(mode) {
  return el("div", {
    className: "p9-viz-grid",
    role: "img",
    "aria-label": "Ordered sample-space grid with child 1 profiles as rows and child 2 profiles as columns",
  }, [
    el("div", { className: "p9-viz-grid-row" }, [
      el("div", { className: "p9-viz-corner", text: "C1 \\ C2" }),
      profiles.map((profile) => createHeaderCell(profile)),
    ]),
    profiles.map((rowProfile) => el("div", { className: "p9-viz-grid-row" }, [
      createHeaderCell(rowProfile),
      profiles.map((columnProfile) => {
        const outcome = findOutcome(rowProfile, columnProfile);
        return el("div", {
          className: getOutcomeClass(outcome, mode),
          title: `${rowProfile.label}, ${columnProfile.label}`,
        }, [
          shouldShowCellLabel(mode, outcome)
            ? el("span", { className: "p9-viz-cell-label", text: "GG" })
            : null,
        ]);
      }),
    ])),
  ]);
}

function createHeaderCell(profile) {
  return el("div", {
    className: [
      "p9-viz-header-cell",
      profile.isGirl ? "is-girl" : "",
      profile.isGirlWinter ? "is-key" : "",
    ].filter(Boolean).join(" "),
    title: `${profile.genderLabel}, ${profile.seasonLabel}`,
    text: profile.label,
  });
}

function findOutcome(first, second) {
  return outcomes.find((outcome) => outcome.first.key === first.key && outcome.second.key === second.key);
}

function getOutcomeClass(outcome, mode) {
  const classes = ["p9-viz-cell"];

  if (mode === "profiles" && (outcome.first.isGirlWinter || outcome.second.isGirlWinter)) {
    classes.push("is-reference");
  }

  if (mode === "condition" && outcome.condition) {
    classes.push("is-condition");
  }

  if (mode === "numerator") {
    if (outcome.condition) classes.push("is-condition");
    if (outcome.numerator) classes.push("is-numerator");
  }

  if (mode === "compare") {
    if (outcome.condition) classes.push("is-condition-muted");
    if (outcome.numerator) classes.push("is-numerator");
  }

  return classes.join(" ");
}

function shouldShowCondition(step) {
  return ["condition", "numerator", "compare"].includes(step.visual.mode);
}

function shouldShowNumerator(step) {
  return ["numerator", "compare"].includes(step.visual.mode);
}

function shouldShowCellLabel(mode, outcome) {
  return ["numerator", "compare"].includes(mode) && outcome.numerator;
}
