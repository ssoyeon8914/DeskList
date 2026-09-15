# Project constraints (all todo-* skills)

## Hard exclusions

- Do **not** plan or implement deploy, release, PR ship, land-and-deploy, canary, hosting setup.
- Do **not** recreate Excel pivot tables / slicer UI as Excel; replace with lean filter state + aggregates.
- Do **not** add features outside the agreed MVP / current spec ticket.

## Lean code

- One source of truth for todos; calendar and stats are derived views.
- Derived fields (`표시`, `상태`) computed in one place (shared helper), not duplicated in UI.
- No premature abstraction, no unused modules, no “just in case” config layers.
- Prefer the smallest change that matches Excel behavior for the current scope.

## Anti AI-slop UI

- One composition per primary view (calendar or list), not a generic dashboard collage.
- No default Inter/Roboto/Arial stacks; expressive purposeful type from DESIGN.md.
- No flat single-color only; atmosphere via gradient/pattern/image per DESIGN.md.
- Avoid: purple-on-white / purple-indigo gradients, cream+#terracotta serif cliché, broadsheet dense columns, glow stacks, rounded-full pill clusters, emoji decoration spam, card grids in heroes.
- Cards only when they wrap a real interaction; otherwise flatten.
- Motion: 2–3 intentional motions max for presence, not noise.

## Language

- Respond to the user in Korean unless they ask otherwise.
- Product UI copy: Korean by default.
