export const spec = {
  title: "Reflecting a Beta Random Variable",
  exerciseText:
    "Let B be distributed as Beta(a, b). Find the distribution of 1 - B in two ways: (a) using a change of variables and (b) using a story proof. Also explain why the result makes sense in terms of Beta being the conjugate prior for the Binomial.",
  objective:
    "Show that reflecting a Beta(a, b) variable across 1/2 swaps the two shape parameters, then connect the algebra to success/failure relabeling.",
  assumptions: [
    "Parameters satisfy a > 0 and b > 0.",
    "B represents a probability of success; 1 - B represents the probability of failure.",
    "The visualization uses a = 2 and b = 5 as a concrete example.",
  ],
  demo: {
    a: 2,
    b: 5,
    priorSuccesses: 1,
    priorFailures: 4,
    observedSuccesses: 3,
    observedFailures: 2,
  },
  steps: [
    {
      id: "predict-reflection",
      type: "predict",
      goal: "Predict what reflection should do before computing.",
      prompt:
        "For the demo shape Beta(2, 5), B tends to sit closer to 0 than 1. Where should Y = 1 - B tend to sit?",
      userAction: {
        kind: "choice",
        options: [
          { value: "near-zero", label: "Closer to 0", detail: "Same side as B." },
          { value: "near-half", label: "Centered near 1/2", detail: "Reflection averages it out." },
          { value: "near-one", label: "Closer to 1", detail: "Mass moves to the opposite side." },
          { value: "uniform", label: "Uniform on [0, 1]", detail: "All values become equally likely." },
        ],
      },
      systemResponse: {
        correct: ["near-one"],
        feedback: {
          correct:
            "Right. Reflection sends small B values to large Y values, so the density should flip horizontally.",
          incorrect:
            "Reflection does not smooth the density. It sends each value b to y = 1 - b, so left-side mass becomes right-side mass.",
        },
      },
      hint: "Try one point: if B = 0.2, then 1 - B = 0.8.",
      explanation:
        "The first intuition is geometric: Y is the mirror image of B across 1/2. The formula should express that same mirror.",
      visual: {
        mode: "reflection",
        caption: "The demo density for B is mirrored to form the density for Y = 1 - B.",
      },
    },
    {
      id: "choose-transformation",
      type: "construct",
      goal: "Set up the change of variables.",
      prompt: "Let Y = 1 - B. Which inverse transformation should go into the density formula?",
      userAction: {
        kind: "choice",
        options: [
          { value: "b-y", label: "b = y", detail: "No transformation." },
          { value: "b-one-minus-y", label: "b = 1 - y", detail: "Solve y = 1 - b." },
          { value: "b-one-over-y", label: "b = 1/y", detail: "Reciprocal transformation." },
          { value: "b-y-minus-one", label: "b = y - 1", detail: "Shifts outside [0, 1]." },
        ],
      },
      systemResponse: {
        correct: ["b-one-minus-y"],
        feedback: {
          correct:
            "Correct. The inverse map is b = 1 - y, and its derivative has absolute value 1.",
          incorrect:
            "Solve y = 1 - b for b. The density formula needs the old variable written in terms of the new one.",
        },
      },
      hint: "Move b to the left side and y to the right side.",
      explanation:
        "For a monotone transformation, f_Y(y) = f_B(g(y)) |g'(y)|. Here g(y) = 1 - y and |g'(y)| = 1.",
      visual: {
        mode: "mapping",
        caption: "Each point y in the new variable points back to b = 1 - y in the original variable.",
      },
    },
    {
      id: "substitute-density",
      type: "compute",
      goal: "Substitute the inverse into the Beta density.",
      prompt:
        "The Beta(a, b) density is proportional to x^(a-1)(1-x)^(b-1). After substituting x = 1 - y, which proportional form appears?",
      userAction: {
        kind: "choice",
        options: [
          { value: "same", label: "y^(a-1)(1-y)^(b-1)", detail: "Same parameter order." },
          { value: "swapped", label: "y^(b-1)(1-y)^(a-1)", detail: "The powers swap roles." },
          { value: "sum", label: "y^(a+b-1)(1-y)^(a+b-1)", detail: "Parameters combine." },
          { value: "inverse", label: "y^(1-a)(1-y)^(1-b)", detail: "Powers change signs." },
        ],
      },
      systemResponse: {
        correct: ["swapped"],
        feedback: {
          correct:
            "Correct. (1 - y)^(a-1) times y^(b-1) is the Beta(b, a) kernel.",
          incorrect:
            "Track each factor separately: x becomes 1 - y, while 1 - x becomes y.",
        },
      },
      hint: "If x = 1 - y, then 1 - x = y.",
      explanation:
        "The normalizing constant is symmetric: Beta(a, b) = Beta(b, a). The kernel becomes exactly the Beta(b, a) kernel.",
      visual: {
        mode: "algebra",
        caption: "The two powers trade places when x is replaced by 1 - y.",
      },
    },
    {
      id: "name-distribution",
      type: "compute",
      goal: "State the transformed distribution.",
      prompt: "Complete the change-of-variables result: if B ~ Beta(a, b), then 1 - B ~ ____.",
      userAction: {
        kind: "formula",
        placeholder: "Beta(?, ?)",
      },
      systemResponse: {
        correct: ["Beta(b,a)", "beta(b,a)", "Beta(b, a)", "beta(b, a)"],
        feedback: {
          correct:
            "Correct. Reflection across 1/2 swaps the success-side and failure-side shape parameters.",
          incorrect:
            "Use the kernel from the previous step: y has exponent b - 1 and 1 - y has exponent a - 1.",
        },
      },
      hint: "In a Beta(alpha, beta) density, y has exponent alpha - 1 and 1 - y has exponent beta - 1.",
      explanation:
        "The algebra gives f_Y(y) = y^(b-1)(1-y)^(a-1) / Beta(b, a), so Y = 1 - B is Beta(b, a).",
      visual: {
        mode: "result",
        caption: "The reflected curve matches a Beta(5, 2) density in the demo.",
      },
    },
    {
      id: "story-meaning",
      type: "construct",
      goal: "Translate the result into a story proof.",
      prompt:
        "In the Beta-Binomial story, if B is the chance of success, what is 1 - B?",
      userAction: {
        kind: "choice",
        options: [
          { value: "same-success", label: "The same success chance", detail: "No relabeling." },
          { value: "failure", label: "The failure chance", detail: "Success and failure trade names." },
          { value: "sample-size", label: "The sample size", detail: "Number of trials." },
          { value: "posterior-mean", label: "The posterior mean", detail: "A summary after data." },
        ],
      },
      systemResponse: {
        correct: ["failure"],
        feedback: {
          correct:
            "Right. If success probability is B, then failure probability is 1 - B.",
          incorrect:
            "The complement of a Bernoulli success probability is the probability of the opposite label: failure.",
        },
      },
      hint: "A Bernoulli trial has exactly two labels here: success and failure.",
      explanation:
        "A story proof can relabel outcomes. The old failure probability becomes the new success probability after swapping labels.",
      visual: {
        mode: "story",
        caption: "Pseudo-counts attached to success and failure swap when the labels are swapped.",
      },
    },
    {
      id: "posterior-swap",
      type: "compare",
      goal: "Check that conjugacy behaves consistently under relabeling.",
      prompt:
        "Start with prior B ~ Beta(a, b). After s successes and f failures, the posterior for B is Beta(a+s, b+f). If we instead model failure probability 1 - B, which posterior should appear?",
      userAction: {
        kind: "choice",
        options: [
          { value: "swapped", label: "Beta(b+f, a+s)", detail: "Failure count first, success count second." },
          { value: "same", label: "Beta(a+s, b+f)", detail: "No swap." },
          { value: "crossed", label: "Beta(b+s, a+f)", detail: "Swap prior only." },
          { value: "added", label: "Beta(a+b+s+f, a+b+s+f)", detail: "Pool all counts." },
        ],
      },
      systemResponse: {
        correct: ["swapped"],
        feedback: {
          correct:
            "Correct. For failure-as-success, old failures are successes and old successes are failures.",
          incorrect:
            "Conjugacy adds counts to matching labels. After relabeling, f belongs with the first parameter and s with the second.",
        },
      },
      hint: "The first Beta parameter follows the event you now call success.",
      explanation:
        "This is the conjugacy reason the result makes sense: Beta parameters behave like prior counts for the two Binomial labels, and complements exchange those labels.",
      visual: {
        mode: "posterior",
        caption: "The posterior update is the same bookkeeping after success and failure labels are exchanged.",
      },
    },
    {
      id: "final-framework",
      type: "reflect",
      goal: "Summarize the reusable method.",
      prompt:
        "Which framework best explains why the answer is Beta(b, a) rather than Beta(a, b)?",
      userAction: {
        kind: "choice",
        options: [
          { value: "swap", label: "Reflection swaps the two Bernoulli labels", detail: "Algebra and story agree." },
          { value: "unchanged", label: "Complements never change distributions", detail: "Only true for special symmetric cases." },
          { value: "normal", label: "The Central Limit Theorem applies", detail: "No sampling average here." },
          { value: "memoryless", label: "The Beta distribution is memoryless", detail: "That property belongs elsewhere." },
        ],
      },
      systemResponse: {
        correct: ["swap"],
        feedback: {
          correct:
            "Correct. The reusable idea is label swapping: success and failure exchange roles, so the Beta parameters exchange roles.",
          incorrect:
            "Use both views together: the density mirrors, and the story swaps success with failure.",
        },
      },
      hint: "Ask what the first and second Beta parameters are counting.",
      explanation:
        "For any similar complement question, identify the old variable, write the inverse transformation, then ask what labels or counts have been exchanged in the story.",
      visual: {
        mode: "summary",
        caption: "Both routes land on the same parameter swap: Beta(a, b) becomes Beta(b, a).",
      },
    },
  ],
};
