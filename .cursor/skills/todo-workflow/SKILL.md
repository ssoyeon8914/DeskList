---
name: todo-workflow
description: >-
  Routes the To-do-list (Excel 2.2) build through lean project skills only:
  office-hours, spec, design, eng review, qa-only, investigate, diagram.
  Use when starting the app, asking which skill next, MVP scope, or
  Excel-based to-do/calendar implementation workflow. Excludes deploy/ship.
---

# Todo Workflow Router

## Before anything

1. Read [constraints.md](constraints.md)
2. Read [excel-domain.md](excel-domain.md)

## Skill map (complete set)

| Phase | Project skill | When |
|-------|---------------|------|
| 1 Scope | `todo-office-hours` | MVP / what to cut |
| 2 Spec | `todo-spec` | Executable tickets |
| 3 Design system | `todo-design-consultation` | No DESIGN.md yet |
| 3b Plan UI check | `todo-plan-design-review` | Plan has UI; catch slop before code |
| 3c Variants | `todo-design-shotgun` | Stuck choosing a look |
| 3c′ Anti-slop redesign | `todo-hallmark` | 밤티 / Hallmark build·audit·redesign·study |
| 3c″ HIG craft review | `todo-apple-design` | Apple HIG + a11y + platform craft |
| 3c‴ UX orchestration | `todo-uiux` | Multi-specialist UI/UX package |
| 3d HTML lock | `todo-design-html` | Design approved → HTML/CSS |
| 4 Architecture | `todo-plan-eng-review` | Lock data model + lean modules |
| 4b Flow diagram | `todo-diagram` | Only if flow is unclear |
| 5 Code | (implement per locked spec) | After eng + design lock |
| 6 QA report | `todo-qa-only` | Test, do not fix |
| 6b Debug | `todo-investigate` | Bugs with root cause first |
| 6c Visual polish | `todo-design-review` | After UI exists |

## Default order

```
todo-office-hours
  → todo-spec
  → todo-design-consultation
  → todo-plan-design-review   (if plan includes UI)
  → todo-plan-eng-review
  → implement
  → todo-qa-only
  → todo-investigate          (only if bugs)
  → todo-design-review
```

Optional side paths: `todo-design-shotgun`, `todo-design-html`, `todo-diagram`.

## Routing rules

- User asks “뭐부터?” / “다음 스킬?” → point to the next incomplete phase above.
- User starts coding with no MVP → run `todo-office-hours` first (do not code yet).
- User wants UI look with no DESIGN.md → `todo-design-consultation`.
- Deploy / ship / PR land mentioned → refuse that track; stay on build/QA skills above.

## How to run a phase skill

Read that skill’s `SKILL.md` under `.cursor/skills/<name>/` and follow it completely.
Each phase skill loads gstack methodology when available and applies this repo’s constraints.
