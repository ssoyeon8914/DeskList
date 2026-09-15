---
name: todo-plan-design-review
description: >-
  Reviews the To-do app plan for visual hierarchy and AI-slop risks before
  coding. Use when a plan or mock includes calendar/list UI and needs a design
  pass. Invokes gstack plan-design-review with calendar-first constraints.
---

# Todo Plan Design Review

## Step 0

1. Read `.cursor/skills/todo-workflow/constraints.md`
2. Read `DESIGN.md` if present; else recommend `todo-design-consultation` first
3. Read plan/spec under `docs/`
4. Read and **execute** `~/.cursor/skills/gstack-plan-design-review/SKILL.md`

## Checklist overlays

- [ ] First viewport is one composition (calendar **or** focused list), not a metrics dashboard
- [ ] Brand/product name is strong enough if the product is branded; else calm utility hierarchy
- [ ] Filters/stats do not crowd the calendar’s first read
- [ ] Day cells: icon + priority + title + progress readable; overflow handled
- [ ] No decorative card chrome without interaction purpose
- [ ] Motion budget ≤ 3 intentional effects

## Output

- Plan edits that remove slop and clutter
- Scores/notes per gstack skill
- Next: `todo-plan-eng-review` if architecture not locked
