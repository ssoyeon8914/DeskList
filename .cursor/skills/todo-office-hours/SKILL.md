---
name: todo-office-hours
description: >-
  Scopes the Excel-based To-do calendar MVP: what to build vs cut (만다라트,
  routines, stats). Use before coding when brainstorming, choosing wedge, or
  asking if the full Excel feature set is worth building. Invokes gstack
  office-hours with project constraints.
---

# Todo Office Hours

## Step 0

1. Read `.cursor/skills/todo-workflow/constraints.md`
2. Read `.cursor/skills/todo-workflow/excel-domain.md`
3. Read and **execute** `~/.cursor/skills/gstack-office-hours/SKILL.md` (Builder mode preferred for this side project unless user wants Startup mode).

## Project overlay

Force these questions into the session (if gstack does not already cover them):

1. **Wedge:** 할일 + 월간 달력 only, or also 필터/통계 / 만다라트 / 루틴 체크리스트?
2. **Parity:** Excel 수식·슬라이서 동작 중 “반드시 동일” vs “앱답게 단순화” 목록
3. **Non-goals:** 배포·피벗 UI 복제·장식용 RAND 아트는 제외 확인
4. **Success:** “할일 입력 → 달력 반영”이 첫 성공 기준인지 확인

## Output

- Short design/scope doc saved under `docs/` (e.g. `docs/mvp-scope.md`) unless user forbids files
- Explicit **In / Out** lists
- Recommended next skill: `todo-spec`
