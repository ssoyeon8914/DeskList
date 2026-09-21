# DeskList T9 패리티 QA — localhost:5173

**Date:** 2026-09-15  
**Target:** React app (`npm run dev`) · seed `desklist/v1`  
**Scope:** mvp-backlog T9 checklist

## Verdict: PASS

핵심 루프(추가 → 달력/주간 표시 → 필터 → 설정 아이콘 → 만다라트 보내기 → resetSeed) 목업 패리티 확인.

## Checklist

| # | Case | Result | Notes |
|---|------|--------|-------|
| 1 | 할일 추가 → 달력/주간 당일 표시 | PASS | `T9패리티검증` → 9/15 주간 칸 |
| 2 | 필터 off → 표·KPI 축소 | PASS | 할일 off 시 13→3 즉시 반영 (아래 수정 후) |
| 3 | 설정 아이콘 변경 → 달력 반영 | PASS | 할일 ✔️→⭐ 후 주간/목록 반영 |
| 4 | 만다라트 → 할일 | PASS | 「콘텐츠 루틴」 오늘(9/15)·카테고리 만다라트·필터 자동 포함 |
| 5 | resetSeed 샘플 복원 | PASS | 18건 seed · 아이콘 ✔️ · 9/15 비움 · 카테고리 프로모션만 |

## Bugs found & fixed in T9

1. **Store 불변성** — mutation이 같은 `AppState` 참조를 유지해 `useSyncExternalStore`가 리렌더하지 않음. `persist()`/토글/upsert를 불변 업데이트로 수정.
2. **만다라트 SRC 인덱스** — sub-c가 27–29가 아니라 **30–32 / 39,41 / 48–50**. `mandalaMeta.ts` 교정 → 미러가 세부와 동기.
3. **선택 칸 UX** — `onFocus`만으로는 일부 클릭 경로에서 `selected` 미설정. `onMouseDown` 추가.

## Residual / non-blocking

- 설정 화면 draft 입력값이 reset 직후 한 틱 늦게 맞춰질 수 있음(미리보기·options는 즉시 ✔️).
- Vitest: `derive.test.ts` 8/8 PASS.

## Next (optional)

- `todo-design-review` 시각 폴리시  
- 배포는 사용자 명시 전까지 보류
