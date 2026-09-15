(function () {
  var S = window.DeskList;
  if (!S) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
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
      .map(function (c) {
        var items = list.filter(function (t) {
          return t.date === c.date;
        });
        var lines = items
          .slice(0, 3)
          .map(function (t) {
            return S.iconFor(t.type) + " " + esc(t.title);
          })
          .join("<br />");
        if (items.length > 3) lines += "<br /><span class='badge-num'>+" + (items.length - 3) + "</span>";
        var muted = c.inMonth ? "" : " style='opacity:.45'";
        var selCls = " wc--on";
        if (!fullWeek) {
          if (active.indexOf(c.date) !== -1) {
            selCls = active.length === 1 ? " wc--solo" : " wc--on";
          } else {
            selCls = " wc--off";
          }
        }
        return (
          '<div class="wc' +
          selCls +
          '"' +
          muted +
          ' data-date="' +
          c.date +
          '" role="button" tabindex="0" title="클릭: 이 날만 · 같은 날 다시: 주 전체">' +
          "<strong>" +
          c.day +
          "</strong>" +
          (lines || "") +
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
          esc(S.dateLabel(t.date)) +
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
      document.getElementById("date").value =
        dates.length === 1 ? dates[0] : weekDays[0] || "2026-09-16";
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
    document.getElementById("date").value = todo.date;
    document.getElementById("category").value = todo.category;
    document.getElementById("priority").value = todo.priority;
    document.getElementById("title").value = todo.title;
    setProgress(todo.progress);
    document.getElementById("note").value = todo.note || "";
    document.getElementById("link-cal").href = "calendar.html";
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
    S.upsertTodo({
      id: document.getElementById("todo-id").value || undefined,
      type: document.getElementById("type").value,
      date: document.getElementById("date").value,
      category: document.getElementById("category").value,
      priority: document.getElementById("priority").value,
      title: document.getElementById("title").value,
      progress: document.getElementById("progress").value,
      note: document.getElementById("note").value,
    });
  });

  document.getElementById("btn-delete").addEventListener("click", function () {
    var id = document.getElementById("todo-id").value;
    if (!id) return;
    if (confirm("이 할일을 삭제할까요? (목업·로컬)")) S.deleteTodo(id);
  });

  S.subscribe(render);

  (function initWeekFilter() {
    var deep = new URLSearchParams(location.search).get("date");
    if (deep) return;
    S.applyWeekDateFilter();
  })();

  render();
})();
