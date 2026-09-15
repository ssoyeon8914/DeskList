# 목업 관련 플랜 히스토리

Cursor 세션에서 사용한 목업 플랜을 프로젝트에 보관합니다.  
원본 위치: `%USERPROFILE%\.cursor\plans\`

| 순서 | 파일 | 원본 id | 시점·요지 | 당시 상태 |
|------|------|---------|-----------|-----------|
| 1 | [01-mockup-first-calendar-centric.md](./01-mockup-first-calendar-centric.md) | `mockup_first_plan_729789e8` | 정적 HTML, **달력 중심 1화면** + 패널 IA 초안 | todos pending |
| 2 | [02-mockup-first-three-pages.md](./02-mockup-first-three-pages.md) | `mockup_first_plan_55c6cda3` | **달력·할일·설정 분리 페이지**로 IA 확정 | todos completed |
| 3 | [03-mockup-scope-react-app.md](./03-mockup-scope-react-app.md) | `mockup_scope_app_65a21780` | 목업 4화면 범위의 **React+Vite 본구현** 계획 | todos pending |

## 실제 진행과의 관계 (보관 시점 메모)

- 플랜 1 → 2로 **IA가 1화면에서 분리 페이지로 변경**됨. 이후 만다라트 네비 추가 → 4화면.
- 정적 목업(`mockups/*.html`) 구현 후, React 본구현(플랜 3) 전에 **동적 목업**(`mockups/js/store.js` + localStorage)을 먼저 넣음.
- 플랜 3의 React 스캐폴딩은 이 히스토리 보관 시점 기준으로는 아직 착수 전일 수 있음. 최신 상태는 저장소·대화 맥락을 따름.

## 관련 문서

- [docs/mockup-brief.md](../mockup-brief.md)
- [docs/mockup-notes.md](../mockup-notes.md)
- [docs/작업계획서.md](../작업계획서.md)
- [docs/기능분석.md](../기능분석.md)
