/**
 * DeskList dynamic mock — single source of truth.
 * Progress: 0–100 (web mock). Excel sample also used 0–1.
 */
(function (global) {
  var STORAGE_KEY = "desklist-mock-v4";

  var PRI_TO_DISPLAY = { 낮음: 1, 중간: 2, 높음: 3 };
  var WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

  function uid() {
    return "t_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function holidayUid() {
    return "h_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function memoUid() {
    return "m_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  var MEMO_COLORS = ["cream", "mint", "sky", "rose"];
  var MEMO_BODY_MAX = 3000;
  var MEMO_TITLE_MAX = 80;
  var MEMO_CATEGORY_MAX = 40;
  var MEMO_CATEGORY_DEFAULT = "일반";
  var MEMO_W_DEFAULT = 240;
  var MEMO_H_DEFAULT = 220;
  var MEMO_W_MIN = 180;
  var MEMO_H_MIN = 160;
  var MEMO_W_MAX = 480;
  var MEMO_H_MAX = 560;

  function clampSize(n, min, max, fallback) {
    var v = Number(n);
    if (!isFinite(v)) return fallback;
    return Math.min(max, Math.max(min, Math.round(v)));
  }

  function normalizeCategory(raw) {
    var c = String(raw == null ? "" : raw).trim().slice(0, MEMO_CATEGORY_MAX);
    return c || MEMO_CATEGORY_DEFAULT;
  }

  function seedMemos() {
    var now = new Date().toISOString();
    return [
      {
        id: "m1",
        title: "주간 다짐",
        category: "회고",
        body: "주간 회고 때 적을 한 줄 다짐",
        color: "cream",
        width: MEMO_W_DEFAULT,
        height: MEMO_H_DEFAULT,
        updatedAt: now,
      },
      {
        id: "m2",
        title: "오늘의 문장",
        category: "일반",
        body: "오늘은 깊게, 내일은 넓게.",
        color: "mint",
        width: MEMO_W_DEFAULT,
        height: MEMO_H_DEFAULT,
        updatedAt: now,
      },
      {
        id: "m3",
        title: "촬영 체크",
        category: "촬영",
        body: "촬영 전 체크: 배터리 · 마이크 · 삼각대",
        color: "sky",
        width: MEMO_W_DEFAULT,
        height: MEMO_H_DEFAULT,
        updatedAt: now,
      },
    ];
  }

  var DOC_BODY_MAX = 50000;
  var DOC_TITLE_MAX = 120;
  var DOC_FOLDER_NAME_MAX = 40;

  function folderUid() {
    return "df_" + Math.random().toString(36).slice(2, 10);
  }

  function docUid() {
    return "dn_" + Math.random().toString(36).slice(2, 10);
  }

  function normalizeFormat(raw) {
    return raw === "markdown" ? "markdown" : "text";
  }

  function normalizeFolder(raw) {
    if (!raw || typeof raw !== "object") return null;
    var name = String(raw.name || "").trim().slice(0, DOC_FOLDER_NAME_MAX);
    if (!name) return null;
    return {
      id: String(raw.id || folderUid()),
      name: name,
      sort: typeof raw.sort === "number" && isFinite(raw.sort) ? raw.sort : undefined,
      updatedAt: String(raw.updatedAt || new Date().toISOString()),
    };
  }

  function normalizeDoc(raw) {
    if (!raw || typeof raw !== "object") return null;
    var folderId = String(raw.folderId || "");
    if (!folderId) return null;
    return {
      id: String(raw.id || docUid()),
      folderId: folderId,
      title: String(raw.title || "").slice(0, DOC_TITLE_MAX),
      format: normalizeFormat(raw.format),
      body: String(raw.body || "").slice(0, DOC_BODY_MAX),
      updatedAt: String(raw.updatedAt || new Date().toISOString()),
    };
  }

  function seedFolders() {
    var now = new Date().toISOString();
    return [
      { id: "df1", name: "회의", sort: 0, updatedAt: now },
      { id: "df2", name: "개인", sort: 1, updatedAt: now },
    ];
  }

  function seedDocs() {
    var now = new Date().toISOString();
    return [
      {
        id: "dn1",
        folderId: "df1",
        title: "킥오프 메모",
        format: "text",
        body: "안건\n1. 일정 공유\n2. 역할 나눔\n3. 다음 액션",
        updatedAt: now,
      },
      {
        id: "dn2",
        folderId: "df1",
        title: "주간 회고",
        format: "markdown",
        body: "# 주간 회고\n\n## 잘한 점\n- 일정 정리\n- 촬영 준비\n\n## 다음에\n1. 블로그 초안\n2. **카드뉴스** 리뷰\n\n> 짧게, 꾸준히.",
        updatedAt: now,
      },
      {
        id: "dn3",
        folderId: "df2",
        title: "아이디어 메모",
        format: "text",
        body: "나중에 다듬을 문장들을 여기에.",
        updatedAt: now,
      },
    ];
  }

  function seedDocsUi() {
    return {
      selectedFolderId: "df1",
      selectedDocId: "dn2",
      mdViewMode: "edit",
      foldersCollapsed: false,
      titlesCollapsed: false,
    };
  }

  function normalizeMdViewMode(raw) {
    if (raw === "split" || raw === "preview" || raw === "edit") return raw;
    return "edit";
  }

  function foldersSorted() {
    return (state.docFolders || []).slice().sort(function (a, b) {
      var sa = a.sort != null ? a.sort : 0;
      var sb = b.sort != null ? b.sort : 0;
      if (sa !== sb) return sa - sb;
      return a.name.localeCompare(b.name, "ko");
    });
  }

  function docsInFolder(folderId) {
    return (state.docs || [])
      .filter(function (d) {
        return d.folderId === folderId;
      })
      .slice()
      .sort(function (a, b) {
        if (a.updatedAt === b.updatedAt) return a.title.localeCompare(b.title, "ko");
        return a.updatedAt < b.updatedAt ? 1 : -1;
      });
  }

  function resolveDocsUi(ui) {
    var sorted = foldersSorted();
    var folderId = ui && ui.selectedFolderId;
    if (!folderId || !sorted.some(function (f) { return f.id === folderId; })) {
      folderId = sorted[0] ? sorted[0].id : null;
    }
    var docId = ui && ui.selectedDocId;
    var inFolder = folderId ? docsInFolder(folderId) : [];
    if (!docId || !inFolder.some(function (d) { return d.id === docId; })) {
      docId = inFolder[0] ? inFolder[0].id : null;
    }
    return {
      selectedFolderId: folderId,
      selectedDocId: docId,
      mdViewMode: normalizeMdViewMode(ui && ui.mdViewMode),
      foldersCollapsed: !!(ui && ui.foldersCollapsed),
      titlesCollapsed: !!(ui && ui.titlesCollapsed),
    };
  }

  function ensureNotes() {
    if (!Array.isArray(state.docFolders)) state.docFolders = seedFolders();
    else state.docFolders = state.docFolders.map(normalizeFolder).filter(Boolean);
    var ids = {};
    state.docFolders.forEach(function (f) {
      ids[f.id] = true;
    });
    if (!Array.isArray(state.docs)) state.docs = seedDocs();
    else
      state.docs = state.docs
        .map(normalizeDoc)
        .filter(function (d) {
          return d && ids[d.folderId];
        });
    state.docsUi = resolveDocsUi(state.docsUi || seedDocsUi());
  }

  function setDocsSelection(partial) {
    var cur = state.docsUi || seedDocsUi();
    state.docsUi = resolveDocsUi({
      selectedFolderId:
        partial.selectedFolderId !== undefined
          ? partial.selectedFolderId
          : cur.selectedFolderId,
      selectedDocId:
        partial.selectedDocId !== undefined ? partial.selectedDocId : cur.selectedDocId,
      mdViewMode:
        partial.mdViewMode !== undefined ? partial.mdViewMode : cur.mdViewMode,
      foldersCollapsed:
        partial.foldersCollapsed !== undefined
          ? partial.foldersCollapsed
          : cur.foldersCollapsed,
      titlesCollapsed:
        partial.titlesCollapsed !== undefined
          ? partial.titlesCollapsed
          : cur.titlesCollapsed,
    });
    persist();
  }

  function upsertFolder(input) {
    var now = new Date().toISOString();
    if (!Array.isArray(state.docFolders)) state.docFolders = [];
    if (input.id) {
      var idx = state.docFolders.findIndex(function (f) {
        return f.id === input.id;
      });
      if (idx !== -1) {
        state.docFolders[idx] = normalizeFolder({
          id: input.id,
          name: input.name,
          sort: state.docFolders[idx].sort,
          updatedAt: now,
        });
        state.docsUi = resolveDocsUi(state.docsUi);
        persist();
        return state.docFolders[idx];
      }
    }
    var created = normalizeFolder({
      id: folderUid(),
      name: (input.name || "새 폴더").slice(0, DOC_FOLDER_NAME_MAX),
      sort: state.docFolders.length,
      updatedAt: now,
    });
    state.docFolders.push(created);
    state.docsUi = resolveDocsUi({
      selectedFolderId: created.id,
      selectedDocId: null,
    });
    persist();
    return created;
  }

  function deleteFolder(id) {
    state.docFolders = (state.docFolders || []).filter(function (f) {
      return f.id !== id;
    });
    state.docs = (state.docs || []).filter(function (d) {
      return d.folderId !== id;
    });
    state.docsUi = resolveDocsUi(state.docsUi);
    persist();
  }

  function upsertDoc(input) {
    var now = new Date().toISOString();
    if (!Array.isArray(state.docs)) state.docs = [];
    if (input.id) {
      var idx = state.docs.findIndex(function (d) {
        return d.id === input.id;
      });
      if (idx !== -1) {
        var prev = state.docs[idx];
        state.docs[idx] = normalizeDoc({
          id: prev.id,
          folderId: input.folderId || prev.folderId,
          title: input.title !== undefined ? input.title : prev.title,
          format: input.format !== undefined ? input.format : prev.format,
          body: input.body !== undefined ? input.body : prev.body,
          updatedAt: now,
        });
        state.docsUi = resolveDocsUi({
          selectedFolderId: state.docs[idx].folderId,
          selectedDocId: state.docs[idx].id,
        });
        persist();
        return state.docs[idx];
      }
    }
    var created = normalizeDoc({
      id: docUid(),
      folderId: input.folderId,
      title: input.title || "",
      format: input.format || "text",
      body: input.body || "",
      updatedAt: now,
    });
    state.docs.unshift(created);
    state.docsUi = resolveDocsUi({
      selectedFolderId: created.folderId,
      selectedDocId: created.id,
    });
    persist();
    return created;
  }

  function deleteDoc(id) {
    state.docs = (state.docs || []).filter(function (d) {
      return d.id !== id;
    });
    state.docsUi = resolveDocsUi(state.docsUi);
    persist();
  }

  function getFolder(id) {
    return (state.docFolders || []).find(function (f) {
      return f.id === id;
    });
  }

  function getDoc(id) {
    return (state.docs || []).find(function (d) {
      return d.id === id;
    });
  }

  function normalizeMemo(raw) {
    if (!raw || typeof raw !== "object") return null;
    var body = String(raw.body || "").slice(0, MEMO_BODY_MAX);
    var title = String(raw.title || "").slice(0, MEMO_TITLE_MAX);
    var color = MEMO_COLORS.indexOf(raw.color) !== -1 ? raw.color : "cream";
    return {
      id: String(raw.id || memoUid()),
      title: title,
      category: normalizeCategory(raw.category),
      body: body,
      color: color,
      width: clampSize(raw.width, MEMO_W_MIN, MEMO_W_MAX, MEMO_W_DEFAULT),
      height: clampSize(raw.height, MEMO_H_MIN, MEMO_H_MAX, MEMO_H_DEFAULT),
      updatedAt: String(raw.updatedAt || new Date().toISOString()),
    };
  }

  function memoCategories() {
    var set = {};
    (state.memos || []).forEach(function (m) {
      set[normalizeCategory(m.category)] = true;
    });
    return Object.keys(set).sort(function (a, b) {
      return a.localeCompare(b, "ko");
    });
  }

  function seedHolidays() {
    var seed = window.DeskListHolidaySeed;
    if (!Array.isArray(seed) || !seed.length) return [];
    return seed.map(function (h) {
      return { id: h.id, date: h.date, name: h.name };
    });
  }

  function mergeHolidaySeed(list) {
    var byDate = {};
    (list || []).forEach(function (h) {
      if (h && h.date) byDate[h.date] = h;
    });
    seedHolidays().forEach(function (h) {
      if (!byDate[h.date]) byDate[h.date] = h;
    });
    return Object.keys(byDate)
      .sort()
      .map(function (k) {
        return byDate[k];
      });
  }

  function seed() {
    return {
      version: 4,
      types: [
        { name: "일정", icon: "🗓️" },
        { name: "할일", icon: "✔️" },
        { name: "회의", icon: "🎬" },
      ],
      calendar: {
        year: 2026,
        month: 9,
        weekStartsOn: "sun",
        density: 8,
      },
      week: {
        year: 2026,
        month: 9,
        weekIndex: 2,
        weekStartsOn: "sun",
      },
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
        _catsReady: true,
      },
      selectedId: null,
      todos: [
        { id: "t1", type: "일정", dateStart: "2026-09-16", dateEnd: "2026-09-16", category: "프로모션", priority: "높음", title: "10:00 신제품 프로모션 미팅", progress: 0, note: "회의실" },
        { id: "t2", type: "할일", dateStart: "2026-09-16", dateEnd: "2026-09-16", category: "프로모션", priority: "중간", title: "블로그 초안 작성", progress: 90, note: "" },
        { id: "t3", type: "할일", dateStart: "2026-09-16", dateEnd: "2026-09-16", category: "프로모션", priority: "낮음", title: "자료 정리", progress: 40, note: "" },
        { id: "t4", type: "할일", dateStart: "2026-09-16", dateEnd: "2026-09-16", category: "프로모션", priority: "중간", title: "카피 리뷰", progress: 10, note: "" },
        { id: "t5", type: "회의", dateStart: "2026-09-16", dateEnd: "2026-09-16", category: "프로모션", priority: "높음", title: "촬영 준비", progress: 0, note: "" },
        { id: "t6", type: "할일", dateStart: "2026-09-16", dateEnd: "2026-09-16", category: "프로모션", priority: "낮음", title: "키워드 조사", progress: 60, note: "" },
        { id: "t7", type: "할일", dateStart: "2026-09-16", dateEnd: "2026-09-16", category: "프로모션", priority: "중간", title: "썸네일 스케치", progress: 20, note: "" },
        { id: "t8", type: "할일", dateStart: "2026-09-16", dateEnd: "2026-09-16", category: "프로모션", priority: "낮음", title: "일정 공유", progress: 100, note: "" },
        { id: "t9", type: "할일", dateStart: "2026-09-16", dateEnd: "2026-09-16", category: "프로모션", priority: "중간", title: "댓글 답변", progress: 0, note: "" },
        { id: "t10", type: "일정", dateStart: "2026-09-16", dateEnd: "2026-09-16", category: "프로모션", priority: "낮음", title: "16:00 체크인", progress: 0, note: "" },
        { id: "t11", type: "할일", dateStart: "2026-09-17", dateEnd: "2026-09-17", category: "프로모션", priority: "낮음", title: "블로그 포스팅", progress: 50, note: "" },
        { id: "t12", type: "할일", dateStart: "2026-09-18", dateEnd: "2026-09-18", category: "프로모션", priority: "높음", title: "카드뉴스 기획", progress: 100, note: "" },
        { id: "t13", type: "할일", dateStart: "2026-09-19", dateEnd: "2026-09-19", category: "프로모션", priority: "중간", title: "카드뉴스 초안 작성", progress: 100, note: "" },
        { id: "t14", type: "할일", dateStart: "2026-09-20", dateEnd: "2026-09-20", category: "프로모션", priority: "낮음", title: "카드뉴스 포스팅", progress: 0, note: "" },
        { id: "t15", type: "할일", dateStart: "2026-09-21", dateEnd: "2026-09-21", category: "프로모션", priority: "높음", title: "이메일 뉴스레터 기획", progress: 25, note: "" },
        { id: "t16", type: "할일", dateStart: "2026-09-22", dateEnd: "2026-09-22", category: "프로모션", priority: "중간", title: "이메일 뉴스레터 초안 작성", progress: 0, note: "" },
        { id: "t17", type: "할일", dateStart: "2026-09-23", dateEnd: "2026-09-23", category: "프로모션", priority: "낮음", title: "이메일 뉴스레터 발행", progress: 0, note: "" },
        { id: "t18", type: "일정", dateStart: "2026-09-24", dateEnd: "2026-09-24", category: "프로모션", priority: "낮음", title: "11:00 미팅", progress: 100, note: "" },
        { id: "t19", type: "일정", dateStart: "2026-09-15", dateEnd: "2026-09-18", category: "프로모션", priority: "높음", title: "프로모션 캠페인 기간", progress: 40, note: "기간 바 데모" },
        {
          id: "t20",
          type: "회의",
          dateStart: "2026-09-15",
          dateEnd: "2026-10-10",
          category: "프로모션",
          priority: "중간",
          title: "주간 스탠드업",
          progress: 0,
          note: "반복 데모 · 월·수·금",
          recur: { freq: "weekly", weekdays: [1, 3, 5] },
        },
      ],
      holidays: seedHolidays(),
      memos: seedMemos(),
      docFolders: seedFolders(),
      docs: seedDocs(),
      docsUi: seedDocsUi(),
      mandala: seedMandala(),
    };
  }

  function seedMandala() {
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

  function displayOf(priority) {
    return PRI_TO_DISPLAY[priority] || 1;
  }

  function statusOf(progress) {
    var p = Number(progress);
    if (!isFinite(p) || p <= 0) return "시작전";
    if (p >= 100) return "완료";
    return "진행중";
  }

  function enrich(todo) {
    return Object.assign({}, todo, {
      display: displayOf(todo.priority),
      status: statusOf(todo.progress),
    });
  }

  function parseDate(iso) {
    var p = iso.split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }

  function formatDate(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function dateLabel(iso) {
    var d = parseDate(iso);
    return iso + " " + WEEKDAYS_KO[d.getDay()];
  }

  function normalizeRecur(r) {
    if (!r || r.freq !== "weekly" || !Array.isArray(r.weekdays)) return null;
    var days = [];
    r.weekdays.forEach(function (d) {
      var n = Number(d);
      if (n >= 0 && n <= 6 && days.indexOf(n) === -1) days.push(n);
    });
    days.sort(function (a, b) {
      return a - b;
    });
    if (!days.length) return null;
    return { freq: "weekly", weekdays: days };
  }

  function normalizeTodoDates(t) {
    var start = t.dateStart || t.date;
    var end = t.dateEnd || start;
    if (!start) start = formatDate(new Date());
    if (!end || end < start) end = start;
    var recur = normalizeRecur(t.recur);
    var out = Object.assign({}, t, { dateStart: start, dateEnd: end, date: undefined });
    if (recur) out.recur = recur;
    else delete out.recur;
    return out;
  }

  function isRecurTodo(t) {
    return Boolean(normalizeRecur(t && t.recur));
  }

  function isRangeTodo(t) {
    if (isRecurTodo(t)) return false;
    return Boolean(t.dateStart && t.dateEnd && t.dateStart !== t.dateEnd);
  }

  function todoCoversDate(t, iso) {
    if (!t.dateStart || !t.dateEnd) return false;
    if (iso < t.dateStart || iso > t.dateEnd) return false;
    if (!isRecurTodo(t)) return true;
    var dow = parseDate(iso).getDay();
    return t.recur.weekdays.indexOf(dow) !== -1;
  }

  function weekdayNames(days) {
    return (days || [])
      .map(function (d) {
        return WEEKDAYS_KO[d];
      })
      .join("");
  }

  function dateRangeLabel(t) {
    if (isRecurTodo(t)) {
      return (
        "매주 " +
        weekdayNames(t.recur.weekdays) +
        " · " +
        dateLabel(t.dateStart) +
        " – " +
        dateLabel(t.dateEnd)
      );
    }
    if (!isRangeTodo(t)) return dateLabel(t.dateStart);
    return dateLabel(t.dateStart) + " – " + dateLabel(t.dateEnd);
  }

  /** segment role for a day inside a multi-day span (not for recur) */
  function rangeSegment(t, iso) {
    if (!isRangeTodo(t) || !todoCoversDate(t, iso)) return null;
    if (t.dateStart === t.dateEnd) return "single";
    if (iso === t.dateStart) return "start";
    if (iso === t.dateEnd) return "end";
    return "mid";
  }

  var state = null;
  var listeners = [];

  function notify() {
    listeners.forEach(function (fn) {
      try {
        fn(getState());
      } catch (e) {
        console.error(e);
      }
    });
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore quota */
    }
    notify();
  }

  function load() {
    try {
      var raw =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem("desklist-mock-v3") ||
        localStorage.getItem("desklist-mock-v2") ||
        localStorage.getItem("desklist-mock-v1");
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.todos)) {
          state = parsed;
          state.version = 4;
          state.todos = state.todos.map(function (t) {
            var n = normalizeTodoDates(t);
            delete n.date;
            return n;
          });
          if (!Array.isArray(state.holidays)) {
            state.holidays = seedHolidays();
          } else {
            state.holidays = mergeHolidaySeed(
              state.holidays
                .map(normalizeHoliday)
                .filter(function (h) {
                  return h && h.id && h.date && h.name;
                }),
            );
          }
          if (!Array.isArray(state.memos)) {
            state.memos = seedMemos();
          } else {
            state.memos = state.memos.map(normalizeMemo).filter(Boolean);
          }
          ensureNotes();
          if (!state.selectedId && state.todos[0]) state.selectedId = state.todos[0].id;
          if (!Array.isArray(state.mandala) || state.mandala.length !== 81) {
            state.mandala = seedMandala();
          }
          persist();
          return;
        }
      }
    } catch (e) {
      /* fall through */
    }
    state = seed();
    state.selectedId = "t2";
    persist();
  }

  function normalizeHoliday(h) {
    if (!h || typeof h !== "object") return null;
    var date = String(h.date || "").slice(0, 10);
    var name = String(h.name || "").trim();
    if (!date || !name) return null;
    return {
      id: h.id || holidayUid(),
      date: date,
      name: name,
    };
  }

  function holidaysSorted() {
    return state.holidays.slice().sort(function (a, b) {
      if (a.date === b.date) return a.name.localeCompare(b.name, "ko");
      return a.date < b.date ? -1 : 1;
    });
  }

  function holidayOn(iso) {
    return (
      state.holidays.find(function (h) {
        return h.date === iso;
      }) || null
    );
  }

  function upsertHoliday(input) {
    var date = String(input.date || "").slice(0, 10);
    var name = String(input.name || "").trim();
    if (!date || !name) return null;
    if (input.id) {
      var idx = state.holidays.findIndex(function (h) {
        return h.id === input.id;
      });
      if (idx !== -1) {
        state.holidays[idx] = { id: input.id, date: date, name: name };
        persist();
        return state.holidays[idx];
      }
    }
    var created = { id: holidayUid(), date: date, name: name };
    state.holidays.push(created);
    persist();
    return created;
  }

  function deleteHoliday(id) {
    state.holidays = state.holidays.filter(function (h) {
      return h.id !== id;
    });
    persist();
  }

  function memosSorted() {
    return (state.memos || []).slice().sort(function (a, b) {
      return a.id < b.id ? 1 : -1;
    });
  }

  function upsertMemo(input) {
    var now = new Date().toISOString();
    if (!Array.isArray(state.memos)) state.memos = [];
    if (input.id) {
      var idx = state.memos.findIndex(function (m) {
        return m.id === input.id;
      });
      if (idx !== -1) {
        var prev = state.memos[idx];
        state.memos[idx] = normalizeMemo({
          id: input.id,
          title: input.title !== undefined ? input.title : prev.title,
          category: input.category !== undefined ? input.category : prev.category,
          body: input.body !== undefined ? input.body : prev.body,
          color: input.color !== undefined ? input.color : prev.color,
          width: input.width !== undefined ? input.width : prev.width,
          height: input.height !== undefined ? input.height : prev.height,
          updatedAt: now,
        });
        persist();
        return state.memos[idx];
      }
    }
    var created = normalizeMemo({
      id: memoUid(),
      title: input.title || "",
      category: input.category,
      body: input.body || "",
      color: input.color || "cream",
      width: input.width,
      height: input.height,
      updatedAt: now,
    });
    state.memos.unshift(created);
    persist();
    return created;
  }

  function deleteMemo(id) {
    state.memos = (state.memos || []).filter(function (m) {
      return m.id !== id;
    });
    persist();
  }

  function getState() {
    return {
      types: state.types.slice(),
      calendar: Object.assign({}, state.calendar),
      week: Object.assign({}, state.week),
      filters: {
        dates: state.filters.dates.slice(),
        types: state.filters.types.slice(),
        priorities: state.filters.priorities.slice(),
        categories: state.filters.categories.slice(),
        statuses: state.filters.statuses.slice(),
      },
      selectedId: state.selectedId,
      todos: state.todos.map(enrich),
      holidays: holidaysSorted(),
      memos: memosSorted(),
      docFolders: foldersSorted(),
      docs: (state.docs || []).slice(),
      docsUi: Object.assign({}, state.docsUi || seedDocsUi()),
      mandala: state.mandala.slice(),
    };
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function () {
      listeners = listeners.filter(function (x) {
        return x !== fn;
      });
    };
  }

  function iconFor(typeName) {
    var t = state.types.find(function (x) {
      return x.name === typeName;
    });
    return t ? t.icon : "•";
  }

  function allCategories() {
    var set = {};
    state.todos.forEach(function (t) {
      if (t.category) set[t.category] = true;
    });
    return Object.keys(set).sort();
  }

  function allDatesSorted() {
    var set = {};
    state.todos.forEach(function (t) {
      set[t.dateStart] = true;
      set[t.dateEnd] = true;
    });
    return Object.keys(set).sort().reverse();
  }

  function ensureFilterDefaults() {
    if (state.filters._catsReady) return;
    if (!state.filters.categories || !state.filters.categories.length) {
      state.filters.categories = allCategories();
    }
    state.filters._catsReady = true;
  }

  function matchesFilters(todo, f) {
    var e = enrich(todo);
    /* dates: empty = all; match if range covers any selected day */
    if (f.dates && f.dates.length) {
      var hit = f.dates.some(function (d) {
        return todoCoversDate(todo, d);
      });
      if (!hit) return false;
    }
    if (!f.types || f.types.indexOf(todo.type) === -1) return false;
    if (!f.priorities || f.priorities.indexOf(todo.priority) === -1) return false;
    if (!f.categories || f.categories.indexOf(todo.category) === -1) return false;
    if (!f.statuses || f.statuses.indexOf(e.status) === -1) return false;
    return true;
  }

  function filteredTodos(extra) {
    ensureFilterDefaults();
    var f = Object.assign({}, state.filters, extra || {});
    return state.todos.map(enrich).filter(function (t) {
      return matchesFilters(t, f);
    });
  }

  /** Calendar month view: ignore date slicer, keep type/cat/pri/status */
  function monthFilteredTodos() {
    return filteredTodos({ dates: [] });
  }

  function stats(list) {
    var total = list.length;
    var byStatus = { 시작전: 0, 진행중: 0, 완료: 0 };
    var byPri = {
      높음: { done: 0, total: 0 },
      중간: { done: 0, total: 0 },
      낮음: { done: 0, total: 0 },
    };
    list.forEach(function (t) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      if (byPri[t.priority]) {
        byPri[t.priority].total++;
        if (t.status === "완료") byPri[t.priority].done++;
      }
    });
    var done = byStatus["완료"] || 0;
    return {
      total: total,
      byStatus: byStatus,
      byPri: byPri,
      completionRate: total ? Math.round((done / total) * 100) : 0,
    };
  }

  function setCalendar(patch) {
    Object.assign(state.calendar, patch);
    persist();
  }

  function setWeek(patch) {
    Object.assign(state.week, patch);
    /* 주간 선택 → 날짜 필터를 해당 주 7일로 맞춤 */
    state.filters.dates = weekDates(
      state.week.year,
      state.week.month,
      state.week.weekIndex,
      state.week.weekStartsOn
    );
    persist();
  }

  function applyWeekDateFilter() {
    state.filters.dates = weekDates(
      state.week.year,
      state.week.month,
      state.week.weekIndex,
      state.week.weekStartsOn
    );
    persist();
  }

  function setFilterGroup(key, values) {
    state.filters[key] = values.slice();
    persist();
  }

  function toggleFilterValue(key, value) {
    var arr = state.filters[key] || [];
    var i = arr.indexOf(value);
    if (i === -1) arr.push(value);
    else arr.splice(i, 1);
    state.filters[key] = arr;
    persist();
  }

  function resetFilters() {
    state.filters.types = state.types.map(function (t) {
      return t.name;
    });
    state.filters.priorities = ["높음", "중간", "낮음"];
    state.filters.categories = allCategories();
    state.filters.statuses = ["시작전", "진행중", "완료"];
    state.filters._catsReady = true;
    /* 구분·상태 등만 해제하고, 날짜 범위는 선택 중인 주로 유지 */
    state.filters.dates = weekDates(
      state.week.year,
      state.week.month,
      state.week.weekIndex,
      state.week.weekStartsOn
    );
    persist();
  }

  function selectTodo(id) {
    state.selectedId = id || null;
    persist();
  }

  function getSelected() {
    var t = state.todos.find(function (x) {
      return x.id === state.selectedId;
    });
    return t ? enrich(t) : null;
  }

  function upsertTodo(input) {
    var progress = Math.max(0, Math.min(100, Number(input.progress) || 0));
    var start = input.dateStart || input.date;
    var end = input.dateEnd || start;
    if (!start) start = formatDate(new Date());
    if (!end || end < start) end = start;
    var recur = normalizeRecur(input.recur);
    var payload = {
      type: input.type,
      dateStart: start,
      dateEnd: end,
      category: input.category || "",
      priority: input.priority || "중간",
      title: input.title || "(제목 없음)",
      progress: progress,
      note: input.note || "",
    };
    if (recur) payload.recur = recur;
    if (input.id) {
      var idx = state.todos.findIndex(function (t) {
        return t.id === input.id;
      });
      if (idx !== -1) {
        var next = Object.assign({}, state.todos[idx], payload);
        delete next.date;
        if (!recur) delete next.recur;
        state.todos[idx] = next;
        state.selectedId = input.id;
        persist();
        return enrich(state.todos[idx]);
      }
    }
    var created = Object.assign({ id: uid() }, payload);
    state.todos.push(created);
    state.selectedId = created.id;
    if (payload.category && state.filters.categories.indexOf(payload.category) === -1) {
      state.filters.categories.push(payload.category);
      state.filters._catsReady = true;
    }
    persist();
    return enrich(created);
  }

  function deleteTodo(id) {
    state.todos = state.todos.filter(function (t) {
      return t.id !== id;
    });
    if (state.selectedId === id) {
      state.selectedId = state.todos[0] ? state.todos[0].id : null;
    }
    persist();
  }

  function setTypes(types) {
    state.types = types.map(function (t) {
      return { name: String(t.name).trim() || "구분", icon: t.icon || "📌" };
    });
    if (!state.types.length) state.types = [{ name: "할일", icon: "✔️" }];
    resetFilters();
  }

  function addType(name, icon) {
    state.types.push({ name: name || "새 구분", icon: icon || "📌" });
    state.filters.types.push(state.types[state.types.length - 1].name);
    persist();
  }

  function updateType(index, name, icon) {
    if (!state.types[index]) return;
    var old = state.types[index].name;
    state.types[index] = { name: name, icon: icon };
    state.todos.forEach(function (t) {
      if (t.type === old) t.type = name;
    });
    var fi = state.filters.types.indexOf(old);
    if (fi !== -1) state.filters.types[fi] = name;
    persist();
  }

  function removeType(index) {
    if (state.types.length <= 1) return false;
    var removed = state.types[index].name;
    state.types.splice(index, 1);
    var fallback = state.types[0].name;
    state.todos.forEach(function (t) {
      if (t.type === removed) t.type = fallback;
    });
    state.filters.types = state.filters.types.filter(function (n) {
      return n !== removed;
    });
    if (state.filters.types.indexOf(fallback) === -1) state.filters.types.push(fallback);
    persist();
    return true;
  }

  function resetSeed() {
    state = seed();
    state.selectedId = "t2";
    persist();
  }

  function clearTodos() {
    state.todos = [];
    state.selectedId = null;
    if (state.filters) {
      state.filters.dates = [];
      state.filters.categories = [];
    }
    persist();
  }

  function exportStateJson() {
    try {
      return JSON.stringify(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"), null, 2);
    } catch (e) {
      return localStorage.getItem(STORAGE_KEY) || "{}";
    }
  }

  function importStateJson(json) {
    var parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") throw new Error("bad json");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    load();
    notify();
  }

  function downloadStateBackup() {
    var blob = new Blob([exportStateJson()], {
      type: "application/json;charset=utf-8",
    });
    var a = document.createElement("a");
    var d = new Date();
    var stamp =
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0");
    a.href = URL.createObjectURL(blob);
    a.download = "desklist-mock-backup-" + stamp + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function getMandala() {
    if (!Array.isArray(state.mandala) || state.mandala.length !== 81) {
      state.mandala = seedMandala();
    }
    return state.mandala.slice();
  }

  function setMandala(cells) {
    if (!Array.isArray(cells) || cells.length !== 81) return;
    state.mandala = cells.map(function (c) {
      return String(c == null ? "" : c);
    });
    persist();
  }

  function setMandalaCell(index, value) {
    if (index < 0 || index > 80) return;
    if (!Array.isArray(state.mandala) || state.mandala.length !== 81) {
      state.mandala = seedMandala();
    }
    state.mandala[index] = String(value == null ? "" : value);
    persist();
  }

  /** Build 6×7 month grid cells */
  function monthCells(year, month, weekStartsOn) {
    var first = new Date(year, month - 1, 1);
    var startDow = first.getDay();
    if (weekStartsOn === "mon") {
      startDow = (startDow + 6) % 7;
    }
    var cells = [];
    var cursor = new Date(year, month - 1, 1 - startDow);
    for (var i = 0; i < 42; i++) {
      cells.push({
        date: formatDate(cursor),
        day: cursor.getDate(),
        inMonth: cursor.getMonth() === month - 1,
        isToday: formatDate(cursor) === formatDate(new Date()),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return cells;
  }

  function weekHeaders(weekStartsOn) {
    var sunFirst = [
      { label: "SUN", cls: "sun" },
      { label: "MON", cls: "" },
      { label: "TUE", cls: "" },
      { label: "WED", cls: "" },
      { label: "THU", cls: "" },
      { label: "FRI", cls: "" },
      { label: "SAT", cls: "sat" },
    ];
    if (weekStartsOn === "mon") {
      return sunFirst.slice(1).concat(sunFirst.slice(0, 1));
    }
    return sunFirst;
  }

  function weekRange(year, month, weekIndex, weekStartsOn) {
    var cells = monthCells(year, month, weekStartsOn);
    var start = weekIndex * 7;
    return cells.slice(start, start + 7);
  }

  function weekDates(year, month, weekIndex, weekStartsOn) {
    return weekRange(year, month, weekIndex, weekStartsOn).map(function (c) {
      return c.date;
    });
  }

  function weekCount(year, month, weekStartsOn) {
    return Math.ceil(monthCells(year, month, weekStartsOn).filter(function (c) {
      return c.inMonth;
    }).length / 7) || 5;
  }

  load();

  global.DeskList = {
    getState: getState,
    subscribe: subscribe,
    enrich: enrich,
    displayOf: displayOf,
    statusOf: statusOf,
    iconFor: iconFor,
    dateLabel: dateLabel,
    dateRangeLabel: dateRangeLabel,
    isRangeTodo: isRangeTodo,
    isRecurTodo: isRecurTodo,
    todoCoversDate: todoCoversDate,
    rangeSegment: rangeSegment,
    weekdayNames: weekdayNames,
    formatDate: formatDate,
    parseDate: parseDate,
    allCategories: allCategories,
    allDatesSorted: allDatesSorted,
    filteredTodos: filteredTodos,
    monthFilteredTodos: monthFilteredTodos,
    stats: stats,
    setCalendar: setCalendar,
    setWeek: setWeek,
    applyWeekDateFilter: applyWeekDateFilter,
    setFilterGroup: setFilterGroup,
    toggleFilterValue: toggleFilterValue,
    resetFilters: resetFilters,
    selectTodo: selectTodo,
    getSelected: getSelected,
    upsertTodo: upsertTodo,
    deleteTodo: deleteTodo,
    setTypes: setTypes,
    addType: addType,
    updateType: updateType,
    removeType: removeType,
    resetSeed: resetSeed,
    clearTodos: clearTodos,
    exportStateJson: exportStateJson,
    importStateJson: importStateJson,
    downloadStateBackup: downloadStateBackup,
    holidaysSorted: holidaysSorted,
    holidayOn: holidayOn,
    upsertHoliday: upsertHoliday,
    deleteHoliday: deleteHoliday,
    MEMO_COLORS: MEMO_COLORS,
    MEMO_BODY_MAX: MEMO_BODY_MAX,
    MEMO_TITLE_MAX: MEMO_TITLE_MAX,
    MEMO_CATEGORY_MAX: MEMO_CATEGORY_MAX,
    MEMO_CATEGORY_DEFAULT: MEMO_CATEGORY_DEFAULT,
    memoCategories: memoCategories,
    memosSorted: memosSorted,
    upsertMemo: upsertMemo,
    deleteMemo: deleteMemo,
    DOC_BODY_MAX: DOC_BODY_MAX,
    DOC_TITLE_MAX: DOC_TITLE_MAX,
    DOC_FOLDER_NAME_MAX: DOC_FOLDER_NAME_MAX,
    foldersSorted: foldersSorted,
    docsInFolder: docsInFolder,
    setDocsSelection: setDocsSelection,
    upsertFolder: upsertFolder,
    deleteFolder: deleteFolder,
    upsertDoc: upsertDoc,
    deleteDoc: deleteDoc,
    getFolder: getFolder,
    getDoc: getDoc,
    getMandala: getMandala,
    setMandala: setMandala,
    setMandalaCell: setMandalaCell,
    seedMandala: seedMandala,
    monthCells: monthCells,
    weekHeaders: weekHeaders,
    weekRange: weekRange,
    weekDates: weekDates,
    weekCount: weekCount,
  };
})(window);
