import { el } from "./dom.js";

export function createLabButton({
  label,
  icon,
  variant = "secondary",
  size = "md",
  disabled = false,
  onClick,
  className = "",
  type = "button",
  ariaLabel,
} = {}) {
  return el("button", {
    className: [
      "lab-button",
      `lab-button-${variant}`,
      `lab-button-${size}`,
      className,
    ].filter(Boolean).join(" "),
    type,
    disabled,
    "aria-label": ariaLabel,
    onClick,
  }, [
    icon ? el("span", { className: "lab-button-icon", "aria-hidden": "true" }, [icon]) : null,
    label ? el("span", { text: label }) : null,
  ]);
}

export function createLabActionBar({
  primary,
  secondary = [],
  align = "between",
  className = "",
} = {}) {
  const secondaryNodes = secondary.map((action) => toButton(action));
  const primaryNode = primary ? toButton(primary) : null;

  return el("div", {
    className: ["lab-action-bar", `lab-action-bar-${align}`, className]
      .filter(Boolean)
      .join(" "),
  }, [
    el("div", { className: "lab-action-group" }, secondaryNodes),
    primaryNode ? el("div", { className: "lab-action-group" }, [primaryNode]) : null,
  ]);
}

function toButton(action) {
  return action instanceof Node ? action : createLabButton(action);
}
