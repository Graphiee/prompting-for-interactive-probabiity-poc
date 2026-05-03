export const spec = {
  title: "Venn diagram event highlight sequence",
  svg: {
    width: 860,
    height: 620,
  },
  shell: {
    width: 860,
  },
  sampleSpace: {
    x: 86,
    y: 54,
    width: 688,
    height: 410,
    rx: 0,
    label: "SAMPLE SPACE",
  },
  circles: {
    a: {
      cx: 352,
      cy: 256,
      r: 156,
      label: "A",
    },
    b: {
      cx: 508,
      cy: 256,
      r: 156,
      label: "B",
    },
  },
  labels: {
    sample: {
      x: 112,
      y: 92,
    },
    a: {
      x: 300,
      y: 256,
    },
    b: {
      x: 560,
      y: 256,
    },
  },
  narration: {
    x: 430,
    y: 534,
    lineHeight: 28,
    maxCharsPerLine: 54,
  },
  animation: {
    stepDurationMs: 3600,
    transitionMs: 650,
    textDelayMs: 260,
    textRevealMs: 1550,
    loop: true,
  },
  states: {
    activeOpacity: 0.84,
    mutedOpacity: 0.18,
    labelActiveOpacity: 1,
    labelMutedOpacity: 0.32,
  },
  steps: [
    {
      key: "event-a",
      activeRegion: "a",
      text: "Event A: Buying a laptop",
    },
    {
      key: "event-b",
      activeRegion: "b",
      text: "Event B: Buying a phone",
    },
    {
      key: "complement",
      activeRegion: "complement",
      text: "Event (A \u222a B)c: Not buying laptop (event A) or phone (event B)",
    },
  ],
};
