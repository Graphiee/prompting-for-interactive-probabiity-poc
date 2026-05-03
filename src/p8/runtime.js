import {
  buildProfiles,
  buildSampleSpace,
  isCorrectResponse,
  progressForStep,
  summarizeSampleSpace,
} from "./model.js";
import { spec } from "./spec.js";

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  setAttrs(node, attrs);
  children.forEach((child) => node.append(child));
  return node;
}

function setAttrs(node, attrs = {}) {
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "className") node.setAttribute("class", value);
    else if (key === "text") node.textContent = value;
    else if (key === "style") node.setAttribute("style", value);
    else node[key] = value;
  });
}

function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

const profiles = buildProfiles(spec.childProfiles);
const cells = buildSampleSpace(profiles);
const summary = summarizeSampleSpace(cells);

const state = {
  stepIndex: 0,
  responses: {},
  feedback: {},
  hintOpen: {},
};

const app = document.querySelector("#app");
const shell = LabShell({
  title: spec.title,
  objective: spec.objective,
});

app.append(shell.node);
render();

function render() {
  const step = currentStep();
  clear(shell.visual);
  clear(shell.panel);
  clear(shell.footer);

  shell.visual.append(VisualizationWorkspace({
    step,
    profiles,
    cells,
    summary,
  }));
  shell.panel.append(StepPanel({
    step,
    index: state.stepIndex,
    total: spec.steps.length,
    value: state.responses[step.id] ?? "",
    feedback: state.feedback[step.id],
    hintOpen: Boolean(state.hintOpen[step.id]),
    onInput: (value) => {
      state.responses[step.id] = value;
      state.feedback[step.id] = null;
      render();
    },
    onCheck: () => checkStep(step),
    onHint: () => {
      state.hintOpen[step.id] = !state.hintOpen[step.id];
      render();
    },
  }));
  shell.footer.append(ProgressIndicator({
    current: state.stepIndex + 1,
    total: spec.steps.length,
    progress: progressForStep(state.stepIndex, spec.steps.length),
  }));
  shell.footer.append(NavigationControls({
    canGoBack: state.stepIndex > 0,
    canGoNext: state.stepIndex < spec.steps.length - 1,
    onBack: () => moveStep(-1),
    onNext: () => moveStep(1),
    onReset: resetLab,
  }));
}

function currentStep() {
  return spec.steps[state.stepIndex];
}

function checkStep(step) {
  const value = state.responses[step.id];
  const correct = isCorrectResponse(step, value);
  state.feedback[step.id] = {
    status: correct ? "correct" : "incorrect",
    message: correct
      ? step.systemResponse.feedback.correct
      : step.systemResponse.feedback.incorrect,
  };
  render();
}

function moveStep(delta) {
  state.stepIndex = Math.min(spec.steps.length - 1, Math.max(0, state.stepIndex + delta));
  render();
}

function resetLab() {
  state.stepIndex = 0;
  state.responses = {};
  state.feedback = {};
  state.hintOpen = {};
  render();
}

function LabShell({ title, objective }) {
  const visual = el("section", {
    className: "lab-visual-workspace",
    "aria-label": "Visualization workspace",
  });
  const panel = el("aside", {
    className: "lab-step-panel",
    "aria-label": "Step panel",
  });
  const footer = el("footer", { className: "lab-footer" });
  const node = el("main", { className: "lab-shell" }, [
    el("header", { className: "lab-header" }, [
      el("div", {}, [
        el("p", { className: "lab-eyebrow", text: "Interactive probability lab" }),
        el("h1", { className: "lab-title", text: title }),
      ]),
      el("p", { className: "lab-objective", text: objective }),
    ]),
    el("div", { className: "lab-main" }, [visual, panel]),
    footer,
  ]);

  return { node, visual, panel, footer };
}

function StepPanel({
  step,
  index,
  total,
  value,
  feedback,
  hintOpen,
  onInput,
  onCheck,
  onHint,
}) {
  const input = createInputControl({ step, value, onInput });

  return el("div", { className: "lab-step" }, [
    el("div", { className: "lab-step-meta" }, [
      el("span", { className: "lab-step-count", text: `Step ${index + 1} of ${total}` }),
      el("span", { className: "lab-step-type", text: step.type }),
    ]),
    PromptCard({ goal: step.goal, prompt: step.prompt }),
    input,
    el("div", { className: "lab-actions" }, [
      el("button", {
        className: "lab-button lab-button-primary",
        type: "button",
        text: "Check",
        onclick: onCheck,
      }),
      el("button", {
        className: "lab-button",
        type: "button",
        text: hintOpen ? "Hide hint" : "Hint",
        onclick: onHint,
      }),
    ]),
    hintOpen ? HintBlock({ text: step.explanation }) : document.createDocumentFragment(),
    feedback ? FeedbackBox(feedback) : document.createDocumentFragment(),
  ]);
}

function PromptCard({ goal, prompt }) {
  return el("section", { className: "lab-prompt-card" }, [
    el("p", { className: "lab-goal", text: goal }),
    el("h2", { className: "lab-prompt", text: prompt }),
  ]);
}

function createInputControl({ step, value, onInput }) {
  if (step.userAction.kind === "choice") {
    return ChoiceGroup({
      name: step.id,
      options: step.userAction.options,
      value,
      onInput,
    });
  }

  if (step.userAction.kind === "formula") {
    return FormulaInput({
      value,
      placeholder: step.userAction.placeholder,
      onInput,
    });
  }

  return NumericInput({
    value,
    placeholder: step.userAction.placeholder,
    onInput,
  });
}

function ChoiceGroup({ name, options, value, onInput }) {
  return el("fieldset", { className: "lab-choice-group" }, options.map((option) => {
    const input = el("input", {
      type: "radio",
      name,
      value: option.value,
      checked: value === option.value ? "checked" : undefined,
      onchange: () => onInput(option.value),
    });
    return el("label", { className: "lab-choice" }, [
      input,
      el("span", { text: option.label }),
    ]);
  }));
}

function NumericInput({ value, placeholder, onInput }) {
  return el("label", { className: "lab-input-label" }, [
    el("span", { text: "Answer" }),
    el("input", {
      className: "lab-input",
      type: "number",
      inputmode: "numeric",
      value,
      placeholder,
      oninput: (event) => onInput(event.target.value),
    }),
  ]);
}

function FormulaInput({ value, placeholder, onInput }) {
  return el("label", { className: "lab-input-label" }, [
    el("span", { text: "Formula" }),
    el("input", {
      className: "lab-input",
      type: "text",
      value,
      placeholder,
      autocomplete: "off",
      oninput: (event) => onInput(event.target.value),
    }),
  ]);
}

function HintBlock({ text }) {
  return el("section", { className: "lab-hint" }, [
    el("h3", { text: "Hint" }),
    el("p", { text }),
  ]);
}

function FeedbackBox({ status, message }) {
  return el("section", { className: `lab-feedback lab-feedback-${status}` }, [
    el("h3", { text: status === "correct" ? "Correct" : "Try again" }),
    el("p", { text: message }),
  ]);
}

function ProgressIndicator({ current, total, progress }) {
  return el("section", { className: "lab-progress", "aria-label": "Lab progress" }, [
    el("span", { className: "lab-progress-label", text: `${current}/${total}` }),
    el("div", { className: "lab-progress-track" }, [
      el("div", {
        className: "lab-progress-fill",
        style: `width: ${Math.round(progress * 100)}%`,
      }),
    ]),
  ]);
}

function NavigationControls({ canGoBack, canGoNext, onBack, onNext, onReset }) {
  return el("nav", { className: "lab-navigation", "aria-label": "Lab navigation" }, [
    el("button", {
      className: "lab-button",
      type: "button",
      text: "Back",
      disabled: canGoBack ? undefined : "disabled",
      onclick: onBack,
    }),
    el("button", {
      className: "lab-button",
      type: "button",
      text: "Reset",
      onclick: onReset,
    }),
    el("button", {
      className: "lab-button lab-button-primary",
      type: "button",
      text: "Next",
      disabled: canGoNext ? undefined : "disabled",
      onclick: onNext,
    }),
  ]);
}

function VisualizationWorkspace({ step, profiles, cells, summary }) {
  const mode = step.visual.mode;

  return el("div", { className: "viz-workspace" }, [
    el("div", { className: "viz-summary" }, [
      VizReadout({ label: "Total outcomes", value: summary.total }),
      VizReadout({ label: "Condition", value: mode === "all" || mode === "profiles" ? "--" : summary.conditionCount }),
      VizReadout({ label: "Both girls", value: mode === "numerator" || mode === "compare" ? summary.numeratorCount : "--" }),
    ]),
    SampleSpaceGrid({ profiles, cells, mode }),
    el("p", { className: "viz-caption", text: step.visual.caption }),
  ]);
}

function VizReadout({ label, value }) {
  return el("div", { className: "viz-readout-card" }, [
    el("span", { className: "viz-readout-label", text: label }),
    el("strong", { className: "viz-readout-number", text: String(value) }),
  ]);
}

function SampleSpaceGrid({ profiles, cells, mode }) {
  const header = el("div", { className: "viz-grid-row viz-grid-header" }, [
    el("div", { className: "viz-grid-corner", text: "C1 \\ C2" }),
    ...profiles.map((profile) => el("div", {
      className: `viz-grid-label ${profile.isGirlWinter ? "viz-profile-key" : ""}`,
      text: profile.label,
      title: `${profile.genderLabel}, ${profile.seasonLabel}`,
    })),
  ]);

  const rows = profiles.map((rowProfile) => el("div", { className: "viz-grid-row" }, [
    el("div", {
      className: `viz-grid-label ${rowProfile.isGirlWinter ? "viz-profile-key" : ""}`,
      text: rowProfile.label,
      title: `${rowProfile.genderLabel}, ${rowProfile.seasonLabel}`,
    }),
    ...profiles.map((columnProfile) => {
      const cell = cells.find((item) => item.first.key === rowProfile.key && item.second.key === columnProfile.key);
      return el("div", {
        className: cellClass(cell, mode),
        title: `${rowProfile.label}, ${columnProfile.label}`,
        "aria-label": `${rowProfile.label}, ${columnProfile.label}`,
      });
    }),
  ]));

  return el("div", { className: "viz-sample-space-grid", role: "img", "aria-label": "Ordered two-child sample space grid" }, [
    header,
    ...rows,
  ]);
}

function cellClass(cell, mode) {
  const classes = ["viz-cell"];

  if (mode === "profiles" && (cell.first.isGirlWinter || cell.second.isGirlWinter)) {
    classes.push("viz-cell-reference");
  }
  if (mode === "condition" && cell.condition) {
    classes.push("viz-cell-condition");
  }
  if (mode === "numerator") {
    if (cell.condition) classes.push("viz-cell-condition");
    if (cell.numerator) classes.push("viz-cell-numerator");
  }
  if (mode === "compare") {
    if (cell.condition) classes.push("viz-cell-condition-muted");
    if (cell.numerator) classes.push("viz-cell-numerator");
  }

  return classes.join(" ");
}
