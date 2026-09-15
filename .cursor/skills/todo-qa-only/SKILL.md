---
name: todo-qa-only
description: >-
  Report-only QA for the To-do calendar app: CRUD, calendar sync, filters,
  derived status. Use when testing without fixing. Invokes gstack qa-only with
  Excel-parity acceptance checks.
---

# Todo QA Only

## Step 0

1. Read `.cursor/skills/todo-workflow/constraints.md`
2. Read `.cursor/skills/todo-workflow/excel-domain.md`
3. Read and **execute** `~/.cursor/skills/gstack-qa-only/SKILL.md`

## Must-test matrix (when feature exists)

| Case | Expect |
|------|--------|
| Create todo with date | Appears on that calendar day |
| Edit date | Moves between days |
| Priority 높음/중간/낮음 | 표시 3/2/1 (or UI equivalent) |
| Progress 0 / mid / 1 | 상태 시작전 / 진행중 / 완료 |
| 구분 + icon setting | Calendar shows mapped icon |
| Filter by 카테고리/상태 | Calendar + list respect filter |
| >N todos same day | Overflow affordance |
| Empty month | Calm empty state, no layout break |

## Rules

- **Report only** — no code fixes in this skill
- Bugs → hand off to `todo-investigate`
- Visual slop (not functional) → note and suggest `todo-design-review`
