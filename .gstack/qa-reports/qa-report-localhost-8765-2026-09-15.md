# QA Report — DeskList mockups (`localhost:8765`)

| Field | Value |
|-------|-------|
| Date | 2026-09-15 |
| Target | `http://localhost:8765/` (`mockups/`) |
| Mode | Full (MVP matrix) |
| Framework | Static HTML + shared `store.js` (localStorage) |
| Duration | ~25 min |
| Pages | index, todos, calendar, settings, mandalart |
| Screenshots | `.gstack/qa-reports/screenshots/` |
| Health score | **98 / 100** |
| Fixes in this run | **None** (qa-only) |

## Summary counts

| Severity | Count |
|----------|------:|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 3 |

## Must-test matrix

| Case | Result |
|------|--------|
| Create todo with date → calendar day | **Pass** — `QA검증용 할일` on 2026-09-20 |
| Edit progress → derived 상태 | **Pass** — 50% → `진행중` |
| Priority 높음 → 표시 3 | **Pass** — enrich `display: 3` |
| Filter by category | **Pass** — QA only → 1 row; calendar respects shared filters |
| 구분 icon setting → calendar | **Pass** — 할일 `📌` reflected on Sep cells |
| >N same day → overflow | **Pass** — Sep 16 `+2 더보기` at density 8 |
| Empty month | **Pass** — Jan 2026 calm empty cells |
| Mandala auto-save / reload | **Pass** — `QA만다라저장` survives reload |

## Health score breakdown

| Category | Score | Weight | Notes |
|----------|------:|-------:|-------|
| Console | 100 | 15% | No JS errors observed in session |
| Links | 100 | 10% | Nav between 4 modules OK |
| Visual | 97 | 10% | ISSUE-003 |
| Functional | 100 | 20% | Matrix green |
| UX | 92 | 15% | ISSUE-001 |
| Performance | 100 | 10% | Static pages snappy |
| Content | 97 | 5% | ISSUE-004 |
| Accessibility | 97 | 15% | ISSUE-002 |
| **Weighted** | **98** | | |

## Issues

### ISSUE-001 — Sticky header intercepts filter clicks (Medium · UX)

- **Where:** `todos.html` filter chips after scroll
- **What:** Click on 「프로모션」 failed with interception by top header (`div` 1182×56). Needed programmatic scrollIntoView/click to toggle.
- **Repro:**
  1. Open `/todos.html`, scroll so filters sit under sticky header
  2. Click a category chip near the top of the viewport
  3. Click may be swallowed; filter state unchanged
- **Evidence:** Browser click intercept error during QA; filter still worked when scrolled into view via script
- **Impact:** Users can think filters are broken

### ISSUE-002 — Progress slider exposed as readonly (Low · Accessibility)

- **Where:** Todo editor progress control
- **What:** Accessibility tree marks the range slider `readonly`; progress still editable via number spinbutton
- **Repro:** Open editor → inspect progress slider role states
- **Impact:** AT / keyboard users may skip the slider and only find the number field

### ISSUE-003 — Filter-reset icon may not render as glyph (Low · Visual)

- **Where:** Calendar rail 「필터 해제」, todos filter reset
- **What:** Intended Material Symbol `restart_alt`; screenshot/UI can show text fallback or odd glyph instead of icon
- **Impact:** Visual polish only; button still labeled and clickable

### ISSUE-004 — Mixed EN/KO page chrome (Low · Content)

- **Where:** Headings: Planner / Monthly Planner / Mandala Goal Chart
- **What:** Primary H1 English while nav/actions are Korean
- **Impact:** Brand taste; not a functional defect

## Top 3 things to fix

1. **ISSUE-001** — Sticky header vs filter hit-testing on todos
2. **ISSUE-002** — Progress slider a11y (writable range or hide from AT if decorative)
3. **ISSUE-003** — Ensure reset icon font loads or use a reliable SVG

## Console health

No console errors captured during navigation and CRUD flows.

## Out of scope / not tested deeply

- Delete confirmation edge cases
- 「선택 칸 → 할일로 보내기」 full path (button disabled until cell selected)
- Mobile viewport 375×812
- Cross-browser (Chromium only)

## Next skills (suggested)

- Bugs → `todo-investigate` (start with ISSUE-001)
- Visual polish → `todo-design-review`
- Scope lock after mock acceptance → `docs/mvp-scope.md` / `todo-office-hours`

## Baseline

See `baseline.json` in this folder.
