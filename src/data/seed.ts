import type { AppState } from "../domain/types";

export function seedMandala(): string[] {
  return [
    "키워드 조사", "초안 작성", "교정", "촬영 리스트", "조명 세팅", "컷 편집", "채널 분석", "썸네일 A/B", "발행 캘린더",
    "레퍼런스", "콘텐츠 루틴", "주 3회 발행", "콘티", "영상 제작", "자막", "SEO 체크", "배포·성장", "커뮤니티",
    "피드백", "아카이브", "아이디어 노트", "B-roll", "사운드", "썸네일", "협업 문의", "지표 리뷰", "실험 로그",
    "주간 계획", "시간 블록", "방해 차단", "콘텐츠 루틴", "영상 제작", "배포·성장", "제품 로드맵", "고객 인터뷰", "프로토타입",
    "우선순위", "집중력", "회고", "집중력", "퍼스널 브랜드", "제품 실험", "가설 검증", "제품 실험", "출시 노트",
    "딥워크", "휴식 리듬", "도구 정리", "네트워킹", "건강·에너지", "수익 모델", "피드백 루프", "문서화", "회고 미팅",
    "커피챗", "커뮤니티", "멘토링", "수면", "운동", "식사", "구독 상품", "컨설팅", "디지털 굿즈",
    "소개 요청", "네트워킹", "행사 참석", "스트레칭", "건강·에너지", "산책", "가격 실험", "수익 모델", "정산 정리",
    "팔로업", "명함/링크", "감사 메시지", "물 섭취", "스크린 오프", "주간 체크", "리텐션", "업셀", "파트너십",
  ];
}

export function createSeed(): AppState {
  return {
    version: 1,
    types: [
      { name: "일정", icon: "🗓️" },
      { name: "할일", icon: "✔️" },
      { name: "회의", icon: "🎬" },
    ],
    weekStartsOn: "sun",
    calendar: { year: 2026, month: 9, density: 8 },
    week: { year: 2026, month: 9, weekIndex: 2 },
    filters: {
      dates: [
        "2026-09-13",
        "2026-09-14",
        "2026-09-15",
        "2026-09-16",
        "2026-09-17",
        "2026-09-18",
        "2026-09-19",
      ],
      types: ["일정", "할일", "회의"],
      priorities: ["높음", "중간", "낮음"],
      categories: ["프로모션"],
      statuses: ["시작전", "진행중", "완료"],
    },
    selectedId: null,
    todos: [
      { id: "t1", type: "일정", date: "2026-09-16", category: "프로모션", priority: "높음", title: "10:00 신제품 프로모션 미팅", progress: 0, note: "회의실" },
      { id: "t2", type: "할일", date: "2026-09-16", category: "프로모션", priority: "중간", title: "블로그 초안 작성", progress: 90, note: "" },
      { id: "t3", type: "할일", date: "2026-09-16", category: "프로모션", priority: "낮음", title: "자료 정리", progress: 40, note: "" },
      { id: "t4", type: "할일", date: "2026-09-16", category: "프로모션", priority: "중간", title: "카피 리뷰", progress: 10, note: "" },
      { id: "t5", type: "회의", date: "2026-09-16", category: "프로모션", priority: "높음", title: "촬영 준비", progress: 0, note: "" },
      { id: "t6", type: "할일", date: "2026-09-16", category: "프로모션", priority: "낮음", title: "키워드 조사", progress: 60, note: "" },
      { id: "t7", type: "할일", date: "2026-09-16", category: "프로모션", priority: "중간", title: "썸네일 스케치", progress: 20, note: "" },
      { id: "t8", type: "할일", date: "2026-09-16", category: "프로모션", priority: "낮음", title: "일정 공유", progress: 100, note: "" },
      { id: "t9", type: "할일", date: "2026-09-16", category: "프로모션", priority: "중간", title: "댓글 답변", progress: 0, note: "" },
      { id: "t10", type: "일정", date: "2026-09-16", category: "프로모션", priority: "낮음", title: "16:00 체크인", progress: 0, note: "" },
      { id: "t11", type: "할일", date: "2026-09-17", category: "프로모션", priority: "낮음", title: "블로그 포스팅", progress: 50, note: "" },
      { id: "t12", type: "할일", date: "2026-09-18", category: "프로모션", priority: "높음", title: "카드뉴스 기획", progress: 100, note: "" },
      { id: "t13", type: "할일", date: "2026-09-19", category: "프로모션", priority: "중간", title: "카드뉴스 초안 작성", progress: 100, note: "" },
      { id: "t14", type: "할일", date: "2026-09-20", category: "프로모션", priority: "낮음", title: "카드뉴스 포스팅", progress: 0, note: "" },
      { id: "t15", type: "할일", date: "2026-09-21", category: "프로모션", priority: "높음", title: "이메일 뉴스레터 기획", progress: 25, note: "" },
      { id: "t16", type: "할일", date: "2026-09-22", category: "프로모션", priority: "중간", title: "이메일 뉴스레터 초안 작성", progress: 0, note: "" },
      { id: "t17", type: "할일", date: "2026-09-23", category: "프로모션", priority: "낮음", title: "이메일 뉴스레터 발행", progress: 0, note: "" },
      { id: "t18", type: "일정", date: "2026-09-24", category: "프로모션", priority: "낮음", title: "11:00 미팅", progress: 100, note: "" },
    ],
    mandala: seedMandala(),
  };
}
