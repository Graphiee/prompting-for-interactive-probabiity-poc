export const spec = {
  svg: {
    width: 360,
    height: 610,
  },
  sampleSpace: {
    x: 0,
    y: 0,
    width: 360,
    height: 610,
    cornerRadius: 10,
    gridSize: 32,
  },
  workArea: {
    x: 10,
    y: 212,
    width: 340,
    height: 184,
    cornerRadius: 6,
  },
  sliders: {
    min: 0.01,
    max: 0.36,
    step: 0.001,
  },
  initialState: {
    probabilities: {
      a: 0.192,
      b: 0.203,
    },
    circles: {
      a: { cx: 242, cy: 306 },
      b: { cx: 165, cy: 290 },
    },
  },
};
