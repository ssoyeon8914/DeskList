(function () {
  var S = window.DeskList;
  if (!S) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function renderFilters(state) {
    var box = document.getElementById("cal-filters");
    if (!box) return;
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

    box.innerHTML =
      group(
        "구분",
        "types",
        state.types.map(function (t) {
          return t.name;
        })
      ) +
      group("카테고리", "categories", cats) +
      group("상태", "statuses", ["시작전", "진행중", "완료"]) +
      group("우선순위", "priorities", ["높음", "중간", "낮음"]) +
      '<button type="button" class="btn" id="cal-filter-reset" title="필터 해제"><span class="mi" aria-hidden="true">restart_alt</span> 필터 해제</button>';
  }

  function renderRail(state) {
    var c = state.calendar;
    document.getElementById("year-out").textContent = String(c.year);
    document.getElementById("ym-label").textContent = c.year + "년 " + c.month + "월";
    document.getElementById("week-start").value = c.weekStartsOn;
    document.querySelectorAll(".month-grid button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", Number(btn.textContent) === c.month ? "true" : "false");
    });
    document.getElementById("dens-8").setAttribute("aria-pressed", c.density === 8 ? "true" : "false");
    document.getElementById("dens-16").setAttribute("aria-pressed", c.density === 16 ? "true" : "false");
  }

  function renderGrid(state) {
    var c = state.calendar;
    var headers = S.weekHeaders(c.weekStartsOn);
    document.getElementById("weekdays").innerHTML = headers
      .map(function (h) {
        return '<div class="' + h.cls + '">' + h.label + "</div>";
      })
      .join("");

    var list = S.monthFilteredTodos();
    var byDate = {};
    list.forEach(function (t) {
      (byDate[t.date] || (byDate[t.date] = [])).push(t);
    });

    var cells = S.monthCells(c.year, c.month, c.weekStartsOn);
    var dens = c.density;
    var grid = document.getElementById("cal-grid");
    grid.dataset.density = String(dens);

    grid.innerHTML = cells
      .map(function (cell) {
        var items = byDate[cell.date] || [];
        var n = items.length;
        var lamp = "";
        var dayCls = "day";
        if (!cell.inMonth) dayCls += " day--muted";
        if (cell.isToday) dayCls += " day--today";
        if (n > 16) {
          dayCls += " day--alert";
          lamp = ' <span class="lamp lamp--orange" title="16개 초과"></span>';
        } else if (n > 8) {
          dayCls += " day--warn";
          lamp = ' <span class="lamp lamp--yellow" title="8개 초과"></span>';
        }

        var shown = items.slice(0, dens);
        var tasks = shown
          .map(function (t, i) {
            var extra = dens === 8 && i >= 8 ? " task-extra" : "";
            var done = t.progress >= 100 ? " task--done" : "";
            return (
              '<div class="task' +
              done +
              extra +
              '">' +
              '<span class="task__icon">' +
              S.iconFor(t.type) +
              "</span>" +
              '<span class="task__pri" data-level="' +
              t.display +
              '"></span>' +
              '<span class="task__title">' +
              esc(t.title) +
              "</span>" +
              '<span class="task__bar"><i style="width:' +
              t.progress +
              '%"></i></span>' +
              "</div>"
            );
          })
          .join("");

        var overflow = "";
        if (n > dens) {
          overflow = '<div class="task-overflow">+' + (n - dens) + " 더보기</div>";
        }

        return (
          '<a class="' +
          dayCls +
          '" href="todos.html?date=' +
          cell.date +
          '">' +
          '<div class="day__num">' +
          cell.day +
          lamp +
          "</div>" +
          tasks +
          overflow +
          "</a>"
        );
      })
      .join("");
  }

  function render() {
    var state = S.getState();
    renderRail(state);
    renderFilters(state);
    renderGrid(state);
  }

  document.getElementById("year-up").addEventListener("click", function () {
    S.setCalendar({ year: S.getState().calendar.year + 1 });
  });
  document.getElementById("year-down").addEventListener("click", function () {
    S.setCalendar({ year: S.getState().calendar.year - 1 });
  });
  document.querySelector(".month-grid").addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    S.setCalendar({ month: Number(btn.textContent) });
  });
  document.getElementById("week-start").addEventListener("change", function (e) {
    S.setCalendar({ weekStartsOn: e.target.value });
  });
  document.getElementById("dens-8").addEventListener("click", function () {
    S.setCalendar({ density: 8 });
  });
  document.getElementById("dens-16").addEventListener("click", function () {
    S.setCalendar({ density: 16 });
  });

  document.getElementById("cal-filters").addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("#cal-filter-reset")) {
      S.resetFilters();
      return;
    }
    var btn = e.target.closest("button[data-value]");
    if (!btn) return;
    var group = btn.closest(".slicer-group");
    if (!group) return;
    S.toggleFilterValue(group.getAttribute("data-key"), btn.getAttribute("data-value"));
  });

  // Deep-link from day click: set date filter when landing on todos — handled on todos via ?date=
  var params = new URLSearchParams(location.search);
  if (params.get("focusDate")) {
    /* reserved */
  }

  S.subscribe(render);
  render();
})();
