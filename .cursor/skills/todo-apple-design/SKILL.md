---
name: todo-apple-design
description: >-
  Apple HIG–grounded UI review (dickwu/apple-design-skill): accessibility,
  layout, typography, craft, non-templated polish. Use when reviewing mockups
  against HIG, a11y/contrast, desktop web-app conventions, Liquid Glass/materials,
  or "make this less generic" with platform craft—not full marketing rebuilds.
---

# Todo Apple Design

Project wrapper around [apple-design-skill](https://github.com/dickwu/apple-design-skill).

## Step 0

1. Read `.cursor/skills/todo-workflow/constraints.md`
2. Read `.cursor/skills/todo-workflow/excel-domain.md`
3. Read and **execute** `.cursor/skills/apple-design/SKILL.md`

## References (required by upstream)

Skill root: `.cursor/skills/apple-design/`

- Always load (as upstream says): `references/hig/accessibility.md`, `layout.md`, `typography.md`, `color.md`
- For this web mockup treat as **Desktop** craft: also `designing-for-macos.md` principles translated to browser (keyboard, density, settings patterns)—do not invent native menu bars
- Route other topics via `references/hig-lookup.md`

## DeskList translation

| Upstream focus | Apply as |
|----------------|----------|
| Lists / tables | todos table + editor |
| Settings | 구분/아이콘 settings page |
| Calendar density | month grid cells, overflow |
| Accessibility | contrast, control size, labels (Korean) |

## Modes

- **Review / audit** — findings with What / Why (cite HIG file+heading) / Fix; default report-first unless user asked to implement
- **Improvement** — token + signature element plan, then sequenced fixes; stay inside `mockups/`

## Do not

- Deploy, ship, App Store packaging
- Replace Excel-domain field rules for the sake of HIG aesthetics
