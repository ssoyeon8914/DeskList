---
name: todo-design-shotgun
description: >-
  Generates multiple calendar/todo UI design variants for comparison when the
  look is stuck. Use only for visual exploration, not as a default step.
  Invokes gstack design-shotgun with anti-slop and Excel-calendar constraints.
---

# Todo Design Shotgun

## Step 0

1. Read `.cursor/skills/todo-workflow/constraints.md`
2. Read `.cursor/skills/todo-workflow/excel-domain.md`
3. Read `DESIGN.md` if any (as soft prior, not mandatory)
4. Read and **execute** `~/.cursor/skills/gstack-design-shotgun/SKILL.md`

## Variant brief (inject)

- Primary artifact: **month calendar** as one composition
- Secondary: todo entry interaction
- Must feel distinct directions (not 4 shades of purple SaaS)
- Keep day-cell information hierarchy: type icon → priority → title → progress

## After picking a winner

- Update or create `DESIGN.md` via `todo-design-consultation` follow-up if needed
- Optional lock: `todo-design-html`
- Then continue `todo-plan-eng-review` / implementation
