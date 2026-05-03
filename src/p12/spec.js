export const spec = {
  title: "Contains Duplicate",
  exerciseText:
    "Given an integer array nums, write a JavaScript function that determines whether any value appears at least twice. Return true if duplicates exist, and false if all elements are unique.",
  objective:
    "Build the habit of scanning once, remembering values already seen, and returning as soon as a repeated value is found.",
  assumptions: [
    "Inputs are arrays of integers.",
    "A duplicate means one value appears in two or more positions.",
    "Example 1 is treated as nums = [12, 7, 8, 2, 2] so it matches the stated output and explanation.",
  ],
  examples: [
    {
      label: "Example 1",
      nums: [12, 7, 8, 2, 2],
      output: true,
      explanation: "The element 2 appears twice.",
    },
    {
      label: "Example 2",
      nums: [10, 20, 30, 40],
      output: false,
      explanation: "All elements are unique.",
    },
    {
      label: "Example 3",
      nums: [1, 1, 1, 2, 2, 3],
      output: true,
      explanation: "The element 1 appears multiple times.",
    },
  ],
  demo: {
    duplicateArray: [12, 7, 8, 2, 2],
    uniqueArray: [10, 20, 30, 40],
    denseArray: [1, 1, 1, 2, 2, 3],
  },
  steps: [
    {
      id: "interpret-question",
      type: "intuition",
      goal: "Separate a duplicate value from a repeated position or sorted pattern.",
      prompt:
        "For nums = [12, 7, 8, 2, 2], what makes the answer true?",
      userAction: {
        kind: "choice",
        options: [
          { value: "same-value", label: "The value 2 appears in two positions", detail: "Same value, different indices." },
          { value: "array-long", label: "The array has more than four numbers", detail: "Length alone is not enough." },
          { value: "not-sorted", label: "The numbers are not sorted", detail: "Order does not decide uniqueness." },
          { value: "has-small", label: "The array contains a small number", detail: "Size of a value is irrelevant." },
        ],
      },
      systemResponse: {
        correct: ["same-value"],
        feedback: {
          correct:
            "Correct. The condition is about value equality across positions.",
          incorrect:
            "Focus on repeated values. The same number can appear at index 3 and index 4 even if order or length changes.",
        },
      },
      hint: "Index 3 and index 4 both hold 2.",
      explanation:
        "A duplicate is not about sorting or array length. It is about whether some value has already appeared earlier in the scan.",
      visual: {
        mode: "array",
        activeIndex: 4,
        seenCount: 4,
        sample: "duplicateArray",
        caption: "The repeated 2 is highlighted at its second occurrence.",
      },
    },
    {
      id: "choose-memory",
      type: "structure",
      goal: "Choose what information must be remembered during a scan.",
      prompt:
        "If you read the array from left to right, what should your function remember after each number?",
      userAction: {
        kind: "choice",
        options: [
          { value: "seen-values", label: "All values already seen", detail: "Enough to test the next value." },
          { value: "sum", label: "The running sum", detail: "Different arrays can share a sum." },
          { value: "last-only", label: "Only the last value", detail: "Misses non-adjacent duplicates." },
          { value: "sorted-copy", label: "A sorted copy first", detail: "Works, but adds extra work." },
        ],
      },
      systemResponse: {
        correct: ["seen-values"],
        feedback: {
          correct:
            "Right. A seen-values collection answers: have I encountered this exact value before?",
          incorrect:
            "The key question for each number is membership: is this value already in the earlier part of the array?",
        },
      },
      hint: "For [4, 9, 4], only remembering the previous value 9 would miss the earlier 4.",
      explanation:
        "The reusable structure is a set of values already passed. It stores membership, not counts or order.",
      visual: {
        mode: "seen",
        activeIndex: 2,
        seenCount: 2,
        sample: "duplicateArray",
        caption: "The seen set grows as values are scanned.",
      },
    },
    {
      id: "scan-step",
      type: "calculation",
      goal: "Simulate the first repeated-value check.",
      prompt:
        "After scanning 12, 7, 8, and 2, the seen set is {12, 7, 8, 2}. The next value is 2. What should happen?",
      userAction: {
        kind: "choice",
        options: [
          { value: "return-true", label: "Return true", detail: "2 is already in seen." },
          { value: "add-again", label: "Add 2 again and continue", detail: "A set cannot store a second 2." },
          { value: "return-false", label: "Return false", detail: "False means no repeats found." },
          { value: "restart", label: "Restart the scan", detail: "No need to rescan earlier values." },
        ],
      },
      systemResponse: {
        correct: ["return-true"],
        feedback: {
          correct:
            "Correct. The first repeated membership check proves a duplicate exists.",
          incorrect:
            "Once the current value is already in seen, the existential question is settled: a duplicate exists.",
        },
      },
      hint: "The function only needs to know whether any duplicate exists, not how many.",
      explanation:
        "This is the early-exit moment. Because the answer asks whether any duplicate exists, one confirmed repeat is enough.",
      visual: {
        mode: "trace",
        activeIndex: 4,
        seenCount: 4,
        sample: "duplicateArray",
        caption: "At the final 2, the membership check succeeds and the function can stop.",
      },
    },
    {
      id: "place-check",
      type: "structure",
      goal: "Order the two operations inside the loop correctly.",
      prompt:
        "Inside the loop, which operation must happen before adding the current number to seen?",
      userAction: {
        kind: "choice",
        options: [
          { value: "check-first", label: "Check if seen has nums[i]", detail: "Then add only if it was new." },
          { value: "add-first", label: "Add nums[i] to seen first", detail: "Then every value looks seen." },
          { value: "clear-first", label: "Clear seen each time", detail: "Forgets earlier values." },
          { value: "sort-first", label: "Sort inside every loop", detail: "Unnecessary repeated work." },
        ],
      },
      systemResponse: {
        correct: ["check-first"],
        feedback: {
          correct:
            "Correct. Check first, then add. Otherwise a fresh value would match itself.",
          incorrect:
            "A value should be compared only with values from earlier indices. That means the membership check comes before insertion.",
        },
      },
      hint: "The current value must not count as its own previous occurrence.",
      explanation:
        "The loop invariant is: before each check, seen contains exactly the values from earlier positions.",
      visual: {
        mode: "code",
        activeIndex: 1,
        seenCount: 1,
        sample: "denseArray",
        caption: "The guard must run before the insertion line.",
      },
    },
    {
      id: "unique-finish",
      type: "calculation",
      goal: "Handle the all-unique case.",
      prompt:
        "For nums = [10, 20, 30, 40], the scan finishes without finding any value already in seen. What should the function return?",
      userAction: {
        kind: "choice",
        options: [
          { value: "false", label: "false", detail: "No duplicate was found." },
          { value: "true", label: "true", detail: "Only for repeated values." },
          { value: "undefined", label: "undefined", detail: "The function needs a Boolean." },
          { value: "nums", label: "nums", detail: "The prompt asks for true or false." },
        ],
      },
      systemResponse: {
        correct: ["false"],
        feedback: {
          correct:
            "Correct. If every value survives the membership check, all values are unique.",
          incorrect:
            "Finishing the loop means no duplicate was discovered. The requested Boolean is false.",
        },
      },
      hint: "True is returned early only when a repeated value is encountered.",
      explanation:
        "The final false belongs after the loop. It represents the completed proof that every checked value was new.",
      visual: {
        mode: "trace",
        activeIndex: 3,
        seenCount: 4,
        sample: "uniqueArray",
        caption: "The unique array reaches the end with no repeated membership check.",
      },
    },
    {
      id: "complete-function",
      type: "calculation",
      goal: "Assemble the JavaScript implementation.",
      prompt:
        "Complete the key duplicate test in this function: if (____) return true;",
      userAction: {
        kind: "formula",
        placeholder: "condition",
      },
      systemResponse: {
        correct: [
          "seen.has(num)",
          "seen.has(n)",
          "seen.has(nums[i])",
          "set.has(num)",
          "set.has(nums[i])",
        ],
        feedback: {
          correct:
            "Correct. Set membership is the exact question the algorithm asks at each step.",
          incorrect:
            "Use the Set method that asks whether the current value already exists in the stored earlier values.",
        },
      },
      hint: "JavaScript Set uses .has(value) for membership.",
      explanation:
        "The full pattern is: create a Set, loop through nums, return true if the current value is already in the Set, otherwise add it. Return false after the loop.",
      visual: {
        mode: "code",
        activeIndex: 1,
        seenCount: 1,
        sample: "denseArray",
        caption: "The missing condition is the membership check.",
      },
    },
    {
      id: "general-framework",
      type: "interpretation",
      goal: "State the reusable reasoning framework.",
      prompt:
        "Which summary best describes the framework for solving similar duplicate-detection problems by hand?",
      userAction: {
        kind: "choice",
        options: [
          { value: "invariant", label: "Keep earlier values in seen, check current value before adding it", detail: "One pass, early exit." },
          { value: "sort-always", label: "Always sort first, then compare neighbors", detail: "Valid sometimes, but not the Set framework." },
          { value: "count-sum", label: "Compare the sum with the length", detail: "Does not identify equal values." },
          { value: "return-length", label: "Return true when nums has length above 1", detail: "Two different values are still unique." },
        ],
      },
      systemResponse: {
        correct: ["invariant"],
        feedback: {
          correct:
            "Correct. The invariant makes the method portable: seen contains exactly prior values.",
          incorrect:
            "The most reusable idea is the invariant for a left-to-right scan: earlier values live in seen, the current value is tested against them.",
        },
      },
      hint: "Ask what seen means right before each loop check.",
      explanation:
        "This framework scales to any array length: membership check proves true; completing the scan proves false. Time is O(n), and extra space is O(n) in the worst case.",
      visual: {
        mode: "summary",
        activeIndex: 4,
        seenCount: 4,
        sample: "duplicateArray",
        caption: "Duplicate detection is a scan plus a loop invariant.",
      },
    },
  ],
};
