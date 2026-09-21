# DESIGN · DeskList (E+B 확정)

목업 `mockups/css/tokens.css` · `mockups/css/mock.css`와 동기화.

## Aesthetic

**E · Grid Signal** 본문 + **B · Studio Blueprint** 상단 네비 하이브리드.

- 본문: Archivo, 노출 12열 그리드, 울트라마린 `--signal`, 각진 패널·셀
- 네비: Outfit, 대문자 `DESKLIST`, 시안 `--bp-cyan` 밑줄·구분선, **불투명** `--paper-solid` 배경

## Anti-patterns (금지)

- 보라/인디고 그라데이션 기본 테마
- 크림 + 테라코타 세리프 클리셰
- 대시보드형 카드·통계 칩 나열을 첫 화면 주인공으로
- Inter / Roboto / Arial / system-only
- 다크모드 기본, 글로우, pill 클러스터, 이모지 장식 스팸

## Typography

| Token | Stack | 용도 |
|-------|-------|------|
| `--font-sans` | Archivo, Noto Sans KR, Apple SD Gothic Neo, sans-serif | 본문·제목·UI |
| `--font-nav` | Outfit, Noto Sans KR, sans-serif | 상단 브랜드·네비 |
| `--font-mono` | Archivo, IBM Plex Mono, monospace | 수치·코드 |

페이지 제목: lowercase, 800 weight, `--signal` 3px 바 (::after)

### 표 · 에디터 위계

| 역할 | 크기 | 비고 |
|------|------|------|
| 에디터 업무(`#title`) | 1rem / 600 | 폼 주 정보 |
| 에디터 메타(구분·날짜·카테고리·우선순위) | 0.875rem / 500 | |
| 에디터 비고 | 0.8125rem / 400 | |
| 필드 라벨 | 0.6875rem / 700 | uppercase muted |
| 표 th | 0.6875rem / 700 | uppercase muted |
| 표 업무 열 | 0.875rem / 600 | 행의 주 정보 |
| 표 기타 셀 | 0.8125rem | |

## Color tokens

| Token | Value | 용도 |
|-------|-------|------|
| `--signal` | `oklch(45% 0.19 264)` | CTA, 오늘, 진행, 일요일 |
| `--ink` | `oklch(16% 0.01 255)` | 본문, 선택 칩 |
| `--paper` | `oklch(99% 0.003 255)` | 베이스 |
| `--grid-line` | `rgba(20,24,40,0.06)` | 배경 모눈 |
| `--bp-navy` | `#1a2a3a` | 브랜드·현재 nav |
| `--bp-cyan` | `#5ba4b5` | nav 밑줄·헤더 border |
| `--bp-muted` | `#3d5163` | nav 링크 |
| `--line` | `rgba(20,24,40,0.22)` | 패널·그리드 테두리 |
| `--done` | `oklch(50% 0.02 255)` | 완료 텍스트 |

레거시 `--accent` = `--signal`, `--ink-muted` = 보조 라벨.

## Layout

- 최대 폭 72rem, 좌우 여백
- 달력: 7열 그리드, gap 0, 셀 border-right/bottom
- 할일: 테이블 + 폼 (카드화 최소)
- 설정: 단순 행 편집

## Motion (최대 3)

1. 페이지 `fade-in` (~200ms)
2. 일차 셀 hover 배경
3. (예약) 월 전환 opacity

## Components

- **네비 (B)**: 불투명 `--paper-solid` 배경, 시안 하단 border, 현재 페이지 `box-shadow` 밑줄
- **달력 셀 (E)**: 반투명 white fill, 오늘 `inset 2px signal`
- **필터 칩**: off=white border / on=`--ink` fill
- **월 버튼**: on=`--signal` fill
- **버튼**: 각진 모서리, primary=`--signal`
- **모달 (DLModal)**: native `alert`/`confirm` 금지. 반투명 ink 오버레이 + 각진 패널, 제목 아래 signal 바. 확인/알림·위험 액션(`btn--danger`). 목업 `js/modal.js` · 이후 안내·확인 UI는 모두 이 패턴.
