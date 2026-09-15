/**
 * DeskList dynamic mock — single source of truth.
 * Progress: 0–100 (web mock). Excel sample also used 0–1.
 */
(function (global) {
  var STORAGE_KEY = "desklist-mock-v1";

  var PRI_TO_DISPLAY = { 낮음: 1, 중간: 2, 높음: 3 };
  var WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

  function uid() {
    return "t_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function seed() {
    return {
      version: 1,
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
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1 && Array.isArray(parsed.todos)) {
          state = parsed;
          if (!state.selectedId && state.todos[0]) state.selectedId = state.todos[0].id;
          if (!Array.isArray(state.mandala) || state.mandala.length !== 81) {
            state.mandala = seedMandala();
            persist();
          }
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
      set[t.date] = true;
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
    /* dates: empty = all dates */
    if (f.dates && f.dates.length && f.dates.indexOf(todo.date) === -1) return false;
    /* other slicers: empty = match none */
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
    var payload = {
      type: input.type,
      date: input.date,
      category: input.category || "",
      priority: input.priority || "중간",
      title: input.title || "(제목 없음)",
      progress: progress,
      note: input.note || "",
    };
    if (input.id) {
      var idx = state.todos.findIndex(function (t) {
        return t.id === input.id;
      });
      if (idx !== -1) {
        state.todos[idx] = Object.assign({}, state.todos[idx], payload);
        state.selectedId = input.id;
        persist();
        return enrich(state.todos[idx]);
      }
    }
    var created = Object.assign({ id: uid() }, payload);
    state.todos.push(created);
    state.selectedId = created.id;
    if (payload.category && state.filters.categories.indexOf(payload.category) === -1) {
      /* New category appears in slicer as selected so the new row stays visible */
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
