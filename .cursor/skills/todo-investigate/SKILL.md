---
name: todo-investigate
description: >-
  Root-cause debugging for To-do app issues (calendar not updating, wrong
  status, filter mismatches). Use on bugs/errors; no fix without cause.
  Invokes gstack investigate with domain hypotheses.
---

# Todo Investigate

## Step 0

1. Read `.cursor/skills/todo-workflow/constraints.md`
2. Read `.cursor/skills/todo-workflow/excel-domain.md`
3. Read and **execute** `~/.cursor/skills/gstack-investigate/SKILL.md`

## Domain hypothesis cheatsheet

| Symptom | Check first |
|---------|-------------|
| Calendar missing item | Date field timezone/normalization; filter excluding row; derived view not subscribed to store |
| Wrong 상태 | Progress type (string vs number); completion threshold !== 1 |
| Wrong 표시 | Priority label mismatch (whitespace/case); mapping table drift |
| Icon wrong/missing | 구분표 lookup; todo.구분 value not in settings |
| Filter “broken” | Stats using unfiltered list; calendar using filtered — inconsistency |
| Overflow wrong | Off-by-one on max slots; sort order unstable |

## Rules

- Iron law: no patch without root cause written down
- Prefer fixing the single source of truth; avoid dual-write “sync hacks”
- After fix, re-run relevant `todo-qa-only` cases (or ask user to)
