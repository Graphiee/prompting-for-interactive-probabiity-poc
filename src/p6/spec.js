export const spec = {
  title: "De Morgan's Laws set complement transformations",
  shell: {
    width: 760,
  },
  svg: {
    width: 720,
    height: 720,
  },
  universe: {
    x: 36,
    y: 36,
    width: 648,
    height: 648,
    label: "U",
  },
  sets: {
    a: {
      key: "a",
      cx: 288,
      cy: 360,
      r: 180,
      label: "A",
    },
    b: {
      key: "b",
      cx: 432,
      cy: 360,
      r: 180,
      label: "B",
    },
  },
  labels: {
    a: { x: 230, y: 144 },
    b: { x: 490, y: 144 },
    universe: { x: 58, y: 70 },
    formula: { x: 360, y: 662 },
    modeTabs: { y: 28 },
  },
  regions: [
    {
      key: "aOnly",
      label: "A only",
      textEquivalent: "Inside set A and outside set B",
      fillRule: "evenodd",
    },
    {
      key: "bOnly",
      label: "B only",
      textEquivalent: "Inside set B and outside set A",
      fillRule: "evenodd",
    },
    {
      key: "overlap",
      label: "A and B",
      textEquivalent: "Inside both set A and set B",
    },
    {
      key: "outside",
      label: "Outside A and B",
      textEquivalent: "Inside the universal set and outside both set A and set B",
      fillRule: "evenodd",
    },
  ],
  modeTabs: [
    {
      key: "unionComplement",
      label: "(A union B)^c",
      display: "(A ∪ B)ᶜ",
      x: 116,
      width: 214,
    },
    {
      key: "intersectionComplement",
      label: "(A intersection B)^c",
      display: "(A ∩ B)ᶜ",
      x: 390,
      width: 214,
    },
  ],
  controls: {
    modeDefault: "unionComplement",
    stepDefault: 0,
    scrubber: {
      min: 0,
      max: 3,
      step: 1,
      label: "Transformation step",
    },
  },
  animation: {
    stepDurationMs: 1000,
  },
  visual: {
    activeFill: "var(--viz-red)",
    inactiveFill: "var(--viz-track)",
    universeFill: "var(--viz-white)",
    inactiveOpacity: 0.2,
    activeOpacity: 0.86,
    outlineOpacity: 0.9,
    labelMutedOpacity: 0,
    labelActiveOpacity: 1,
  },
  modes: {
    unionComplement: {
      key: "unionComplement",
      ariaLabel: "De Morgan law: complement of A union B equals A complement intersection B complement",
      steps: [
        {
          step: 0,
          highlightedRegions: [],
          labelsVisible: ["labelA", "labelB"],
          formula: "",
          formulaText: "Initial state showing set A and set B",
        },
        {
          step: 1,
          highlightedRegions: ["aOnly", "bOnly", "overlap"],
          labelsVisible: ["labelFormula"],
          formula: "A ∪ B",
          formulaText: "A union B",
        },
        {
          step: 2,
          highlightedRegions: ["outside"],
          labelsVisible: ["labelFormula"],
          formula: "(A ∪ B)ᶜ",
          formulaText: "Complement of A union B",
        },
        {
          step: 3,
          highlightedRegions: ["outside"],
          labelsVisible: ["labelFormula"],
          formula: "(A ∪ B)ᶜ = Aᶜ ∩ Bᶜ",
          formulaText: "Complement of A union B equals A complement intersection B complement",
        },
      ],
    },
    intersectionComplement: {
      key: "intersectionComplement",
      ariaLabel: "De Morgan law: complement of A intersection B equals A complement union B complement",
      steps: [
        {
          step: 0,
          highlightedRegions: [],
          labelsVisible: ["labelA", "labelB"],
          formula: "",
          formulaText: "Initial state showing set A and set B",
        },
        {
          step: 1,
          highlightedRegions: ["overlap"],
          labelsVisible: ["labelFormula"],
          formula: "A ∩ B",
          formulaText: "A intersection B",
        },
        {
          step: 2,
          highlightedRegions: ["aOnly", "bOnly", "outside"],
          labelsVisible: ["labelFormula"],
          formula: "(A ∩ B)ᶜ",
          formulaText: "Complement of A intersection B",
        },
        {
          step: 3,
          highlightedRegions: ["aOnly", "bOnly", "outside"],
          labelsVisible: ["labelFormula"],
          formula: "(A ∩ B)ᶜ = Aᶜ ∪ Bᶜ",
          formulaText: "Complement of A intersection B equals A complement union B complement",
        },
      ],
    },
  },
};
