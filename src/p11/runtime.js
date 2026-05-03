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
  betaDensity,
  betaLabel,
  densityPoints,
  posteriorForFailureProbability,
  posteriorForSuccessProbability,
  progressForStep,
  reflectedDensity,
  transformedBetaLabel,
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
    subtitle: "Diagrams support the current step; controls and feedback stay in the step panel.",
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
    el("span", { className: "lab-answer-label", text: "Answer" }),
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
  if (["reflection", "result", "summary"].includes(step.visual.mode)) {
    return createCurveView(step);
  }

  if (step.visual.mode === "mapping") return createMappingView(step);
  if (step.visual.mode === "algebra") return createAlgebraView(step);
  if (step.visual.mode === "story") return createStoryView(step);
  if (step.visual.mode === "posterior") return createPosteriorView(step);

  return createCurveView(step);
}

function createCurveView(step) {
  const { a, b } = spec.demo;
  return el("div", { className: "p11-viz" }, [
    createFactGrid({
      columns: "two",
      items: [
        { label: "Original", value: betaLabel(a, b), note: "B, success probability." },
        { label: "Reflected", value: transformedBetaLabel(a, b), note: "1 - B, failure probability." },
      ],
    }),
    createDensitySvg(step.visual.mode),
    el("p", { className: "p11-viz-caption", text: step.visual.caption }),
  ]);
}

function createDensitySvg(mode) {
  const { a, b } = spec.demo;
  const original = densityPoints(a, b);
  const reflected = densityPoints(b, a);
  const maxY = Math.max(...original.map((point) => point.y), ...reflected.map((point) => point.y));

  return el("svg", {
    className: "p11-viz-density",
    viewBox: "0 0 420 230",
    role: "img",
    "aria-label": "Beta density and reflected beta density",
  }, [
    createSvgEl("line", { x1: 34, y1: 190, x2: 390, y2: 190, class: "p11-viz-axis" }),
    createSvgEl("line", { x1: 34, y1: 28, x2: 34, y2: 190, class: "p11-viz-axis" }),
    createSvgEl("text", { x: 31, y: 210, class: "p11-viz-axis-label" }, "0"),
    createSvgEl("text", { x: 207, y: 210, class: "p11-viz-axis-label" }, "1/2"),
    createSvgEl("text", { x: 384, y: 210, class: "p11-viz-axis-label" }, "1"),
    createSvgEl("line", { x1: 212, y1: 34, x2: 212, y2: 190, class: "p11-viz-midline" }),
    createSvgEl("path", {
      d: pathFromPoints(original, maxY),
      class: ["p11-viz-path", mode === "result" ? "is-muted" : ""].filter(Boolean).join(" "),
    }),
    createSvgEl("path", {
      d: pathFromPoints(reflected, maxY),
      class: ["p11-viz-path", "is-reflected"].join(" "),
    }),
    createSvgEl("text", { x: 72, y: 54, class: "p11-viz-label" }, betaLabel(a, b)),
    createSvgEl("text", { x: 282, y: 54, class: "p11-viz-label" }, transformedBetaLabel(a, b)),
  ]);
}

function createMappingView(step) {
  return el("div", { className: "p11-viz" }, [
    createEquationRow({
      label: "Map",
      expression: "Y = 1 - B",
      result: "reflect",
    }),
    el("div", { className: "p11-viz-numberline" }, [
      createNumberlineTick("B = 0.2", "20%"),
      createNumberlineTick("1/2", "50%"),
      createNumberlineTick("Y = 0.8", "80%"),
      el("span", { className: "p11-viz-bridge" }),
    ]),
    createEquationRow({
      label: "Inverse",
      expression: "B = 1 - Y, |dB/dY| = 1",
      result: "no scale change",
    }),
    el("p", { className: "p11-viz-caption", text: step.visual.caption }),
  ]);
}

function createAlgebraView(step) {
  return el("div", { className: "p11-viz" }, [
    createEquationRow({
      label: "Start",
      expression: "f_B(x) = x^(a-1)(1-x)^(b-1) / Beta(a,b)",
      result: "kernel",
    }),
    createEquationRow({
      label: "Substitute",
      expression: "x = 1-y and 1-x = y",
      result: "swap",
    }),
    createEquationRow({
      label: "End",
      expression: "f_Y(y) = y^(b-1)(1-y)^(a-1) / Beta(b,a)",
      result: "Beta(b,a)",
    }),
    el("p", { className: "p11-viz-caption", text: step.visual.caption }),
  ]);
}

function createStoryView(step) {
  const { priorSuccesses, priorFailures } = spec.demo;
  return el("div", { className: "p11-viz" }, [
    createTokenList({
      items: [
        { label: `success prior count: ${priorSuccesses}`, tone: "green" },
        { label: `failure prior count: ${priorFailures}`, tone: "pink" },
      ],
    }),
    el("div", { className: "p11-viz-swap" }, [
      createStoryColumn("B", "success probability", ["success", "failure"]),
      el("div", { className: "p11-viz-swap-arrow", text: "swap labels" }),
      createStoryColumn("1 - B", "failure probability", ["failure", "success"]),
    ]),
    el("p", { className: "p11-viz-caption", text: step.visual.caption }),
  ]);
}

function createPosteriorView(step) {
  const { a, b, observedSuccesses, observedFailures } = spec.demo;
  const successPosterior = posteriorForSuccessProbability({
    a,
    b,
    successes: observedSuccesses,
    failures: observedFailures,
  });
  const failurePosterior = posteriorForFailureProbability({
    a,
    b,
    successes: observedSuccesses,
    failures: observedFailures,
  });

  return el("div", { className: "p11-viz" }, [
    createFactGrid({
      columns: "two",
      items: [
        { label: "Data", value: `s = ${observedSuccesses}, f = ${observedFailures}`, note: "Original labels." },
        { label: "Relabeled", value: `s' = ${observedFailures}, f' = ${observedSuccesses}`, note: "Failures become successes." },
      ],
    }),
    createEquationRow({
      label: "For B",
      expression: `Beta(${a}+${observedSuccesses}, ${b}+${observedFailures})`,
      result: successPosterior.label,
    }),
    createEquationRow({
      label: "For 1-B",
      expression: `Beta(${b}+${observedFailures}, ${a}+${observedSuccesses})`,
      result: failurePosterior.label,
    }),
    el("p", { className: "p11-viz-caption", text: step.visual.caption }),
  ]);
}

function createStoryColumn(title, subtitle, labels) {
  return el("section", { className: "p11-viz-story-column" }, [
    el("h3", { className: "p11-viz-story-title", text: title }),
    el("p", { className: "p11-viz-story-subtitle", text: subtitle }),
    ...labels.map((label) => el("span", { className: "p11-viz-story-token", text: label })),
  ]);
}

function createNumberlineTick(label, left) {
  return el("span", {
    className: "p11-viz-numberline-tick",
    style: { "--p11-tick-left": left },
  }, [
    el("span", { className: "p11-viz-numberline-dot" }),
    el("span", { className: "p11-viz-numberline-label", text: label }),
  ]);
}

function pathFromPoints(points, maxY) {
  return points.map((point, index) => {
    const x = 34 + point.x * 356;
    const y = 190 - (point.y / maxY) * 145;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

function createSvgEl(tag, attrs = {}, text) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== false) node.setAttribute(key, value);
  });
  if (text) node.textContent = text;
  return node;
}
