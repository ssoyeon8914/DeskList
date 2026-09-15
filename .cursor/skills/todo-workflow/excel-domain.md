# Excel → App Domain (To_do_list_2.2)

Source of truth for product behavior: `docs/To_do_list_2.2.xlsx`.

## Sheets → Product modules

| Excel | App module | Notes |
|-------|------------|-------|
| 할일 (`할일표`) | Todo CRUD | Single source of truth |
| 달력 | Month calendar view | Read model from todos by date |
| 세팅 (`구분표`) | Type ↔ icon settings | Master for 구분 dropdown + calendar icons |
| 피벗 + slicers | Filters + stats | Do **not** recreate Excel pivot; use app query/filter state |
| 만다라트 | Goal board | Independent; not wired to todos unless MVP says so |
| 설명서 | Docs/about | Out of product scope for MVP unless asked |

## Todo fields

| Field | Source | Values / rules |
|-------|--------|----------------|
| 구분 | input | From 구분표 (e.g. 일정, 할일) |
| 날짜 | input | Date |
| 카테고리 | input | Free text |
| 우선순위 | input | 높음 / 중간 / 낮음 |
| 표시 | derived | MATCH: 낮음→1, 중간→2, 높음→3 |
| 업무 | input | Title |
| 진행률 | input | 0..1 |
| 비고 | input | Optional |
| 상태 | derived | 1→완료, 0→시작전, else→진행중 |

## Calendar rules

- 5 weeks × 7 days (Sun–Sat by default; respect 시작일 setting if implemented)
- Per day: icon, priority display, title, progress; max ~8 visible + overflow
- Today / weekend visual treatment
- Completed title treatment when progress === 1

## Filters (replace slicers)

월, 날짜, 카테고리, 우선순위, 구분, 상태 — filter todos → calendar + stats.

## Stats (replace GETPIVOTDATA)

Counts by 상태 / 우선순위, completion ratio. Derive from filtered todo list only.

## Out of scope unless explicitly added

- Excel RAND decorative art
- Sheet protection / password UX
- Shipping, deploy, PR land, canary
- Pixel-perfect Excel clone of pivot sheet UI
