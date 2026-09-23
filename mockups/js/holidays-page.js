(function () {
  var S = window.DeskList;
  if (!S) return;

  var YEAR_MIN = 2026;
  var YEAR_MAX = 2040;
  var editingId = null;
  var yearSel = null;
  var DOW = ["일", "월", "화", "수", "목", "금", "토"];
  var MONTHS = [
    "",
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function clampYear(y) {
    var n = Number(y);
    if (!n || n < YEAR_MIN) return YEAR_MIN;
    if (n > YEAR_MAX) return YEAR_MAX;
    return n;
  }

  function getYear() {
    if (yearSel == null) {
      var cy = new Date().getFullYear();
      yearSel = clampYear(cy);
    }
    return yearSel;
  }

  function setYear(y) {
    yearSel = clampYear(y);
    render();
  }

  function formatDateLabel(iso) {
    var d = S.parseDate(iso);
    var m = d.getMonth() + 1;
    var day = d.getDate();
    var dow = DOW[d.getDay()];
    var dowCls =
      d.getDay() === 0 ? " holiday-dow--sun" : d.getDay() === 6 ? " holiday-dow--sat" : "";
    return (
      '<span class="holiday-item__date">' +
      m +
      "." +
      day +
      '</span><span class="holiday-item__dow' +
      dowCls +
      '">' +
      dow +
      "</span>"
    );
  }

  function composeEl() {
    return document.getElementById("holiday-compose");
  }

  function hideCompose() {
    editingId = null;
    var box = composeEl();
    if (box) box.hidden = true;
    document.getElementById("holiday-id").value = "";
    document.getElementById("holiday-date").value = "";
    document.getElementById("holiday-name").value = "";
    document.getElementById("holiday-submit").textContent = "추가";
    document.getElementById("holiday-compose-title").textContent = "새 공휴일";
    render();
  }

  function openCompose(h) {
    var box = composeEl();
    if (!box) return;
    box.hidden = false;
    if (h) {
      editingId = h.id;
      document.getElementById("holiday-id").value = h.id;
      document.getElementById("holiday-date").value = h.date;
      document.getElementById("holiday-name").value = h.name;
      document.getElementById("holiday-submit").textContent = "저장";
      document.getElementById("holiday-compose-title").textContent = "공휴일 수정";
    } else {
      editingId = null;
      document.getElementById("holiday-id").value = "";
      document.getElementById("holiday-name").value = "";
      document.getElementById("holiday-submit").textContent = "추가";
      document.getElementById("holiday-compose-title").textContent = "새 공휴일";
      document.getElementById("holiday-date").value = getYear() + "-01-01";
    }
    render();
    setTimeout(function () {
      document.getElementById(h ? "holiday-name" : "holiday-date").focus();
    }, 0);
    box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function filteredList(all) {
    var y = String(getYear());
    return all.filter(function (h) {
      return h.date.indexOf(y) === 0;
    });
  }

  function fillYearSelect() {
    var sel = document.getElementById("holiday-year-select");
    if (!sel) return;
    var y = getYear();
    var opts = [];
    for (var i = YEAR_MIN; i <= YEAR_MAX; i++) {
      opts.push(
        '<option value="' + i + '"' + (i === y ? " selected" : "") + ">" + i + "년</option>",
      );
    }
    sel.innerHTML = opts.join("");
  }

  function holidayMap(list) {
    var map = {};
    list.forEach(function (h) {
      map[h.date] = h;
    });
    return map;
  }

  function renderYearBoard(list) {
    var board = document.getElementById("holiday-year-board");
    if (!board) return;
    var y = getYear();
    var byDate = holidayMap(list);
    var html = "";
    for (var m = 1; m <= 12; m++) {
      var cells = S.monthCells(y, m, "sun");
      var dayCells = cells
        .map(function (c) {
          var hol = byDate[c.date];
          var cls = "hy-day";
          if (!c.inMonth) cls += " hy-day--out";
          if (hol) cls += " hy-day--hol";
          var title = hol ? hol.name : "";
          return (
            '<span class="' +
            cls +
            '"' +
            (title ? ' title="' + esc(title) + '"' : "") +
            ">" +
            c.day +
            "</span>"
          );
        })
        .join("");
      html +=
        '<section class="hy-month">' +
        '<h4 class="hy-month__title">' +
        m +
        "월</h4>" +
        '<div class="hy-month__dows" aria-hidden="true">' +
        "<span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>" +
        "</div>" +
        '<div class="hy-month__grid">' +
        dayCells +
        "</div>" +
        "</section>";
    }
    board.innerHTML = html;
  }

  function groupByMonth(list) {
    var groups = [];
    var map = {};
    list.forEach(function (h) {
      var key = h.date.slice(0, 7);
      if (!map[key]) {
        map[key] = { key: key, month: Number(h.date.slice(5, 7)), items: [] };
        groups.push(map[key]);
      }
      map[key].items.push(h);
    });
    return groups;
  }

  function render() {
    var all = S.holidaysSorted();
    fillYearSelect();
    var list = filteredList(all);
    var y = getYear();

    var count = document.getElementById("holiday-count");
    if (count) count.textContent = y + "년 " + list.length + "건";

    renderYearBoard(list);

    var rows = document.getElementById("holiday-rows");
    if (!rows) return;

    if (!list.length) {
      rows.innerHTML =
        '<div class="holiday-empty">' +
        "<p>이 연도에 등록된 공휴일이 없습니다.</p>" +
        '<button type="button" class="btn btn--primary" id="holiday-empty-add">공휴일 추가</button>' +
        "</div>";
      return;
    }

    var groups = groupByMonth(list);
    rows.innerHTML = groups
      .map(function (g) {
        var items = g.items
          .map(function (h) {
            var on = editingId === h.id ? " is-editing" : "";
            return (
              '<div class="holiday-item' +
              on +
              '" data-id="' +
              esc(h.id) +
              '">' +
              '<div class="holiday-item__main">' +
              formatDateLabel(h.date) +
              '<span class="holiday-item__name">' +
              esc(h.name) +
              "</span>" +
              "</div>" +
              '<div class="holiday-item__actions">' +
              '<button type="button" class="btn btn--ghost btn-edit">수정</button>' +
              '<button type="button" class="btn btn--ghost btn-del">삭제</button>' +
              "</div>" +
              "</div>"
            );
          })
          .join("");
        return (
          '<section class="holiday-month">' +
          '<h3 class="holiday-month__title">' +
          MONTHS[g.month] +
          "</h3>" +
          '<div class="holiday-month__items">' +
          items +
          "</div>" +
          "</section>"
        );
      })
      .join("");
  }

  document.getElementById("holiday-add-open").addEventListener("click", function () {
    openCompose(null);
  });

  document.getElementById("holiday-year-prev").addEventListener("click", function () {
    setYear(getYear() - 1);
  });
  document.getElementById("holiday-year-next").addEventListener("click", function () {
    setYear(getYear() + 1);
  });
  document.getElementById("holiday-year-select").addEventListener("change", function (e) {
    setYear(e.target.value);
  });

  document.getElementById("holiday-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var id = document.getElementById("holiday-id").value || undefined;
    var date = document.getElementById("holiday-date").value;
    var name = document.getElementById("holiday-name").value.trim();
    if (!date || !name) {
      DLModal.alert({ title: "입력 확인", message: "날짜와 이름을 입력해 주세요." });
      return;
    }
    S.upsertHoliday({ id: id, date: date, name: name });
    var y = Number(date.slice(0, 4));
    if (y >= YEAR_MIN && y <= YEAR_MAX) yearSel = y;
    hideCompose();
  });

  document.getElementById("holiday-cancel").addEventListener("click", hideCompose);

  document.getElementById("holiday-rows").addEventListener("click", function (e) {
    if (e.target.id === "holiday-empty-add") {
      openCompose(null);
      return;
    }
    var row = e.target.closest(".holiday-item");
    if (!row) return;
    var id = row.getAttribute("data-id");
    var all = S.getState().holidays || [];
    var h = all.find(function (x) {
      return x.id === id;
    });
    if (!h) return;

    if (e.target.classList.contains("btn-edit")) {
      openCompose(h);
      return;
    }
    if (e.target.classList.contains("btn-del")) {
      DLModal.confirm({
        title: "공휴일 삭제",
        message: "「" + h.name + "」을(를) 삭제할까요?",
        okLabel: "삭제",
        danger: true,
      }).then(function (ok) {
        if (ok) {
          S.deleteHoliday(id);
          if (editingId === id) hideCompose();
        }
      });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var box = composeEl();
    if (box && !box.hidden) hideCompose();
  });

  S.subscribe(render);
  render();
})();
