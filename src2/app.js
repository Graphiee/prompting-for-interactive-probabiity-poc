import { bindControls } from "./controls.js";
import { buildProbabilityModel } from "./probabilityModel.js";
import { createVenn, renderReadout, renderStaticVenn, renderVenn } from "./renderVenn.js";
import { spec } from "./spec.js";

const state = structuredClone(spec.initialState);
const venn = createVenn(document.querySelector("#venn-root"), spec);

const elements = {
  venn,
  probASlider: document.querySelector("#prob-a"),
  probBSlider: document.querySelector("#prob-b"),
  probAOutput: document.querySelector("#prob-a-output"),
  probBOutput: document.querySelector("#prob-b-output"),
  metricA: document.querySelector("#metric-a"),
  metricB: document.querySelector("#metric-b"),
  metricIntersection: document.querySelector("#metric-intersection"),
  metricUnion: document.querySelector("#metric-union"),
  formulaA: document.querySelector("#formula-a"),
  formulaB: document.querySelector("#formula-b"),
  formulaIntersection: document.querySelector("#formula-intersection"),
  formulaUnion: document.querySelector("#formula-union"),
  insight: document.querySelector("#insight"),
};

applySliderSpec(elements, spec);
renderStaticVenn(venn, spec);
bindControls(elements, state, spec, getModel, render);
render();

function getModel() {
  return buildProbabilityModel(state, spec);

}

function render() {
  const model = getModel();
  state.circles.a = { cx: model.circles.a.cx, cy: model.circles.a.cy };
  state.circles.b = { cx: model.circles.b.cx, cy: model.circles.b.cy };
  renderVenn(venn, model);
  renderReadout(elements, model);
}

function applySliderSpec(elements, config) {
  [elements.probASlider, elements.probBSlider].forEach((slider) => {
    slider.min = config.sliders.min;
    slider.max = config.sliders.max;
    slider.step = config.sliders.step;
  });
}
