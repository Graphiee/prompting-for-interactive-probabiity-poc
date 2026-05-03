export const spec = {
  title: "Two Children With Seasonal Information",
  objective: "Build the conditional sample space and compute P(both girls | at least one girl born in winter).",
  childProfiles: {
    genders: [
      { key: "G", label: "Girl" },
      { key: "B", label: "Boy" },
    ],
    seasons: [
      { key: "W", label: "Winter" },
      { key: "Sp", label: "Spring" },
      { key: "Su", label: "Summer" },
      { key: "F", label: "Fall" },
    ],
  },
  answers: {
    profileCount: 8,
    conditionCount: 15,
    numeratorCount: 7,
    finalProbability: "7/15",
  },
  steps: [
    {
      id: "predict-outcome",
      type: "predict",
      goal: "Surface the common competing intuitions before counting.",
      prompt: "Before counting, which value feels most plausible?",
      userAction: {
        kind: "choice",
        options: [
          { value: "1/2", label: "1/2" },
          { value: "1/3", label: "1/3" },
          { value: "7/15", label: "7/15" },
          { value: "1/4", label: "1/4" },
        ],
      },
      systemResponse: {
        correct: ["7/15"],
        feedback: {
          correct: "Good target. Now verify it by building the conditional sample space.",
          incorrect: "Reasonable first instinct. The season detail changes the conditional sample space, so count before trusting symmetry.",
        },
      },
      explanation: "The answer depends on which ordered child profiles remain possible after the winter-girl condition.",
      visual: {
        mode: "all",
        caption: "Each cell is one ordered pair of child profiles.",
      },
    },
    {
      id: "construct-profiles",
      type: "construct",
      goal: "Create the equally likely profile unit for one child.",
      prompt: "One child has a gender and a season. How many equally likely profiles can one child have?",
      userAction: {
        kind: "numeric",
        placeholder: "profiles for one child",
      },
      systemResponse: {
        correct: [8],
        feedback: {
          correct: "Yes. Two genders times four seasons gives 8 profiles.",
          incorrect: "Use the product rule: 2 possible genders and 4 possible seasons.",
        },
      },
      explanation: "Because gender is independent of season and all seasons are equally likely, the 8 gender-season profiles are equally likely for each child.",
      visual: {
        mode: "profiles",
        caption: "Rows and columns use the same 8 child profiles.",
      },
    },
    {
      id: "compute-condition",
      type: "compute",
      goal: "Count the denominator of the conditional probability.",
      prompt: "Out of the 64 ordered two-child outcomes, how many have at least one girl born in winter?",
      userAction: {
        kind: "numeric",
        placeholder: "denominator count",
      },
      systemResponse: {
        correct: [15],
        feedback: {
          correct: "Correct. Complement counting gives 64 - 7^2 = 15.",
          incorrect: "Count the complement: each child has 7 profiles that are not girl-winter, so 64 - 7 · 7.",
        },
      },
      explanation: "The conditioning event is all outcomes where child 1 or child 2 is the profile Girl/Winter.",
      visual: {
        mode: "condition",
        caption: "Highlighted cells satisfy the given information.",
      },
    },
    {
      id: "visual-filter",
      type: "visual",
      goal: "Connect the verbal condition to cells in the sample-space grid.",
      prompt: "Select the statement that matches the highlighted denominator cells.",
      userAction: {
        kind: "choice",
        options: [
          { value: "at-least-one-gw", label: "At least one child is Girl/Winter" },
          { value: "both-girls", label: "Both children are girls" },
          { value: "first-gw", label: "The first child is Girl/Winter" },
        ],
      },
      systemResponse: {
        correct: ["at-least-one-gw"],
        feedback: {
          correct: "Right. The full denominator is a row and a column, with the overlap counted once.",
          incorrect: "Look for both the Girl/Winter row and the Girl/Winter column. That means either child can be the winter-born girl.",
        },
      },
      explanation: "The highlighted set is not tied to a named child; either child can carry the winter-girl information.",
      visual: {
        mode: "condition",
        caption: "Denominator: all outcomes compatible with the given information.",
      },
    },
    {
      id: "compute-numerator",
      type: "compute",
      goal: "Count compatible outcomes where both children are girls.",
      prompt: "Among the highlighted outcomes, how many also have both children girls?",
      userAction: {
        kind: "numeric",
        placeholder: "numerator count",
      },
      systemResponse: {
        correct: [7],
        feedback: {
          correct: "Correct. Among the 4 by 4 girl-season block, remove the 3 by 3 no-winter cases.",
          incorrect: "Restrict to girl rows and girl columns, then require at least one winter season: 4 · 4 - 3 · 3.",
        },
      },
      explanation: "Both children are girls gives 16 girl-season pairs. Nine of those have no winter-born girl, leaving 7.",
      visual: {
        mode: "numerator",
        caption: "Numerator: both girls inside the conditioned sample space.",
      },
    },
    {
      id: "compute-probability",
      type: "compute",
      goal: "Assemble the conditional probability ratio.",
      prompt: "Use numerator over denominator. What is the conditional probability?",
      userAction: {
        kind: "formula",
        placeholder: "for example, 7/15",
      },
      systemResponse: {
        correct: ["7/15"],
        feedback: {
          correct: "Correct. P(both girls | at least one girl born in winter) = 7/15.",
          incorrect: "Use the two counts already built: favorable compatible outcomes over all compatible outcomes.",
        },
      },
      explanation: "Conditional probability narrows the sample space first, then takes the fraction of narrowed outcomes that satisfy both girls.",
      visual: {
        mode: "numerator",
        caption: "Probability = highlighted numerator cells / denominator cells.",
      },
    },
    {
      id: "reflect-season",
      type: "reflect",
      goal: "Interpret why the answer differs from the classic at-least-one-girl problem.",
      prompt: "Why is the result larger than 1/3?",
      userAction: {
        kind: "choice",
        options: [
          { value: "specific-info", label: "The winter detail makes the observed girl more specific" },
          { value: "season-favors-girls", label: "Winter births favor girls" },
          { value: "unordered", label: "The children should be unordered" },
        ],
      },
      systemResponse: {
        correct: ["specific-info"],
        feedback: {
          correct: "Yes. More specific information removes many boy-girl possibilities from the denominator.",
          incorrect: "Gender and season are independent. The effect comes from conditioning on a more specific observed profile.",
        },
      },
      explanation: "As the identifying information becomes more specific, the answer moves toward the named-child value 1/2. With four seasons, it lands at 7/15.",
      visual: {
        mode: "compare",
        caption: "Compare denominator cells with the numerator cells inside them.",
      },
    },
  ],
};
