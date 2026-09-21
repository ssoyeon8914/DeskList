# 목업 리뷰 노트

목업: `mockups/index.html`  
기준: `docs/기능분석.md`, `DESIGN.md`

---

## 디자인

| 항목 | 결정 | 비고 |
|------|------|------|
| E(본문)+B(네비) | ✅ | `DESIGN.md` / tokens |
| 모바일 우선 | 달력 / 할일 | 목업 반응형 유지 |

---

## 기능 · IA

| # | 질문 | 결정 |
|---|------|------|
| 1 | 달력 우측 연/월/시작일 P0? | ✅ 목업 그대로 |
| 2 | 할일 KPI·슬라이서·차트 P0? | ✅ 목업에 있는 것 |
| 3 | Note + Check List | ❌ Out (현재 목업 없음) |
| 4 | 만다라트 | ✅ 네비+보드 P0 · 양방향 연동 Out |
| 5 | 하루 셀 8/16 + overflow | ✅ |
| 6 | 비고 달력 표시 | Out (폼만) |

상세: [`docs/mvp-scope.md`](./mvp-scope.md)

---

## 합의 후

- [x] `docs/mvp-scope.md` — 목업 구현분만 MVP
- [x] `DESIGN.md` 확정 (E+B)
- [x] `docs/specs/mvp-backlog.md` — T0–T9
- [x] `docs/eng-plan.md` — 아키텍처 잠금
- [ ] Phase 1 본구현 (T0부터)
- [ ] `docs/작업계획서.md` P0/P1 갱신 (선택)
