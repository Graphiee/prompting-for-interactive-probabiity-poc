export const spec = {
  title: "Matching Cards",
  exerciseText:
    "Consider a well-shuffled deck of n cards, labeled 1 through n. You flip over the cards one by one, saying the numbers 1 through n as you do so. You win the game if, at some point, the number you say aloud is the same as the number on the card being flipped over.",
  objective:
    "Model the game as fixed points of a random permutation, count the easier losing event, then convert it to the probability of winning.",
  assumptions: [
    "Every ordering of the n labeled cards is equally likely.",
    "Position i means the card flipped when you say i.",
    "A match at position i is a fixed point of the permutation.",
  ],
  demoDeckSize: 5,
  answers: {
    demoTotal: 120,
    demoLosing: 44,
    demoWinning: 76,
    secondTerm: "-1/2!",
    thirdTerm: "1/3!",
    finalFormula: "1 - !n/n!",
    limit: "1 - 1/e",
  },
  steps: [
    {
      id: "predict-win",
      type: "predict",
      goal: "Make a first estimate before counting.",
      prompt: "For a large deck, which probability feels closest for getting at least one exact match?",
      userAction: {
        kind: "choice",
        options: [
          { value: "small", label: "Very small", detail: "Matches seem rare." },
          { value: "half", label: "About 1/2", detail: "One success or no success." },
          { value: "two-thirds", label: "About 2/3", detail: "Several chances to match." },
          { value: "almost-one", label: "Almost 1", detail: "Many positions are checked." },
        ],
      },
      systemResponse: {
        correct: ["two-thirds"],
        feedback: {
          correct: "Good intuition. Many chances help, but the events overlap, so the probability settles below 2/3.",
          incorrect:
            "Keep that estimate. We will count the losing arrangements and see why the answer is near 0.632 for large n.",
        },
      },
      hint: "There are n chances, each with probability 1/n, so the expected number of matches is 1. That does not mean the chance of at least one match is 1.",
      explanation:
        "A first prediction gives us something to test. The exact probability comes from handling overlap among the match events.",
      visual: {
        mode: "sample",
        caption: "A small n = 5 deck shows positions, card labels, and exact matches.",
      },
    },
    {
      id: "identify-unit",
      type: "construct",
      goal: "Choose the equally likely outcomes.",
      prompt: "What should one equally likely outcome be?",
      userAction: {
        kind: "choice",
        options: [
          { value: "card", label: "One card label", detail: "Only one flip." },
          { value: "ordering", label: "A full deck ordering", detail: "A permutation of 1 through n." },
          { value: "match-count", label: "A number of matches", detail: "Not equally likely." },
          { value: "position", label: "One position", detail: "Only one spoken number." },
        ],
      },
      systemResponse: {
        correct: ["ordering"],
        feedback: {
          correct: "Right. A shuffle is a permutation, and all n! permutations are equally likely.",
          incorrect: "The random experiment is the whole shuffled deck, not a single position or a final count.",
        },
      },
      hint: "A shuffle decides the card in every position at once.",
      explanation:
        "Using full permutations keeps the sample space uniform: each deck order has probability 1/n!.",
      visual: {
        mode: "sample",
        caption: "Each row is one full ordering of the five-card demo deck.",
      },
    },
    {
      id: "name-events",
      type: "visual",
      goal: "Translate a card match into an event.",
      prompt: "Let A_i be the event that position i contains card i. Which statement is the winning event?",
      userAction: {
        kind: "choice",
        options: [
          { value: "one", label: "A_1 only", detail: "Only the first card matches." },
          { value: "all", label: "A_1 and A_2 and ... and A_n", detail: "Every position matches." },
          { value: "union", label: "A_1 or A_2 or ... or A_n", detail: "At least one position matches." },
          { value: "none", label: "No A_i happens", detail: "This is losing." },
        ],
      },
      systemResponse: {
        correct: ["union"],
        feedback: {
          correct: "Correct. Winning is the union of all fixed-point events.",
          incorrect: "The phrase at some point means at least one of the match events happens.",
        },
      },
      hint: "You win as soon as one spoken number equals the card label.",
      explanation:
        "The hard part is that these events overlap: a deck can have several fixed points.",
      visual: {
        mode: "events",
        caption: "Highlighted cells mark fixed points A_i in several example permutations.",
      },
    },
    {
      id: "count-total",
      type: "compute",
      goal: "Count the full sample space for a concrete deck.",
      prompt: "For the n = 5 demo deck, how many equally likely orderings are possible?",
      userAction: {
        kind: "numeric",
        placeholder: "total orderings",
      },
      systemResponse: {
        correct: [120],
        feedback: {
          correct: "Correct. There are 5! = 120 possible deck orders.",
          incorrect: "A full ordering of five distinct cards can be chosen in 5 times 4 times 3 times 2 times 1 ways.",
        },
      },
      hint: "Use factorial counting for a permutation.",
      explanation:
        "For general n, the denominator for the original sample space is n!.",
      visual: {
        mode: "counts",
        caption: "The demo readouts compare all, losing, and winning orderings for n = 5.",
      },
    },
    {
      id: "count-loss",
      type: "compute",
      goal: "Count losing arrangements in the small case.",
      prompt: "For n = 5, how many orderings have no position i containing card i?",
      userAction: {
        kind: "numeric",
        placeholder: "losing orderings",
      },
      systemResponse: {
        correct: [44],
        feedback: {
          correct: "Correct. These 44 permutations are derangements of five cards.",
          incorrect:
            "Try counting no-match permutations. For five cards this number is 5!(1 - 1/1! + 1/2! - 1/3! + 1/4! - 1/5!) = 44.",
        },
      },
      hint: "The no-match orderings are called derangements. In the demo table, these are rows with no highlighted fixed point.",
      explanation:
        "Counting losing is cleaner because losing means none of the match events occur.",
      visual: {
        mode: "derangements",
        caption: "Only no-match demo rows remain emphasized.",
      },
    },
    {
      id: "inclusion-exclusion",
      type: "construct",
      goal: "Build the derangement formula from inclusion-exclusion.",
      prompt: "The losing count is n! times an alternating sum. After 1 - 1/1!, what are the next two terms?",
      userAction: {
        kind: "choice",
        options: [
          { value: "plus-minus", label: "+ 1/2! - 1/3!", detail: "Add pairs back, subtract triples." },
          { value: "minus-plus", label: "- 1/2! + 1/3!", detail: "Keep subtracting singles first." },
          { value: "plus-plus", label: "+ 1/2! + 1/3!", detail: "No alternating signs." },
          { value: "times", label: "x 1/2! x 1/3!", detail: "Multiplicative correction." },
        ],
      },
      systemResponse: {
        correct: ["plus-minus"],
        feedback: {
          correct: "Right. Inclusion-exclusion alternates: subtract forced matches, add double-counted pairs, subtract triples.",
          incorrect: "A permutation with two specified matches was subtracted twice, so pairs must be added back.",
        },
      },
      hint: "Inclusion-exclusion alternates signs as the number of specified matching positions grows.",
      explanation:
        "The derangement count is !n = n! sum_{k=0}^n (-1)^k/k!.",
      visual: {
        mode: "formula",
        caption: "The table links fixed number of specified matches to the alternating term.",
      },
    },
    {
      id: "assemble-formula",
      type: "compute",
      goal: "Convert losing probability into winning probability.",
      prompt: "If !n is the number of no-match permutations, what is the probability of winning?",
      userAction: {
        kind: "formula",
        placeholder: "for example, 1 - !n/n!",
      },
      systemResponse: {
        correct: ["1-!n/n!", "1-derangements/n!", "1-Dn/n!"],
        feedback: {
          correct: "Correct. Win is the complement of no fixed points.",
          incorrect: "Use complement: probability of winning = 1 minus probability of losing.",
        },
      },
      hint: "Losing means no matches. Winning means not losing.",
      explanation:
        "Thus P(win) = 1 - !n/n! = 1 - sum_{k=0}^n (-1)^k/k! = sum_{k=1}^n (-1)^{k+1}/k!.",
      visual: {
        mode: "formula",
        caption: "The final probability is one minus the derangement fraction.",
      },
    },
    {
      id: "interpret-limit",
      type: "reflect",
      goal: "Connect the finite formula to the familiar limiting probability.",
      prompt: "As n grows, the losing probability approaches 1/e. What does the winning probability approach?",
      userAction: {
        kind: "choice",
        options: [
          { value: "one-over-e", label: "1/e", detail: "The losing probability." },
          { value: "one-minus", label: "1 - 1/e", detail: "The complement of losing." },
          { value: "one-half", label: "1/2", detail: "A symmetric guess." },
          { value: "one", label: "1", detail: "Certain win." },
        ],
      },
      systemResponse: {
        correct: ["one-minus"],
        feedback: {
          correct: "Correct. The limiting chance of at least one match is 1 - 1/e, about 0.632.",
          incorrect: "The limit 1/e belongs to losing, so winning is its complement.",
        },
      },
      hint: "Complement the no-match limit.",
      explanation:
        "The answer is not close to 1 even for huge decks. More opportunities create more overlaps, and the probability stabilizes at 1 - 1/e.",
      visual: {
        mode: "limit",
        caption: "Finite n values quickly approach the horizontal limit 1 - 1/e.",
      },
    },
  ],
};
