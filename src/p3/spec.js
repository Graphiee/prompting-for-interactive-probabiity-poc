export const spec = {
  title: "Bernoulli distribution probability",
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
      min: 0,
      max: 10,
      tickStep: 1,
      label: "K SUCCESSES",
    },
    y: {
      min: 0,
      max: 1,
      tickStep: 0.2,
      label: "PROBABILITY",
    },
  },
  controls: {
    p: {
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.35,
      label: "p",
    },
    k: {
      min: 0,
      max: 10,
      value: 3,
      label: "k",
    },
  },
  probabilityReadout: {
    height: 96,
  },
  dots: {
    radius: 7,
    selectedRadius: 12,
  },
};
