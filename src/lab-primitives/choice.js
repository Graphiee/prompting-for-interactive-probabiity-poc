import { el } from "./dom.js";

export function createChoiceGrid({
  choices = [],
  name = `lab-choice-${Math.random().toString(16).slice(2)}`,
  selected,
  columns = "two",
  onChange,
  className = "",
} = {}) {
  const state = { value: selected };
  const buttons = [];

  const node = el("div", {
    className: ["lab-choice-grid", `lab-choice-grid-${columns}`, className]
      .filter(Boolean)
      .join(" "),
    role: "radiogroup",
  });

  choices.forEach((choice) => {
    const config = typeof choice === "string" ? { label: choice, value: choice } : choice;
    const option = createChoiceOption({
      ...config,
      name,
      selected: config.value === state.value,
      onSelect: (value) => {
        setValue(value);
        onChange?.(value, config);
      },
    });
    buttons.push(option);
    node.append(option);
  });

  function setValue(value) {
    state.value = value;
    buttons.forEach((button) => {
      const isSelected = button.dataset.value === String(value);
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-checked", isSelected ? "true" : "false");
      button.tabIndex = isSelected ? 0 : -1;
    });
  }

  return {
    node,
    getValue: () => state.value,
    setValue,
  };
}

export function createChoiceOption({
  label,
  value = label,
  detail,
  name,
  selected = false,
  disabled = false,
  onSelect,
} = {}) {
  return el("button", {
    className: ["lab-choice", selected ? "is-selected" : ""].filter(Boolean).join(" "),
    type: "button",
    role: "radio",
    "aria-checked": selected ? "true" : "false",
    "aria-disabled": disabled ? "true" : undefined,
    "data-name": name,
    "data-value": value,
    tabIndex: selected ? 0 : -1,
    disabled,
    onClick: () => onSelect?.(value),
  }, [
    el("span", { className: "lab-choice-label", text: label }),
    detail ? el("span", { className: "lab-choice-detail", text: detail }) : null,
  ]);
}
