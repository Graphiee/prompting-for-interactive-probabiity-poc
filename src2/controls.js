import { clampCircleToBounds } from "./probabilityModel.js";

export function bindControls(elements, state, config, getModel, onChange) {
  bindSliders(elements, state, onChange);
  bindDrag(elements.venn, state, config, getModel, onChange);
}

function bindSliders(elements, state, onChange) {
  elements.probASlider.value = state.probabilities.a;
  elements.probBSlider.value = state.probabilities.b;

  elements.probASlider.addEventListener("input", () => {
    state.probabilities.a = Number(elements.probASlider.value);
    onChange();
  });

  elements.probBSlider.addEventListener("input", () => {
    state.probabilities.b = Number(elements.probBSlider.value);
    onChange();
  });
}

function bindDrag(elements, state, config, getModel, onChange) {
  let activeKey = null;
  let pointerOffset = { x: 0, y: 0 };
  const circleElements = {
    a: elements.circleA,
    b: elements.circleB,
  };

  elements.svg.addEventListener("pointerdown", (event) => {
    const key = event.target.dataset.circle;
    if (!key) {
      return;
    }

    activeKey = key;
    const point = eventToSvgPoint(elements.svg, event);
    const activeCircle = getModel().circles[activeKey];
    pointerOffset = {
      x: point.x - activeCircle.cx,
      y: point.y - activeCircle.cy,
    };

    circleElements[activeKey].classList.add("is-dragging");
    circleElements[activeKey].setPointerCapture(event.pointerId);
  });

  elements.svg.addEventListener("pointermove", (event) => {
    if (!activeKey) {
      return;
    }

    const model = getModel();
    const point = eventToSvgPoint(elements.svg, event);
    const radius = model.circles[activeKey].radius;
    state.circles[activeKey] = clampCircleToBounds({
      cx: point.x - pointerOffset.x,
      cy: point.y - pointerOffset.y,
    }, radius, config.workArea);

    onChange();
  });

  elements.svg.addEventListener("pointerup", endDrag);
  elements.svg.addEventListener("pointercancel", endDrag);

  function endDrag(event) {
    if (!activeKey) {
      return;
    }

    circleElements[activeKey].classList.remove("is-dragging");
    circleElements[activeKey].releasePointerCapture(event.pointerId);
    activeKey = null;
  }
}

function eventToSvgPoint(svg, event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}
