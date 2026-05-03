import { el } from "./dom.js";
import { createLabPanel } from "./layout.js";

export function createPrincipleStack({
  title = "Tutor principle",
  intro,
  items = [],
} = {}) {
  return createLabPanel({
    title,
    children: [
      intro ? el("p", { className: "lab-copy", text: intro }) : null,
      el("div", { className: "lab-principle-stack" }, items.map((item, index) => {
        const config = typeof item === "string" ? { title: `${index + 1}.`, body: item } : item;
        return el("article", { className: "lab-principle" }, [
          el("h3", { className: "lab-principle-title", text: config.title }),
          config.body ? el("p", { className: "lab-principle-body", text: config.body }) : null,
        ]);
      })),
    ],
  });
}

export function createLegend({
  title = "Legend",
  items = [],
} = {}) {
  return createLabPanel({
    title,
    className: "lab-legend-panel",
    children: [
      el("div", { className: "lab-legend" }, items.map((item) => (
        el("div", { className: "lab-legend-item" }, [
          el("span", {
            className: "lab-swatch",
            style: {
              "--lab-swatch-bg": item.color || "var(--lab-accent-blue-soft)",
              "--lab-swatch-edge": item.edge || item.color || "var(--lab-accent-blue)",
            },
          }),
          el("span", { className: "lab-legend-text" }, [
            el("strong", { text: item.label }),
            item.description ? `: ${item.description}` : "",
            item.mass !== undefined ? `, mass ${item.mass}` : "",
          ]),
        ])
      ))),
    ],
  });
}

export function createFactGrid({
  items = [],
  columns = "auto",
  className = "",
} = {}) {
  return el("dl", {
    className: ["lab-fact-grid", `lab-fact-grid-${columns}`, className]
      .filter(Boolean)
      .join(" "),
  }, items.map((item) => (
    el("div", { className: "lab-fact" }, [
      el("dt", { className: "lab-fact-label", text: item.label }),
      el("dd", { className: "lab-fact-value", text: item.value }),
      item.note ? el("dd", { className: "lab-fact-note", text: item.note }) : null,
    ])
  )));
}

export function createTokenList({
  items = [],
  tone = "neutral",
  className = "",
} = {}) {
  return el("div", {
    className: ["lab-token-list", className].filter(Boolean).join(" "),
  }, items.map((item) => {
    const config = typeof item === "string" ? { label: item } : item;
    return el("span", {
      className: ["lab-token", `lab-token-${config.tone || tone}`].join(" "),
      text: config.label,
    });
  }));
}

export function createEquationRow({
  label,
  expression,
  result,
  tone = "plain",
} = {}) {
  return el("div", { className: ["lab-equation-row", `lab-equation-row-${tone}`].join(" ") }, [
    label ? el("span", { className: "lab-equation-label", text: label }) : null,
    expression ? el("code", { className: "lab-equation-expression", text: expression }) : null,
    result ? el("strong", { className: "lab-equation-result", text: result }) : null,
  ]);
}

export function createOutcomeGrid({
  items = [],
  columns = "four",
  className = "",
} = {}) {
  return el("div", {
    className: ["lab-outcome-grid", `lab-outcome-grid-${columns}`, className]
      .filter(Boolean)
      .join(" "),
  }, items.map((item) => (
    el("div", {
      className: [
        "lab-outcome",
        item.active ? "is-active" : "",
        item.muted ? "is-muted" : "",
      ].filter(Boolean).join(" "),
      style: item.color ? { "--lab-outcome-color": item.color } : undefined,
    }, [
      el("span", { className: "lab-outcome-label", text: item.label }),
      item.detail ? el("span", { className: "lab-outcome-detail", text: item.detail }) : null,
    ])
  )));
}
