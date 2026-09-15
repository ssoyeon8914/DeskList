---
name: todo-spec
description: >-
  Turns To-do Excel MVP intent into lean executable specs/tickets (CRUD,
  calendar, filters, derived status). Use when writing backlog items, filing
  issues, or splitting implementation after office-hours. Invokes gstack spec
  with excel-domain constraints; no deploy tickets.
---

# Todo Spec

## Step 0

1. Read `.cursor/skills/todo-workflow/constraints.md`
2. Read `.cursor/skills/todo-workflow/excel-domain.md`
3. If `docs/mvp-scope.md` (or latest scope doc) exists, read it
4. Read and **execute** `~/.cursor/skills/gstack-spec/SKILL.md`

## Project overlay

- Specs must map to Excel modules in excel-domain; do not invent features outside MVP In-list.
- Each ticket: **user-visible outcome**, **data touched**, **out of scope**, **acceptance checks**.
- Prefer vertical slices: e.g. “할일 추가 → 달력 당일 칸에 표시” over horizontal layers-only tickets.
- Never create deploy/release/infra tickets.
- Derived rules (`표시`, `상태`) belong in one shared acceptance criterion, not per-screen duplication.

## Suggested ticket order (adjust to MVP)

1. 구분표 settings + todo model + derived fields
2. Todo CRUD UI
3. Month calendar read model
4. Filters (if in MVP)
5. Stats (if in MVP)
6. 만다라트 / 루틴 (only if in MVP)

## Next

`todo-design-consultation` (if no DESIGN.md) then `todo-plan-eng-review`.
