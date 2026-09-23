(function () {
  var S = window.DeskList;
  if (!S) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function addDaysIso(iso, delta) {
    var d = S.parseDate(iso);
    d.setDate(d.getDate() + delta);
    return S.formatDate(d);
  }

  function getScheduleMode() {
    var field = document.getElementById("date-field");
    return (field && field.getAttribute("data-mode")) || "single";
  }

  function daySpanCount(startIso, endIso) {
    var d1 = S.parseDate(startIso);
    var d2 = S.parseDate(endIso);
    return Math.round((d2 - d1) / 86400000) + 1;
  }

  function getSelectedWeekdays() {
    var picks = document.getElementById("weekday-picks");
    if (!picks) return [];
    return Array.prototype.slice
      .call(picks.querySelectorAll('button[aria-pressed="true"]'))
      .map(function (btn) {
        return Number(btn.getAttribute("data-day"));
      })
      .filter(function (n) {
        return n >= 0 && n <= 6;
      })
      .sort(function (a, b) {
        return a - b;
      });
  }

  function setSelectedWeekdays(days) {
    var picks = document.getElementById("weekday-picks");
    if (!picks) return;
    var set = {};
    (days || []).forEach(function (d) {
      set[d] = true;
    });
    picks.querySelectorAll("button[data-day]").forEach(function (btn) {
      var on = Boolean(set[Number(btn.getAttribute("data-day"))]);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function updateDateSummary() {
    var summary = document.getElementById("date-summary");
    var startEl = document.getElementById("date-start");
    var endEl = document.getElementById("date-end");
    if (!summary || !startEl || !startEl.value) {
      if (summary) summary.hidden = true;
      return;
    }
    var mode = getScheduleMode();
    if (mode === "single") {
      summary.hidden = true;
      return;
    }
    var end = endEl && endEl.value ? endEl.value : startEl.value;
    if (end < startEl.value) end = startEl.value;
    summary.hidden = false;
    if (mode === "recur") {
      var days = getSelectedWeekdays();
      if (!days.length) {
        summary.textContent = "요일을 하나 이상 선택하세요";
        return;
      }
      summary.textContent =
        "매주 " +
        S.weekdayNames(days) +
        " · " +
        S.dateLabel(startEl.value) +
        " – " +
        S.dateLabel(end);
      return;
    }
    summary.textContent =
      S.dateRangeLabel({ dateStart: startEl.value, dateEnd: end }) +
      " · " +
      daySpanCount(startEl.value, end) +
      "일";
  }

  function setScheduleMode(mode, opts) {
    opts = opts || {};
    var field = document.getElementById("date-field");
    var endSlot = document.getElementById("date-end-slot");
    var sep = document.getElementById("date-sep");
    var recurPanel = document.getElementById("recur-panel");
    var startSub = document.getElementById("date-start-sub");
    var endSub = document.getElementById("date-end-sub");
    var startEl = document.getElementById("date-start");
    var endEl = document.getElementById("date-end");
    var btnSingle = document.getElementById("mode-single");
    var btnRange = document.getElementById("mode-range");
    var btnRecur = document.getElementById("mode-recur");
    if (!field || !startEl || !endEl) return;

    if (mode !== "single" && mode !== "range" && mode !== "recur") mode = "single";
    field.setAttribute("data-mode", mode);
    field.classList.toggle("is-range", mode === "range");
    field.classList.toggle("is-recur", mode === "recur");

    if (btnSingle) btnSingle.setAttribute("aria-pressed", mode === "single" ? "true" : "false");
    if (btnRange) btnRange.setAttribute("aria-pressed", mode === "range" ? "true" : "false");
    if (btnRecur) btnRecur.setAttribute("aria-pressed", mode === "recur" ? "true" : "false");

    if (mode === "single") {
      if (endSlot) endSlot.hidden = true;
      if (sep) sep.hidden = true;
      if (recurPanel) recurPanel.hidden = true;
      if (startSub) startSub.textContent = "날짜";
      endEl.value = startEl.value;
    } else if (mode === "range") {
      if (endSlot) endSlot.hidden = false;
      if (sep) sep.hidden = false;
      if (recurPanel) recurPanel.hidden = true;
      if (startSub) startSub.textContent = "시작";
      if (endSub) endSub.textContent = "종료";
      endEl.value =
        opts.endIso ||
        (endEl.value && endEl.value > startEl.value
          ? endEl.value
          : addDaysIso(startEl.value || S.formatDate(new Date()), 1));
      if (endEl.value < startEl.value) endEl.value = startEl.value;
    } else {
      if (endSlot) endSlot.hidden = false;
      if (sep) sep.hidden = false;
      if (recurPanel) recurPanel.hidden = false;
      if (startSub) startSub.textContent = "시작";
      if (endSub) endSub.textContent = "까지";
      if (opts.weekdays) setSelectedWeekdays(opts.weekdays);
      else if (!getSelectedWeekdays().length) setSelectedWeekdays([1, 2, 3, 4, 5]);
      endEl.value =
        opts.endIso ||
        (endEl.value && endEl.value > startEl.value
          ? endEl.value
          : addDaysIso(startEl.value || S.formatDate(new Date()), 28));
      if (endEl.value < startEl.value) endEl.value = startEl.value;
    }
    updateDateSummary();
  }

  function syncEndFromStart() {
    var startEl = document.getElementById("date-start");
    var endEl = document.getElementById("date-end");
    if (!startEl || !endEl) return;
    var mode = getScheduleMode();
    if (mode === "single") {
      endEl.value = startEl.value;
    } else if (endEl.value < startEl.value) {
      endEl.value = startEl.value;
    }
    updateDateSummary();
  }

  function rangeTitleVisible(t, iso, colIndex) {
    if (!S.isRangeTodo(t)) return true;
    if (iso === t.dateStart) return true;
    /* 주가 바뀌는 첫 칸에도 제목 */
    if (colIndex === 0 && S.todoCoversDate(t, iso)) return true;
    return false;
  }

  function renderRangeBar(t, iso, colIndex) {
    var seg = S.rangeSegment(t, iso);
    if (!seg) return "";
    var showTitle = rangeTitleVisible(t, iso, colIndex);
    var done = t.progress >= 100 ? " range-bar--done" : "";
    return (
      '<div class="range-bar range-bar--' +
      seg +
      done +
      '" data-level="' +
      t.display +
      '" title="' +
      esc(S.dateRangeLabel(t) + " · " + t.title) +
      '">' +
      (showTitle
        ? '<span class="range-bar__icon">' +
          S.iconFor(t.type) +
          '</span><span class="range-bar__title">' +
          esc(t.title) +
          "</span>"
        : "") +
      "</div>"
    );
  }

  function renderDayChip(t) {
    var recurMark = S.isRecurTodo(t) ? '<span class="day-chip__recur" title="반복">↻</span> ' : "";
    return (
      '<div class="day-chip' +
      (t.progress >= 100 ? " day-chip--done" : "") +
      (S.isRecurTodo(t) ? " day-chip--recur" : "") +
      '" title="' +
      esc(t.title) +
      '">' +
      recurMark +
      S.iconFor(t.type) +
      " " +
      esc(t.title) +
      "</div>"
    );
  }

  function renderWeek(state) {
    var wrap = document.getElementById("week-panel");
    if (!wrap) return;
    var w = state.week;
    var headers = S.weekHeaders(w.weekStartsOn);
    var cells = S.weekRange(w.year, w.month, w.weekIndex, w.weekStartsOn);
    var weekDays = cells.map(function (c) {
      return c.date;
    });
    var active = state.filters.dates;
    var fullWeek =
      active.length === 7 &&
      weekDays.every(function (d) {
        return active.indexOf(d) !== -1;
      });
    /* 주간 칸에는 날짜 필터를 무시하고 다른 슬라이서만 반영 */
    var list = S.filteredTodos({ dates: weekDays });

    var yearSel = document.getElementById("week-year");
    var monthSel = document.getElementById("week-month");
    var weekSel = document.getElementById("week-week");
    var startSel = document.getElementById("week-start");
    if (yearSel) yearSel.value = String(w.year);
    if (monthSel) monthSel.value = String(w.month);
    if (startSel) startSel.value = w.weekStartsOn;

    var maxW = 6;
    if (weekSel) {
      weekSel.innerHTML = "";
      for (var i = 0; i < maxW; i++) {
        var opt = document.createElement("option");
        opt.value = String(i);
        var range = S.weekRange(w.year, w.month, i, w.weekStartsOn);
        opt.textContent = i + 1 + "주 (" + range[0].day + "–" + range[6].day + ")";
        if (i === w.weekIndex) opt.selected = true;
        weekSel.appendChild(opt);
      }
    }

    var headHtml = headers
      .map(function (h) {
        return '<div class="wd ' + h.cls + '">' + h.label + "</div>";
      })
      .join("");
    var bodyHtml = cells
      .map(function (c, colIndex) {
        var items = list.filter(function (t) {
          return S.todoCoversDate(t, c.date);
        });
        var lines = items
          .slice(0, 4)
          .map(function (t) {
            return S.isRangeTodo(t) ? renderRangeBar(t, c.date, colIndex) : renderDayChip(t);
          })
          .join("");
        if (items.length > 4) {
          lines += '<span class="badge-num">+' + (items.length - 4) + "</span>";
        }
        var muted = c.inMonth ? "" : " style='opacity:.45'";
        var selCls = " wc--on";
        if (!fullWeek) {
          if (active.indexOf(c.date) !== -1) {
            selCls = active.length === 1 ? " wc--solo" : " wc--on";
          } else {
            selCls = " wc--off";
          }
        }
        var holiday = S.holidayOn(c.date);
        var dow = S.parseDate(c.date).getDay();
        var holCls = holiday ? " wc--holiday" : "";
        if (dow === 0) holCls += " wc--sun";
        if (dow === 6) holCls += " wc--sat";
        return (
          '<div class="wc' +
          selCls +
          holCls +
          '"' +
          muted +
          ' data-date="' +
          c.date +
          '" role="button" tabindex="0" title="' +
          (holiday ? holiday.name + " · " : "") +
          '클릭: 이 날만 · 같은 날 다시: 주 전체">' +
          "<strong>" +
          c.day +
          "</strong>" +
          (holiday ? '<span class="day__holiday">' + esc(holiday.name) + "</span>" : "") +
          lines +
          "</div>"
        );
      })
      .join("");
    document.getElementById("week-grid").innerHTML = headHtml + bodyHtml;

    var scope = document.getElementById("week-scope");
    if (!scope) {
      scope = document.createElement("p");
      scope.id = "week-scope";
      scope.className = "week-scope";
      wrap.appendChild(scope);
    }
    if (fullWeek) {
      scope.textContent =
        "범위: " + weekDays[0] + " ~ " + weekDays[6] + " (주 전체) · 칸을 누르면 하루만 봅니다";
    } else if (active.length === 1) {
      scope.textContent =
        "범위: " + active[0] + " (하루) · 같은 칸을 다시 누르거나 「주 전체」";
    } else {
      scope.textContent = "범위: " + (active.join(", ") || "없음");
    }
  }

  function renderSlicers(state) {
    var bank = document.getElementById("slicer-bank");
    if (!bank) return;
    var f = state.filters;
    var cats = S.allCategories();

    function group(label, key, values) {
      return (
        '<div class="slicer-group" data-key="' +
        key +
        '"><span>' +
        label +
        "</span>" +
        values
          .map(function (v) {
            var on = f[key].indexOf(v) !== -1;
            return (
              '<button type="button" data-value="' +
              esc(v) +
              '" aria-pressed="' +
              (on ? "true" : "false") +
              '">' +
              esc(v) +
              "</button>"
            );
          })
          .join("") +
        "</div>"
      );
    }

    bank.innerHTML =
      '<div class="filter-bar__row filter-bar__row--primary">' +
      '<div class="filter-bar__top"><span class="filter-bar__label">필터</span>' +
      '<button type="button" class="btn filter-bar__reset" id="filter-reset" title="필터 초기화"><span class="mi" aria-hidden="true">restart_alt</span> 초기화</button></div>' +
      '<div class="filter-bar__groups">' +
      group(
        "구분",
        "types",
        state.types.map(function (t) {
          return t.name;
        })
      ) +
      group("우선순위", "priorities", ["높음", "중간", "낮음"]) +
      group("상태", "statuses", ["시작전", "진행중", "완료"]) +
      "</div></div>" +
      '<div class="filter-bar__row filter-bar__row--category">' +
      group("카테고리", "categories", cats.length ? cats : ["(없음)"]) +
      "</div>";
  }

  function renderMetrics(list) {
    var st = S.stats(list);
    var wait = st.byStatus["시작전"] || 0;
    var run = st.byStatus["진행중"] || 0;
    var done = st.byStatus["완료"] || 0;
    var total = st.total || 1;

    document.getElementById("stat-total").textContent = String(st.total);
    document.getElementById("stat-wait").textContent = String(wait);
    document.getElementById("stat-run").textContent = String(run);
    document.getElementById("stat-done").textContent = String(done);
    var donut = document.getElementById("donut");
    donut.style.setProperty("--p", String(st.completionRate));
    donut.setAttribute("aria-label", "완료율 " + st.completionRate + "%");
    donut.querySelector("strong").textContent = st.completionRate + "%";
    var strip = document.getElementById("status-strip");
    var parts = [wait, run, done];
    var sum = wait + run + done;
    if (!sum) {
      strip.style.gridTemplateColumns = "1fr";
      strip.innerHTML = '<i class="seg-wait" style="opacity:0.35"></i>';
    } else {
      strip.innerHTML =
        '<i class="seg-wait"></i><i class="seg-run"></i><i class="seg-done"></i>';
      strip.style.gridTemplateColumns = parts
        .map(function (n) {
          return n > 0 ? n + "fr" : "0fr";
        })
        .join(" ");
    }

    ["높음", "중간", "낮음"].forEach(function (p, i) {
      var col = document.querySelectorAll(".pri-col")[i];
      if (!col) return;
      var info = st.byPri[p];
      var pct = info.total ? Math.round((info.done / info.total) * 100) : 0;
      col.querySelector(".pri-frac").textContent = info.done + " / " + info.total;
      col.querySelector(".pri-stack").style.setProperty("--fill", pct + "%");
    });
  }

  function renderTable(list, selectedId) {
    var tbody = document.querySelector("#todo-table tbody");
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="8">필터 결과가 없습니다. 주간·필터를 확인하거나 행을 추가하세요.</td></tr>';
      return;
    }
    tbody.innerHTML = list
      .map(function (t) {
        return (
          '<tr data-id="' +
          t.id +
          '"' +
          (t.id === selectedId ? ' class="is-selected"' : "") +
          ">" +
          "<td>" +
          esc(t.type) +
          "</td>" +
          "<td>" +
          esc(S.dateRangeLabel(t)) +
          "</td>" +
          "<td>" +
          esc(t.category) +
          "</td>" +
          "<td>" +
          esc(t.priority) +
          "</td>" +
          '<td><span class="dot" data-level="' +
          t.display +
          '" title="표시 ' +
          t.display +
          '"></span></td>' +
          "<td>" +
          esc(t.title) +
          "</td>" +
          '<td><div class="prog"><i style="width:' +
          t.progress +
          '%"></i><b>' +
          t.progress +
          "%</b></div></td>" +
          "<td>" +
          esc(t.status) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    var sel = tbody.querySelector("tr.is-selected");
    if (sel && sel.scrollIntoView) {
      sel.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  function fillTypeSelect() {
    var sel = document.getElementById("type");
    if (!sel) return;
    var cur = sel.value;
    var types = S.getState().types;
    sel.innerHTML = types
      .map(function (t) {
        return "<option value=\"" + esc(t.name) + "\">" + esc(t.icon + " " + t.name) + "</option>";
      })
      .join("");
    if (cur) sel.value = cur;
  }

  function syncDerived() {
    var p = document.getElementById("progress").value;
    var pri = document.getElementById("priority").value;
    document.getElementById("status-preview").textContent = S.statusOf(p);
    document.getElementById("display-preview").textContent = String(S.displayOf(pri));
    document.getElementById("progress-label").textContent = Number(p || 0) + "%";
  }

  function setProgress(val) {
    var n = Math.max(0, Math.min(100, Number(val) || 0));
    document.getElementById("progress").value = String(n);
    var range = document.getElementById("progress-range");
    range.value = String(n);
    range.setAttribute("aria-valuenow", String(n));
    syncDerived();
  }

  function fillForm(todo) {
    fillTypeSelect();
    var form = document.getElementById("form");
    if (!form) return;
    var mode = document.getElementById("form-mode");
    if (!todo) {
      form.classList.add("is-empty");
      mode.textContent = "새 할일";
      document.getElementById("form-title").textContent = "새 행 작성";
      document.getElementById("todo-id").value = "";
      var w = S.getState().week;
      var weekDays = S.weekDates(w.year, w.month, w.weekIndex, w.weekStartsOn);
      var dates = S.getState().filters.dates;
      var start = dates.length === 1 ? dates[0] : weekDays[0] || "2026-09-16";
      document.getElementById("date-start").value = start;
      document.getElementById("date-end").value = start;
      setScheduleMode("single");
      setSelectedWeekdays([1, 2, 3, 4, 5]);
      document.getElementById("category").value = "";
      document.getElementById("priority").value = "중간";
      document.getElementById("title").value = "";
      setProgress(0);
      document.getElementById("note").value = "";
      return;
    }
    form.classList.remove("is-empty");
    mode.textContent = "편집 중";
    document.getElementById("form-title").textContent = todo.title || "(제목 없음)";
    document.getElementById("todo-id").value = todo.id;
    document.getElementById("type").value = todo.type;
    document.getElementById("date-start").value = todo.dateStart;
    document.getElementById("date-end").value = todo.dateEnd;
    if (S.isRecurTodo(todo)) {
      setScheduleMode("recur", {
        endIso: todo.dateEnd,
        weekdays: todo.recur.weekdays.slice(),
      });
    } else if (S.isRangeTodo(todo)) {
      setScheduleMode("range", { endIso: todo.dateEnd });
    } else {
      setScheduleMode("single");
    }
    document.getElementById("category").value = todo.category;
    document.getElementById("priority").value = todo.priority;
    document.getElementById("title").value = todo.title;
    setProgress(todo.progress);
    document.getElementById("note").value = todo.note || "";
    var linkCal = document.getElementById("link-cal");
    if (linkCal) linkCal.href = "calendar.html";
  }

  function render() {
    var state = S.getState();
    var list = S.filteredTodos();
    renderWeek(state);
    renderSlicers(state);
    renderMetrics(list);
    renderTable(list, state.selectedId);
    fillForm(S.getSelected());
  }

  document.getElementById("week-year").addEventListener("change", function (e) {
    S.setWeek({ year: Number(e.target.value) });
  });
  document.getElementById("week-month").addEventListener("change", function (e) {
    S.setWeek({ month: Number(e.target.value) });
  });
  document.getElementById("week-week").addEventListener("change", function (e) {
    S.setWeek({ weekIndex: Number(e.target.value) });
  });
  document.getElementById("week-start").addEventListener("change", function (e) {
    S.setWeek({ weekStartsOn: e.target.value });
  });

  var weekAll = document.getElementById("week-all");
  if (weekAll) {
    weekAll.addEventListener("click", function () {
      S.applyWeekDateFilter();
    });
  }

  document.getElementById("date-slicer") &&
    document.getElementById("date-slicer").addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-date]");
      if (!btn) return;
      S.toggleFilterValue("dates", btn.getAttribute("data-date"));
    });

  document.getElementById("slicer-bank").addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("#filter-reset")) {
      S.resetFilters();
      return;
    }
    var btn = e.target.closest("button[data-value]");
    if (!btn) return;
    var group = btn.closest(".slicer-group");
    if (!group) return;
    var val = btn.getAttribute("data-value");
    if (val === "(없음)") return;
    S.toggleFilterValue(group.getAttribute("data-key"), val);
  });

  document.getElementById("todo-table").addEventListener("click", function (e) {
    var tr = e.target.closest("tr[data-id]");
    if (!tr) return;
    S.selectTodo(tr.getAttribute("data-id"));
    setTimeout(function () {
      var title = document.getElementById("title");
      if (title) title.focus();
    }, 0);
  });

  function onWeekDayActivate(d) {
    var st = S.getState();
    var active = st.filters.dates;
    if (active.length === 1 && active[0] === d) {
      S.applyWeekDateFilter();
      return;
    }
    S.setFilterGroup("dates", [d]);
  }

  document.getElementById("week-grid").addEventListener("click", function (e) {
    var cell = e.target.closest(".wc[data-date]");
    if (!cell) return;
    onWeekDayActivate(cell.getAttribute("data-date"));
  });

  document.getElementById("week-grid").addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var cell = e.target.closest(".wc[data-date]");
    if (!cell) return;
    e.preventDefault();
    onWeekDayActivate(cell.getAttribute("data-date"));
  });

  function startNew() {
    S.selectTodo(null);
    fillForm(null);
    document.getElementById("title").focus();
  }

  document.getElementById("btn-new-side").addEventListener("click", startNew);

  function onProgressInput(e) {
    setProgress(e.target.value);
  }
  document.getElementById("progress").addEventListener("input", onProgressInput);
  document.getElementById("progress-range").addEventListener("input", onProgressInput);
  document.getElementById("priority").addEventListener("change", syncDerived);

  document.getElementById("title").addEventListener("input", function (e) {
    if (document.getElementById("todo-id").value) {
      document.getElementById("form-title").textContent = e.target.value || "(제목 없음)";
    }
  });

  document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault();
    var mode = getScheduleMode();
    var start = document.getElementById("date-start").value;
    var end = mode === "single" ? start : document.getElementById("date-end").value;
    if (!end || end < start) end = start;
    var recur = null;
    if (mode === "recur") {
      var weekdays = getSelectedWeekdays();
      if (!weekdays.length) {
        DLModal.alert({
          title: "반복 요일",
          message: "반복할 요일을 하나 이상 선택해 주세요.",
        });
        return;
      }
      recur = { freq: "weekly", weekdays: weekdays };
    }
    S.upsertTodo({
      id: document.getElementById("todo-id").value || undefined,
      type: document.getElementById("type").value,
      dateStart: start,
      dateEnd: end,
      recur: recur,
      category: document.getElementById("category").value,
      priority: document.getElementById("priority").value,
      title: document.getElementById("title").value,
      progress: document.getElementById("progress").value,
      note: document.getElementById("note").value,
    });
  });

  var modeSingle = document.getElementById("mode-single");
  if (modeSingle) {
    modeSingle.addEventListener("click", function () {
      setScheduleMode("single");
    });
  }
  var modeRange = document.getElementById("mode-range");
  if (modeRange) {
    modeRange.addEventListener("click", function () {
      setScheduleMode("range");
    });
  }
  var modeRecur = document.getElementById("mode-recur");
  if (modeRecur) {
    modeRecur.addEventListener("click", function () {
      setScheduleMode("recur");
    });
  }
  var weekdayPicks = document.getElementById("weekday-picks");
  if (weekdayPicks) {
    weekdayPicks.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-day]");
      if (!btn) return;
      var on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", on ? "false" : "true");
      updateDateSummary();
    });
  }
  var dateStartEl = document.getElementById("date-start");
  if (dateStartEl) {
    dateStartEl.addEventListener("change", syncEndFromStart);
  }
  var dateEndEl = document.getElementById("date-end");
  if (dateEndEl) {
    dateEndEl.addEventListener("change", function () {
      var startEl = document.getElementById("date-start");
      if (startEl && dateEndEl.value < startEl.value) dateEndEl.value = startEl.value;
      if (getScheduleMode() === "range" && startEl && dateEndEl.value === startEl.value) {
        setScheduleMode("single");
      } else {
        updateDateSummary();
      }
    });
  }

  document.getElementById("btn-delete").addEventListener("click", function () {
    var id = document.getElementById("todo-id").value;
    if (!id) return;
    DLModal.confirm({
      title: "할일 삭제",
      message: "이 할일을 삭제할까요? (목업·로컬)",
      okLabel: "삭제",
      danger: true,
    }).then(function (ok) {
      if (ok) S.deleteTodo(id);
    });
  });

  function syncListPaneHeight() {
    var workspace = document.querySelector(".todos-workspace");
    var editor = document.querySelector(".editor-pane");
    if (!workspace || !editor) return;
    if (window.matchMedia("(max-width: 960px)").matches) {
      workspace.style.removeProperty("--todos-editor-h");
      return;
    }
    var h = Math.round(editor.getBoundingClientRect().height);
    if (h > 0) workspace.style.setProperty("--todos-editor-h", h + "px");
  }

  function renderAll() {
    render();
    requestAnimationFrame(syncListPaneHeight);
  }

  S.subscribe(renderAll);

  (function bindListPaneHeight() {
    var editor = document.querySelector(".editor-pane");
    if (!editor || typeof ResizeObserver === "undefined") return;
    var ro = new ResizeObserver(function () {
      syncListPaneHeight();
    });
    ro.observe(editor);
    window.addEventListener("resize", syncListPaneHeight);
    syncListPaneHeight();
  })();

  (function initWeekFilter() {
    var deep = new URLSearchParams(location.search).get("date");
    if (deep) return;
    S.applyWeekDateFilter();
  })();

  renderAll();
})();
