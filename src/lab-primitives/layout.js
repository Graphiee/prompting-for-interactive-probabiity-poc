import { el } from "./dom.js";

export function createLabPage({
  title,
  question,
  assumptions = [],
  badges = [],
  children = [],
  sidebar = [],
  className = "",
} = {}) {
  return el("main", {
    className: [
      "lab-screen",
      sidebar.length ? "has-sidebar" : "",
      className,
    ].filter(Boolean).join(" "),
  }, [
    el("div", { className: "lab-page" }, [
      el("div", { className: "lab-layout" }, [
        el("div", { className: "lab-main" }, [
          createLabHeader({ title, question, assumptions, badges }),
          children,
        ]),
        sidebar.length ? el("aside", { className: "lab-sidebar" }, sidebar) : null,
      ]),
    ]),
  ]);
}

export function createLabHeader({
  title,
  question,
  assumptions = [],
  badges = [],
} = {}) {
  return el("header", { className: "lab-header" }, [
    badges.length ? createBadgeRow(badges) : null,
    title ? el("h1", { className: "lab-title", text: title }) : null,
    question ? el("p", { className: "lab-question", text: question }) : null,
    assumptions.length
      ? el("div", { className: "lab-assumption-row" }, assumptions.map((assumption) => (
        el("span", { className: "lab-assumption", text: assumption })
      )))
      : null,
  ]);
}

export function createBadgeRow(badges = []) {
  return el("div", { className: "lab-badge-row" }, badges.map((badge, index) => {
    const config = typeof badge === "string" ? { label: badge } : badge;
    return el("span", {
      className: [
        "lab-badge",
        index === 0 ? "lab-badge-strong" : "",
        config.tone ? `lab-badge-${config.tone}` : "",
      ].filter(Boolean).join(" "),
      text: config.label,
    });
  }));
}

export function createLabPanel({
  title,
  subtitle,
  eyebrow,
  children = [],
  footer,
  tone = "plain",
  className = "",
} = {}) {
  return el("section", {
    className: ["lab-panel", `lab-panel-${tone}`, className].filter(Boolean).join(" "),
  }, [
    eyebrow ? el("p", { className: "lab-eyebrow", text: eyebrow }) : null,
    title || subtitle
      ? el("div", { className: "lab-panel-heading" }, [
        title ? el("h2", { className: "lab-panel-title", text: title }) : null,
        subtitle ? el("p", { className: "lab-panel-subtitle", text: subtitle }) : null,
      ])
      : null,
    children,
    footer ? el("div", { className: "lab-panel-footer" }, [footer]) : null,
  ]);
}

export function createStepCard({
  step,
  title,
  prompt,
  children = [],
  actions,
  className = "",
} = {}) {
  const heading = step ? `Step ${step}: ${title}` : title;

  return createLabPanel({
    className: ["lab-step-card", className].filter(Boolean).join(" "),
    children: [
      heading ? el("h2", { className: "lab-step-title", text: heading }) : null,
      prompt ? el("p", { className: "lab-step-prompt", text: prompt }) : null,
      children,
      actions ? el("div", { className: "lab-step-actions" }, [actions]) : null,
    ],
  });
}

export function createSplit({
  left,
  right,
  ratio = "equal",
  className = "",
} = {}) {
  return el("div", {
    className: ["lab-split", `lab-split-${ratio}`, className].filter(Boolean).join(" "),
  }, [left, right]);
}
