---
name: todo-hallmark
description: >-
  Anti-AI-slop UI via Hallmark (usehallmark.com / nutlope/hallmark): build,
  audit, redesign, or study design DNA. Use when the mockup looks AI-generated,
  user says 밤티/slop, wants redesign, hallmark audit/study, or fresh visual
  direction for DeskList pages. Prefer before freestyle restyling.
---

# Todo Hallmark

Project wrapper around [Hallmark](https://www.usehallmark.com/) ([nutlope/hallmark](https://github.com/nutlope/hallmark)).

## Step 0

1. Read `.cursor/skills/todo-workflow/constraints.md` (Anti AI-slop + **no deploy**)
2. Read `.cursor/skills/todo-workflow/excel-domain.md`
3. Read and **execute** `.cursor/skills/hallmark/SKILL.md` completely

## Verbs (pass through)

| User ask | Hallmark verb |
|----------|----------------|
| 밤티 / 다시 디자인 / build look | default **Design flow** |
| 감사만 / 리포트만 | `hallmark audit` — **no edits** |
| 구조 바꿔 redesign | `hallmark redesign` — keep routes/store |
| URL·스크린샷 DNA | `hallmark study` |

## DeskList boundaries

- Surfaces: `mockups/` calendar · todos · settings · mandalart (not marketing landing spam)
- Keep: single todo store, derived calendar, Korean UI copy
- Do **not** invent deploy/hosting steps even if Hallmark themes suggest a “product site”
- After a winning theme: update `DESIGN.md` + `mockups/css/tokens.css`, then optional `todo-design-html`

## Conflict with other design skills

- Structural anti-slop / theme catalog → **this skill** (`todo-hallmark`)
- Apple HIG / a11y / platform craft → `todo-apple-design`
- Multi-specialist UX orchestration → `todo-uiux`
