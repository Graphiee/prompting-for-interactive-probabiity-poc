export const spec = {
  title: "Two Children, One Winter Girl",
  exerciseText:
    "A family has two children. Find the probability that both children are girls, given that at least one of the two is a girl who was born in winter.",
  objective:
    "Build the conditional sample space first, then compute the probability as favorable compatible outcomes divided by all compatible outcomes.",
  assumptions: [
    "Child order is used for counting.",
    "Each child is independently equally likely to be a boy or a girl.",
    "The four seasons are equally likely.",
    "Gender and season are independent.",
  ],
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
    oneChildProfiles: 8,
    familyOutcomes: 64,
    conditionCount: 15,
    numeratorCount: 7,
    finalProbability: "7/15",
  },
  steps: [
    {
      id: "initial-prediction",
      type: "predict",
      goal: "Name the competing intuitions before doing any counting.",
      prompt: "Before we count, which answer feels most plausible?",
      userAction: {
        kind: "choice",
        options: [
          { value: "1/2", label: "1/2", detail: "A specific child is known to be a girl." },
          { value: "1/3", label: "1/3", detail: "At least one child is a girl." },
          { value: "7/15", label: "7/15", detail: "The winter detail changes the filter." },
          { value: "1/4", label: "1/4", detail: "No information is used." },
        ],
      },
      systemResponse: {
        correct: ["7/15"],
        feedback: {
          correct: "Good prediction. Now justify it by constructing the conditioning event.",
          incorrect:
            "Keep that instinct in mind. The answer is decided by the exact sample space left after the winter-girl information.",
        },
      },
      hint: "The season detail is not extra decoration. It identifies a more specific kind of girl.",
      explanation:
        "Conditional probability starts by replacing the full sample space with the outcomes compatible with the given information.",
      visual: {
        mode: "all",
        caption: "Each cell is one ordered pair of child profiles.",
      },
    },
    {
      id: "one-child-profile-count",
      type: "construct",
      goal: "Choose the equally likely unit for one child.",
      prompt: "A single child has a gender and a birth season. How many equally likely profiles can one child have?",
      userAction: {
        kind: "choice",
        options: [
          { value: "2", label: "2", detail: "Only gender." },
          { value: "4", label: "4", detail: "Only season." },
          { value: "8", label: "8", detail: "Gender times season." },
          { value: "16", label: "16", detail: "Two children already." },
        ],
      },
      systemResponse: {
        correct: ["8"],
        feedback: {
          correct: "Right. Two genders times four seasons gives 8 profiles for one child.",
          incorrect: "Use the product rule for one child: gender choice times season choice.",
        },
      },
      hint: "Do not count families yet. Count the possible labels for one child.",
      explanation:
        "Independence and equal season probabilities let us treat all 8 gender-season profiles as equally likely.",
      visual: {
        mode: "profiles",
        caption: "Rows and columns both use the same 8 one-child profiles.",
      },
    },
    {
      id: "family-outcome-count",
      type: "compute",
      goal: "Build the full ordered sample space before conditioning.",
      prompt: "With 8 possible profiles for child 1 and 8 for child 2, how many ordered family outcomes are in the full grid?",
      userAction: {
        kind: "numeric",
        placeholder: "total outcomes",
      },
      systemResponse: {
        correct: [64],
        feedback: {
          correct: "Correct. The full ordered grid has 8 times 8 outcomes.",
          incorrect: "Use one independent profile choice for each child: 8 times 8.",
        },
      },
      hint: "Rows are child 1 profiles. Columns are child 2 profiles.",
      explanation:
        "The grid is ordered, so Girl/Winter then Boy/Spring is a different cell from Boy/Spring then Girl/Winter.",
      visual: {
        mode: "all",
        caption: "The full sample space has 64 equally likely cells.",
      },
    },
    {
      id: "condition-count",
      type: "compute",
      goal: "Count the denominator after applying the information.",
      prompt: "How many of the 64 outcomes have at least one child who is Girl/Winter?",
      userAction: {
        kind: "numeric",
        placeholder: "compatible outcomes",
      },
      systemResponse: {
        correct: [15],
        feedback: {
          correct: "Correct. The complement has no Girl/Winter profile for either child: 7 times 7, so 64 - 49 = 15.",
          incorrect:
            "Count the complement. Each child has 7 profiles that are not Girl/Winter, so subtract 7 times 7 from 64.",
        },
      },
      hint: "It is easier to count the cells that avoid Girl/Winter completely.",
      explanation:
        "The denominator of the conditional probability is the number of outcomes compatible with the information.",
      visual: {
        mode: "condition",
        caption: "The highlighted row and column are all outcomes with at least one Girl/Winter child.",
      },
    },
    {
      id: "condition-meaning",
      type: "visual",
      goal: "Tie the highlighted denominator to the wording of the event.",
      prompt: "Which statement matches the highlighted denominator cells?",
      userAction: {
        kind: "choice",
        options: [
          { value: "first", label: "Child 1 is Girl/Winter", detail: "Only a row." },
          { value: "second", label: "Child 2 is Girl/Winter", detail: "Only a column." },
          { value: "either", label: "At least one child is Girl/Winter", detail: "A row or a column." },
          { value: "both", label: "Both children are girls", detail: "A larger girl-only block." },
        ],
      },
      systemResponse: {
        correct: ["either"],
        feedback: {
          correct: "Right. The condition does not name a child, so either child can carry the Girl/Winter profile.",
          incorrect:
            "Look for a union: the Girl/Winter row plus the Girl/Winter column, with their overlap counted once.",
        },
      },
      hint: "The wording says at least one, not first child and not second child.",
      explanation:
        "This step prevents a common mistake: treating the condition as if it identified a particular child.",
      visual: {
        mode: "condition",
        caption: "The denominator is a union: row plus column, with the overlap counted once.",
      },
    },
    {
      id: "numerator-count",
      type: "compute",
      goal: "Count compatible outcomes where both children are girls.",
      prompt: "Among the compatible outcomes, how many also have both children girls?",
      userAction: {
        kind: "numeric",
        placeholder: "favorable compatible outcomes",
      },
      systemResponse: {
        correct: [7],
        feedback: {
          correct: "Correct. In the 4 by 4 all-girl block, remove the 3 by 3 cases with no winter girl.",
          incorrect:
            "Restrict to the 4 girl-season profiles for each child, then require at least one winter: 4 times 4 minus 3 times 3.",
        },
      },
      hint: "Both girls gives a 4 by 4 block. Now remove the all-girl cells where neither girl was born in winter.",
      explanation:
        "There are 16 ordered all-girl season pairs. Nine have no winter birth, so 7 remain in the numerator.",
      visual: {
        mode: "numerator",
        caption: "The stronger highlight marks compatible outcomes where both children are girls.",
      },
    },
    {
      id: "conditional-ratio",
      type: "compute",
      goal: "Assemble the conditional probability from the two counts.",
      prompt: "Use favorable compatible outcomes over all compatible outcomes. What is the probability?",
      userAction: {
        kind: "formula",
        placeholder: "for example, 7/15",
      },
      systemResponse: {
        correct: ["7/15"],
        feedback: {
          correct: "Correct. P(both girls | at least one Girl/Winter child) = 7/15.",
          incorrect: "Use the counts already built: numerator 7 and denominator 15.",
        },
      },
      hint: "Conditional probability is not numerator over 64 here. The denominator is the filtered sample space.",
      explanation:
        "After conditioning, the sample space has only 15 equally likely cells. Seven of those satisfy both girls.",
      visual: {
        mode: "numerator",
        caption: "Probability = favorable compatible cells divided by all compatible cells.",
      },
    },
    {
      id: "interpret-answer",
      type: "reflect",
      goal: "Explain why this answer differs from the classic at-least-one-girl answer.",
      prompt: "Why is 7/15 larger than 1/3 but still less than 1/2?",
      userAction: {
        kind: "choice",
        options: [
          {
            value: "specific",
            label: "The winter detail makes the observed girl more specific.",
            detail: "Specific information removes many boy-girl cases.",
          },
          {
            value: "season-bias",
            label: "Winter births are more likely to be girls.",
            detail: "That would violate the assumptions.",
          },
          {
            value: "unordered",
            label: "The children should be treated as unordered.",
            detail: "The ordered grid already handles symmetry.",
          },
        ],
      },
      systemResponse: {
        correct: ["specific"],
        feedback: {
          correct:
            "Yes. More specific identifying information pushes the answer toward the named-child value 1/2.",
          incorrect:
            "Season does not favor gender. The change comes from how specific the conditioning information is.",
        },
      },
      hint: "Compare the condition 'at least one girl' with 'at least one Girl/Winter child.'",
      explanation:
        "The classic denominator has three gender outcomes: GG, GB, BG. The winter detail keeps fewer mixed-gender cases, so the conditional fraction increases to 7/15.",
      visual: {
        mode: "compare",
        caption: "The final view keeps the denominator visible and emphasizes the numerator inside it.",
      },
    },
  ],
};
