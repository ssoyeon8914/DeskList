# Project constraints (all todo-* skills)

## Hard exclusions

- Do **not** plan or implement deploy, release, PR ship, land-and-deploy, canary, hosting setup.
- Do **not** recreate Excel pivot tables / slicer UI as Excel; replace with lean filter state + aggregates.
- Do **not** add features outside the agreed MVP / current spec ticket.

## Mockup-first change loop (post-MVP)

기능·UI 변경은 아래 순서를 **반드시** 지킨다. 사용자가 명시적으로 “본구현만” / “코드 바로”를 요청한 경우만 예외.

1. **`mockups/` 먼저** 수정 (HTML/CSS/JS).
2. 목업을 브라우저에서 확인·설명하고 **사용자 컨펌**을 받는다.
3. 컨펌 후에만 React 본구현(`src/`)을 목업과 맞춰 수정한다.
4. 컨펌 전 `src/` 구현·대규모 리팩터 금지. (치명 버그 핫픽스는 예외로 짧게 묻고 진행 가능.)
5. 안내·확인 UI는 native `alert`/`confirm` 금지 — 목업 `DLModal` (`mockups/js/modal.js`) 패턴을 쓴다. 컨펌 후 본구현에도 동일 모달 UX를 맞춘다.

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
