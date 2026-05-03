export const spec = {
  title: "Shared birthday probability",
  daysInYear: 365,
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
      max: 100,
      tickStep: 10,
      label: "NUMBER OF PEOPLE",
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
    max: 100,
    value: 40,
    label: "n",
  },
  referenceLine: {
    value: 0.5,
  },
};
