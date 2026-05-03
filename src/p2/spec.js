export const spec = {
  title: "Shared birthday probability",
  svg: {
    width: 860,
    height: 620,
  },
  shell: {
    width: 860,
  },
  plot: {
    x: 86,
    y: 48,
    width: 708,
    height: 450,
  },
  axes: {
    x: {
      min: 1,
      max: 1000,
      visibleTickCount: 30,
      label: "AMOUNT OF EXPERIMENT",
    },
    y: {
      min: 0,
      max: 1,
      tickStep: 0.1,
      label: "PROBABILITY",
    },
  },
  slider: {
    min: 1,
    max: 1000,
    value: 1,
    label: "Runs",
  },
  experiment: {
    successProbability: 0.6,
    seed: 4,
  },
  animation: {
    intervalMs: 50,
    step: 1,
  },
  referenceLine: {
    value: 0.6,
  },
};
