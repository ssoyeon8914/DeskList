# MVP Spec · DeskList

기준: [`docs/mvp-scope.md`](../mvp-scope.md) · 목업 `mockups/js/store.js`  
스택 가정(eng review에서 잠금): React+Vite+TS · Router · localStorage · E+B CSS  
**배포/GitHub Issue 없음** — 로컬 백로그만.

## 공유 수용 기준 (모든 CRUD·뷰 티켓에 적용)

**표시** `displayOf(priority)`  
- 높음→3 · 중간→2 · 낮음→1 · 그 외→1  

**상태** `statusOf(progress)` (진행률 0–100 정수)  
- ≤0 → 시작전 · ≥100 → 완료 · 그 외 → 진행중  

파생은 **한 헬퍼**에서만. UI/달력/KPI가 각자 재계산하지 않음.

---

## 티켓 순서 (수직 슬라이스)

| ID | 제목 | 의존 | 상태 |
|----|------|------|------|
| T0 | 앱 셸 · 라우팅 · DESIGN 토큰 | — | ✅ |
| T1 | 도메인 + 스토어 + seed | T0 | ✅ |
| T2 | 설정: 구분↔아이콘 | T1 | ✅ |
| T3 | 할일 CRUD → 스토어 반영 | T1–T2 | ✅ |
| T4 | 월간 달력 투영 | T3 | ✅ |
| T5 | 필터 (달력·할일 공유) | T3–T4 | ✅ |
| T6 | 할일 KPI + 주간 패널 | T5 | ✅ |
| T7 | 만다라트 | T1 | ✅ |
| T8 | 목업 갭 수정 (시작일 동기 · 만다라트 날짜) | T4–T7 | ✅ |
| T9 | 패리티 수동 검증 | T0–T8 | ✅ |

상세: 아래 각 섹션.

---

## T0 · 앱 셸 · 라우팅 · DESIGN 토큰

**Outcome:** `/` 진입 + 네비로 달력·할일·만다라트·설정 이동. E+B 룩 적용된 빈 레이아웃.

**Data:** 없음

**Out:** 비즈니스 로직, 배포 설정

**Accept**
- [ ] 라우트 4개 + 현재 페이지 `aria-current`
- [ ] `tokens.css` / 헤더 B · 본문 E 그리드가 목업과 동일 계열
- [ ] Vite build 성공

---

## T1 · 도메인 + 스토어 + seed

**Outcome:** 앱 재시작 후에도 seed/할일/구분/만다라트/필터/캘린더 뷰 상태가 유지된다.

**Data:** todos, types, filters, calendar, week, mandala(81), selectedId · key 예 `desklist/v1`

**Out:** 서버 API, 마이그레이션 UI

**Accept**
- [ ] `enrich`로 display/status 공유 규칙 충족 (위)
- [ ] `upsertTodo` / `deleteTodo` / `resetSeed`
- [ ] 구분 이름 변경 시 할일·필터 type cascade (목업과 동일)
- [ ] 단위 테스트 또는 수동: progress 0/50/100 → 상태 3종

---

## T2 · 설정: 구분↔아이콘

**Outcome:** 설정에서 구분을 추가·수정·삭제하면 할일 드롭다운·달력 아이콘에 반영된다.

**Data:** `types[]` {name, icon}

**Out:** 아이콘 피커 라이브러리, 다국어

**Accept**
- [ ] 최소 1개 유지
- [ ] 추가/저장/삭제 · 미리보기
- [ ] 샘플 초기화(전체 seed) 확인 다이얼로그
- [ ] 할일 폼 type select가 최신 types를 읽음

---

## T3 · 할일 CRUD → 스토어 반영

**Outcome:** 표에서 선택·사이드 폼으로 추가/수정/삭제하면 목록이 즉시 갱신된다.

**Data:** todo 필드 전부(비고 포함) · 표에는 비고 컬럼 없음(목업)

**Out:** Note/Check List 위젯, 달력 링크(P1)

**Accept**
- [ ] 새 행 · 저장 · 삭제 confirm
- [ ] 진행률 range+number · 표시/상태 라이브 미리보기
- [ ] 새 카테고리 → 필터 categories에 포함
- [ ] 새로고침 후 데이터 유지

---

## T4 · 월간 달력 투영

**Outcome:** 할일을 저장하면 해당 날짜 칸에 아이콘·표시·제목·진행 바가 보인다.

**Data:** calendar {year,month,weekStartsOn,density} · monthFilteredTodos (날짜 슬라이서 무시)

**Out:** overflow 펼침, DnD

**Accept**
- [ ] 연▲▼ · 월 1–12 · 시작일 sun/mon · 6×7 그리드
- [ ] density 8/16 · `+N 더보기` 텍스트만
- [ ] >8 warn / >16 alert
- [ ] 오늘·타월 muted · progress≥100 done 스타일
- [ ] 날짜 클릭 → `/todos?date=YYYY-MM-DD`

---

## T5 · 필터 (공유)

**Outcome:** 구분·카테고리·상태·우선순위 토글이 달력 칸과 할일 표에 같이 적용된다. 필터 해제로 기본값 복귀.

**Data:** filters {types, priorities, categories, statuses, dates}

**Out:** `#date-slicer` UI, Excel 피벗

**Accept**
- [ ] pressed 토글 · 빈 그룹 = 매칭 없음(목업 규칙)
- [ ] 달력은 dates 무시 · 할일은 dates 적용
- [ ] 필터 해제 = seed 기본(전부 on + dates [])

---

## T6 · 할일 KPI + 주간 패널

**Outcome:** 필터된 목록 기준 KPI와 주간 칸으로 날짜 범위를 좁힐 수 있다.

**Data:** week {year,month,weekIndex,weekStartsOn} · stats(파생)

**Out:** 별도 차트 라이브러리 필수화, 주차 동적 weekCount UI(목업은 1–6 고정 OK)

**Accept**
- [ ] KPI: 전체/시작전/진행중/완료 · 완료율 · 우선순위 완료/전체
- [ ] 주간 칸 클릭: 하루 / 재클릭·주전체 → 주 7일 dates
- [ ] `?date=` 진입 시 해당일 필터
- [ ] **weekStartsOn이 calendar와 동기** (T8과 묶어도 됨)

---

## T7 · 만다라트

**Outcome:** 9×9 편집이 자동 저장되고, 세부↔미러 동기, 선택 칸을 할일로 보낼 수 있다.

**Data:** mandala[81]

**Out:** 양방향 목표 진행 연동

**Accept**
- [ ] debounce 저장 · 저장됨 표시
- [ ] sub-c ↔ mirror readonly 동기
- [ ] →할일: type=할일, category=만다라트, **date=오늘(또는 UX에서 고른 날)** — 하드코딩 금지
- [ ] 만다라트만 / 전체 seed 초기화 경로

---

## T8 · 목업 갭 수정

**Outcome:** mvp-scope의 두 교정 항목이 본구현에 반영된다.

**Accept**
- [ ] calendar.weekStartsOn ↔ week.weekStartsOn 단일 소스 또는 양방향 동기
- [ ] 만다라트→할일 날짜 하드코딩 제거

---

## T9 · 패리티 수동 검증

**Outcome:** 목업과 본구현이 핵심 루프에서 동일하게 동작한다고 체크리스트로 확인.

**Accept**
- [x] 할일 추가 → 달력 당일 표시
- [x] 필터 off → 달력·표·KPI 동시 축소
- [x] 설정 아이콘 변경 → 달력 반영
- [x] 만다라트 보내기 → 할일 목록 등장
- [x] resetSeed 후 샘플 복원
- [x] (선택) `todo-qa-only` 리포트 → [`.gstack/qa-reports/qa-report-t9-parity-2026-09-15.md`](../../.gstack/qa-reports/qa-report-t9-parity-2026-09-15.md)

---

## Out of backlog (명시)

배포 · 피벗 UI · Note/Check List · 인증 · import/export · 반복할일

---

## 다음 스킬

1. [x] `todo-plan-eng-review` — [`docs/eng-plan.md`](../eng-plan.md)  
2. **구현 시작** — backlog T0 (Vite 셸 · 라우팅 · E+B 토큰)
