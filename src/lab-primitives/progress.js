import { el } from "./dom.js";

export function createProgressList({
  title = "Progress",
  items = [],
  current = 0,
  currentStep,
} = {}) {
  const currentIndex = currentStep === undefined ? current : currentStep - 1;

  return el("nav", {
    className: "lab-progress",
    "aria-label": title,
  }, [
    el("p", { className: "lab-progress-title", text: title }),
    el("ol", { className: "lab-progress-list" }, items.map((item, index) => {
      const config = typeof item === "string" ? { label: item } : item;
      const status = config.status || deriveStatus(index, currentIndex);

      return el("li", {
        className: ["lab-progress-item", `is-${status}`].join(" "),
        "aria-current": status === "active" ? "step" : undefined,
      }, [
        el("span", { className: "lab-progress-index", text: String(index + 1) }),
        el("span", { className: "lab-progress-label", text: config.label }),
      ]);
    })),
  ]);
}

function deriveStatus(index, current) {
  if (index < current) return "done";
  if (index === current) return "active";
  return "pending";
}
