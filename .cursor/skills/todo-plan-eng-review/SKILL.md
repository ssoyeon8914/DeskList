---
name: todo-plan-eng-review
description: >-
  Locks lean architecture for the To-do Excel app: single todo store, derived
  calendar/stats, no pivot clone. Use before coding when reviewing the plan,
  data model, or module boundaries. Invokes gstack plan-eng-review with
  anti-waste constraints.
---

# Todo Plan Eng Review

## Step 0

1. Read `.cursor/skills/todo-workflow/constraints.md`
2. Read `.cursor/skills/todo-workflow/excel-domain.md`
3. Read current plan/spec docs under `docs/`
4. Read and **execute** `~/.cursor/skills/gstack-plan-eng-review/SKILL.md`

## Architecture lock (must decide)

| Topic | Lean default |
|-------|----------------|
| Persistence | One todo collection/table; settings separate |
| Derived fields | Pure functions: priority→표시, progress→상태 |
| Calendar | Group todos by date for visible month; cap N + overflow |
| Filters | Client or query params object; not a parallel “slicer” subsystem |
| Stats | Reduce filtered todos; no OLAP layer |
| 만다라트 | Isolated module/state; no FK to todos unless spec says so |

## Reject

- Duplicating todo state into a “calendar events” store without sync need
- Excel formula engines / array-formula ports cell-by-cell
- Deploy, CI release, or multi-tenant infra “for later”

## Output

- Updated eng plan with module list + data flow
- Explicit “will not build” list
- Optional: run `todo-diagram` if the flow is still ambiguous
- Next: implement per `todo-spec` tickets
