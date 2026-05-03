export const spec = {
  title: "Venn DeMorgan law animation",
  shell: {
    width: 860,
  },
  svg: {
    width: 860,
    height: 650,
  },
  sampleSpace: {
    x: 90,
    y: 64,
    width: 680,
    height: 390,
    label: "Sample space",
  },
  circles: {
    a: {
      key: "a",
      cx: 370,
      cy: 260,
      r: 138,
      label: "A",
    },
    b: {
      key: "b",
      cx: 490,
      cy: 260,
      r: 138,
      label: "B",
    },
  },
  labels: {
    sampleSpace: { x: 116, y: 96 },
    a: { x: 330, y: 264 },
    b: { x: 530, y: 264 },
    badge: { x: 430, y: 520, width: 760, height: 44 },
  },
  controls: {
    progressLabel: "Animation progress",
    playLabel: "Play or pause event animation",
  },
  animation: {
    durationMs: 11400,
    loop: true,
    initialHoldMs: 1000,
    eventDurationMs: 2600,
    zoomInMs: 550,
    typeMs: 1250,
    fadeOutMs: 800,
    maxScale: 1.08,
  },
  regions: {
    a: {
      key: "a",
      target: "circleA",
      label: "Event A: Buying a laptop",
    },
    b: {
      key: "b",
      target: "circleB",
      label: "Event B: Buying a phone",
    },
    overlap: {
      key: "overlap",
      target: "overlap",
      label: "Event A n B: Buying a laptop and a phone",
    },
    outside: {
      key: "outside",
      target: "outside",
      label: "Event (A union B)**c: Not buying laptop (event A) or phone (event B)",
    },
  },
  sequence: ["a", "b", "overlap", "outside"],
  visual: {
    baseOpacity: 0.7,
    activeOpacity: 0.78,
    outlineOpacity: 0.84,
    labelActiveOpacity: 1,
    labelMutedOpacity: 0.62,
  },
};
