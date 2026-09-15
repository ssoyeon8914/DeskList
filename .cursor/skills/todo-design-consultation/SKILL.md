---
name: todo-design-consultation
description: >-
  Creates a non-generic design system (DESIGN.md) for the To-do calendar app.
  Use when starting UI with no brand direction, or when avoiding AI-slop
  purple/card dashboards. Invokes gstack design-consultation plus project
  anti-slop constraints.
---

# Todo Design Consultation

## Step 0

1. Read `.cursor/skills/todo-workflow/constraints.md` (Anti AI-slop UI section is mandatory)
2. Read `.cursor/skills/todo-workflow/excel-domain.md`
3. Read and **execute** `~/.cursor/skills/gstack-design-consultation/SKILL.md`

## Product surfaces to design for

1. **Month calendar** — primary composition (not a widget inside a dashboard)
2. **Todo list / editor** — interaction surface
3. **Filters** — quiet, secondary (if in MVP)
4. **Settings (구분/아이콘)** — minimal

## Hard rejects for this product

- Purple-indigo gradient default, cream+terracotta serif cliché, newspaper broadsheet
- Hero with floating badges/chips; card grid as the first viewport
- Inter/Roboto/Arial/system-only stacks
- Emoji as primary visual identity (icons from 구분표 are data, not decoration spam)

## Output

- `DESIGN.md` as source of truth (fonts, color tokens, spacing, motion 2–3)
- Next: `todo-plan-design-review` on the plan, or `todo-design-shotgun` if exploring variants
