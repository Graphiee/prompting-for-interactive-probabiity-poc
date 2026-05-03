You are building a visualization using the existing primitive system in this project.

----------------------------------------
TARGET DIRECTORY
----------------------------------------

All new files must be created inside:

{TARGET_DIR}

Use this path consistently. Do not create files outside of this directory.

----------------------------------------
PROJECT CONTEXT
----------------------------------------

Reuse existing shared code from the project:
- primitives (rendering, UI, utilities)
- styles (CSS classes, variables, themes)

Do NOT redefine or duplicate shared logic.

----------------------------------------
STRICT RULES
----------------------------------------

You MUST:
- Use existing primitives wherever possible
- Use existing CSS classes and variables only
- Follow STATE → MODEL → RENDER architecture
- Keep responsibilities separated:
  - spec → configuration only
  - model → math/data only
  - runtime → composition + wiring only

You MUST NOT:
- Use D3
- Hardcode styles (colors, fonts, spacing, etc.)
- Modify shared primitive or style files
- Reimplement primitives (axes, grid, sliders, etc.)
- Use innerHTML for SVG
- Mix rendering with math logic

If something cannot be built with existing primitives, follow the primitive creation policy below.

----------------------------------------
PRIMITIVE CREATION POLICY
----------------------------------------

Do NOT create or modify shared primitives by default.

If an existing primitive is insufficient:

1. First, try composing existing primitives.
2. If composition is not enough, create the smallest possible chart-local helper inside {TARGET_DIR}.
3. Do NOT add new shared primitives automatically.

At the end of your response, include a section titled "Primitive proposal". 

In that section, describe:
- what reusable primitive could be created
- why existing primitives are insufficient
- proposed function signature
- how it could be reused in future charts (at least 2 examples)

If you have any primitive proporsal, add it along with justification as explained above in PRIMITIVE-PROPOSAL.md file in {TARGET_DIR}

A helper should ONLY be promoted to a shared primitive if:
- it is reusable across multiple chart types
- it has a small, generic API
- it does not include chart-specific naming
- it does not hardcode styles
- it uses existing CSS classes
- it is configuration-driven

----------------------------------------
OUTPUT
----------------------------------------

Create only:

- {TARGET_DIR}/spec.js
- {TARGET_DIR}/model.js
- {TARGET_DIR}/runtime.js

Optionally:
- {TARGET_DIR}/index.html (only if required by project structure)

Do NOT create or modify files outside {TARGET_DIR}.

----------------------------------------
ARCHITECTURE EXPECTATIONS
----------------------------------------

spec.js:
- chart configuration
- axis definitions
- control definitions
- default values
- static constants

model.js:
- pure computation only
- no DOM or rendering
- no side effects

runtime.js:
- imports spec + model
- composes primitives
- creates visualization
- manages state
- implements update loop

Preferred flow in runtime.js:
1. Initialize state from spec
2. Create frame/SVG
3. Create scales
4. Draw static elements (grid, axes, etc.)
5. Render main visualization
6. Create controls (if any)
7. Implement update()
8. Bind interactions to update()

----------------------------------------
CHART DEFINITION (EDIT THIS SECTION ONLY)
----------------------------------------

Chart:
[NAME OF CHART]

Purpose:
[WHAT INSIGHT THIS VISUALIZATION SHOULD CONVEY]

Behavior:
- [Describe axes]
- [Describe what is plotted]
- [Describe controls/interactions]
- [Describe what updates when user interacts]

----------------------------------------
FINAL CONSTRAINT
----------------------------------------

Return only files inside {TARGET_DIR}.