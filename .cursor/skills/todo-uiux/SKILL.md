---
name: todo-uiux
description: >-
  Vendor-neutral UI/UX orchestrator (sergekostenchuk/ui-ux-agent-skill-system):
  routes product UX, design intelligence, webapp UI, design critic, and UX audit.
  Use for multi-step UI/UX work, three-direction exploration, UX audits, or when
  Hallmark alone is not enough and specialists must be coordinated.
---

# Todo UI/UX Orchestrator

Project wrapper around [ui-ux-agent-skill-system](https://github.com/sergekostenchuk/ui-ux-agent-skill-system) (Apache-2.0).

Vendored at: `.cursor/vendor/ui-ux-agent-skill-system/`

## Step 0

1. Read `.cursor/skills/todo-workflow/constraints.md` (**no deploy** overrides any `deploy-orchestrator` / infra skills)
2. Read `.cursor/skills/todo-workflow/excel-domain.md`
3. Read and **execute**  
   `.cursor/vendor/ui-ux-agent-skill-system/core/skills/senior-ui-ux-orchestrator/SKILL.md`

## Specialist map (DeskList-relevant only)

Load from `core/skills/<name>/SKILL.md` when the orchestrator routes there:

| Need | Skill folder |
|------|----------------|
| Design intelligence / palettes | `ui-ux-pro-max` |
| Dense app UI (tables, filters, states) | `webapp-ui-skill` |
| Visual anti-slop critique | `design-critic-skill` |
| UX audit (evidence-ranked) | `ux-audit-skill` |
| Product journeys | `ui-ux-llm-product-architect` |
| Three directions | orchestrator + critic (prefer also `todo-hallmark` / `todo-design-shotgun` for variants) |

Shared contracts (read when validating):

- `core/shared/anti-patterns.md`
- `core/shared/reporting-contract.md`
- `core/shared/design-tokens.md`

## Hard exclusions for this repo

Even if the package includes them, **do not run** without explicit user override:

- `deploy-orchestrator`, `infra-launch-orchestrator`, `launch-readiness-auditor`
- domain/DNS/server provisioners
- paid-traffic / SERP growth skills (out of MVP)

## Output

Follow upstream reporting: distinguish `Ran` / `Skipped` / `Planned` / `Manual`.  
Respond to the user in Korean unless they ask otherwise.
