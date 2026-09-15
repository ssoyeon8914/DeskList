---
name: todo-diagram
description: >-
  Diagrams To-do app data flow (todo store → calendar/filters/stats) or
  module boundaries. Use only when the flow is unclear during eng review.
  Invokes gstack diagram; keeps diagrams minimal.
---

# Todo Diagram

## Step 0

1. Read `.cursor/skills/todo-workflow/constraints.md`
2. Read `.cursor/skills/todo-workflow/excel-domain.md`
3. Read and **execute** `~/.cursor/skills/gstack-diagram/SKILL.md`

## Preferred diagrams (pick one per run)

1. **Data flow:** Settings + Todos → derived 표시/상태 → Filters → Calendar view + Stats
2. **Module map:** settings | todos | calendar | filters | mandalart(optional)
3. **Day cell pipeline:** todosForDate → sort → take N → overflow

## Rules

- One diagram purpose per invocation; no poster-sized architecture art
- Reflect lean defaults from `todo-plan-eng-review` (no pivot subsystem boxes)
- Save outputs under `docs/diagrams/` when files are produced
