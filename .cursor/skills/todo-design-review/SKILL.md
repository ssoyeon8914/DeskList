---
name: todo-design-review
description: >-
  Visual QA for implemented To-do calendar/list UI: spacing, hierarchy,
  consistency, AI-slop cleanup. Use after UI exists when polishing look-and-feel.
  Invokes gstack design-review; does not add features or deploy.
---

# Todo Design Review

## Step 0

1. Read `.cursor/skills/todo-workflow/constraints.md`
2. Read `DESIGN.md` if present
3. Read and **execute** `~/.cursor/skills/gstack-design-review/SKILL.md`

## Focus surfaces

- Month calendar grid and day cells
- Todo form / list
- Filter controls (density, not pill spam)
- Empty and overflow states

## Rules

- Fix visual issues in source; do **not** expand scope with new features
- Prefer removing chrome over adding more UI
- Match DESIGN.md tokens; do not invent a second palette mid-pass

## Output

- List of fixes applied
- Residual risks (if any)
