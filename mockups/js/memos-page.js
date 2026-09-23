(function () {
  var S = window.DeskList;
  if (!S) return;

  var COLORS = S.MEMO_COLORS || ["cream", "mint", "sky", "rose"];
  var BODY_MAX = S.MEMO_BODY_MAX || 3000;
  var TITLE_MAX = S.MEMO_TITLE_MAX || 80;
  var CAT_MAX = S.MEMO_CATEGORY_MAX || 40;
  var CAT_DEFAULT = S.MEMO_CATEGORY_DEFAULT || "일반";
  var focusId = null;
  var skipRender = false;
  var filterCat = "all";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function readCardFields(card) {
    var titleEl = card.querySelector(".memo-card__title");
    var catEl = card.querySelector(".memo-card__cat");
    var bodyEl = card.querySelector(".memo-card__body");
    return {
      title: titleEl ? titleEl.value : "",
      category: catEl ? catEl.value : CAT_DEFAULT,
      body: bodyEl ? bodyEl.value : "",
      color: (card.className.match(/memo-card--(\w+)/) || [])[1] || "cream",
      width: Math.round(card.offsetWidth),
      height: Math.round(card.offsetHeight),
    };
  }

  function filteredList(all) {
    if (filterCat === "all") return all;
    return all.filter(function (m) {
      return m.category === filterCat;
    });
  }

  function renderFilters(all) {
    var bar = document.getElementById("memo-filters");
    var listEl = document.getElementById("memo-category-list");
    if (!bar) return;
    var cats = S.memoCategories ? S.memoCategories() : [];
    if (filterCat !== "all" && cats.indexOf(filterCat) === -1) filterCat = "all";

    var html =
      '<button type="button" class="memo-filter' +
      (filterCat === "all" ? " is-active" : "") +
      '" data-cat="all" aria-pressed="' +
      (filterCat === "all") +
      '">전체<span class="memo-filter__count">' +
      all.length +
      "</span></button>";

    cats.forEach(function (c) {
      var n = all.filter(function (m) {
        return m.category === c;
      }).length;
      html +=
        '<button type="button" class="memo-filter' +
        (filterCat === c ? " is-active" : "") +
        '" data-cat="' +
        esc(c) +
        '" aria-pressed="' +
        (filterCat === c) +
        '">' +
        esc(c) +
        '<span class="memo-filter__count">' +
        n +
        "</span></button>";
    });
    bar.innerHTML = html;

    if (listEl) {
      listEl.innerHTML = cats
        .map(function (c) {
          return "<option value=\"" + esc(c) + "\"></option>";
        })
        .join("");
    }
  }

  function render() {
    if (skipRender) return;
    var board = document.getElementById("memo-board");
    if (!board) return;

    var active = document.activeElement;
    var restore = null;
    if (active && active.closest && active.closest(".memo-card")) {
      var ac = active.closest(".memo-card");
      var field = "body";
      if (active.classList.contains("memo-card__title")) field = "title";
      else if (active.classList.contains("memo-card__cat")) field = "cat";
      restore = {
        id: ac.getAttribute("data-id"),
        field: field,
        start: active.selectionStart,
        end: active.selectionEnd,
      };
    }

    var all = S.memosSorted();
    renderFilters(all);
    var list = filteredList(all);

    if (!list.length) {
      var emptyMsg =
        filterCat === "all"
          ? "첫 메모를 남겨 보세요."
          : "「" + filterCat + "」 카테고리에 메모가 없습니다.";
      board.innerHTML =
        '<div class="memo-empty">' +
        "<p>" +
        esc(emptyMsg) +
        "</p>" +
        '<button type="button" class="btn btn--primary" id="memo-empty-add">메모 추가</button>' +
        "</div>";
      return;
    }

    board.innerHTML = list
      .map(function (m) {
        var swatches = COLORS.map(function (c) {
          var on = m.color === c ? " is-on" : "";
          return (
            '<button type="button" class="memo-swatch memo-swatch--' +
            c +
            on +
            '" data-color="' +
            c +
            '" aria-label="색 ' +
            c +
            '" aria-pressed="' +
            (m.color === c ? "true" : "false") +
            '"></button>'
          );
        }).join("");
        return (
          '<article class="memo-card memo-card--' +
          esc(m.color) +
          '" data-id="' +
          esc(m.id) +
          '" style="width:' +
          m.width +
          "px;height:" +
          m.height +
          'px">' +
          '<input class="memo-card__title" type="text" maxlength="' +
          TITLE_MAX +
          '" aria-label="메모 제목" placeholder="제목" value="' +
          esc(m.title) +
          '" />' +
          '<input class="memo-card__cat" type="text" list="memo-category-list" maxlength="' +
          CAT_MAX +
          '" aria-label="카테고리" placeholder="카테고리" value="' +
          esc(m.category) +
          '" />' +
          '<textarea class="memo-card__body" maxlength="' +
          BODY_MAX +
          '" aria-label="메모 내용" placeholder="적어 보세요…">' +
          esc(m.body) +
          "</textarea>" +
          '<div class="memo-card__bar">' +
          '<div class="memo-card__swatches">' +
          swatches +
          "</div>" +
          '<button type="button" class="btn btn--ghost memo-card__del">삭제</button>' +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    var targetId = focusId || (restore && restore.id);
    var targetField = focusId ? "title" : restore && restore.field;
    if (targetId && targetField) {
      var cls =
        targetField === "title"
          ? "title"
          : targetField === "cat"
            ? "cat"
            : "body";
      var sel = '.memo-card[data-id="' + targetId + '"] .memo-card__' + cls;
      var el = board.querySelector(sel);
      if (el) {
        el.focus();
        if (typeof el.setSelectionRange === "function" && restore && !focusId) {
          try {
            el.setSelectionRange(restore.start, restore.end);
          } catch (e) {
            /* ignore */
          }
        }
      }
      focusId = null;
    }
  }

  function addMemo() {
    var cat = filterCat === "all" ? CAT_DEFAULT : filterCat;
    var m = S.upsertMemo({ title: "", body: "", color: "cream", category: cat });
    focusId = m.id;
    render();
  }

  document.getElementById("memo-add").addEventListener("click", addMemo);

  document.getElementById("memo-filters").addEventListener("click", function (e) {
    var btn = e.target.closest(".memo-filter");
    if (!btn) return;
    filterCat = btn.getAttribute("data-cat") || "all";
    render();
  });

  document.getElementById("memo-board").addEventListener("click", function (e) {
    if (e.target.id === "memo-empty-add") {
      addMemo();
      return;
    }
    var card = e.target.closest(".memo-card");
    if (!card) return;
    var id = card.getAttribute("data-id");

    if (e.target.classList.contains("memo-card__del")) {
      DLModal.confirm({
        title: "메모 삭제",
        message: "이 메모를 삭제할까요?",
        okLabel: "삭제",
        danger: true,
      }).then(function (ok) {
        if (ok) S.deleteMemo(id);
      });
      return;
    }

    var sw = e.target.closest(".memo-swatch");
    if (sw) {
      var fields = readCardFields(card);
      S.upsertMemo({
        id: id,
        title: fields.title,
        category: fields.category,
        body: fields.body,
        color: sw.getAttribute("data-color"),
        width: fields.width,
        height: fields.height,
      });
    }
  });

  document.getElementById("memo-board").addEventListener("input", function (e) {
    var isTitle = e.target.classList.contains("memo-card__title");
    var isCat = e.target.classList.contains("memo-card__cat");
    var isBody = e.target.classList.contains("memo-card__body");
    if (!isTitle && !isCat && !isBody) return;
    var card = e.target.closest(".memo-card");
    if (!card) return;
    var fields = readCardFields(card);
    skipRender = true;
    S.upsertMemo({
      id: card.getAttribute("data-id"),
      title: fields.title.slice(0, TITLE_MAX),
      category: fields.category.slice(0, CAT_MAX),
      body: fields.body.slice(0, BODY_MAX),
      color: fields.color,
      width: fields.width,
      height: fields.height,
    });
    skipRender = false;
  });

  document.getElementById("memo-board").addEventListener("change", function (e) {
    if (!e.target.classList.contains("memo-card__cat")) return;
    var card = e.target.closest(".memo-card");
    if (!card) return;
    var fields = readCardFields(card);
    S.upsertMemo({
      id: card.getAttribute("data-id"),
      title: fields.title,
      category: fields.category.trim() || CAT_DEFAULT,
      body: fields.body,
      color: fields.color,
      width: fields.width,
      height: fields.height,
    });
  });

  document.getElementById("memo-board").addEventListener("pointerup", function (e) {
    var card = e.target.closest(".memo-card");
    if (!card) return;
    var id = card.getAttribute("data-id");
    var list = S.getState().memos || [];
    var m = list.find(function (x) {
      return x.id === id;
    });
    if (!m) return;
    var w = Math.round(card.offsetWidth);
    var h = Math.round(card.offsetHeight);
    if (w === m.width && h === m.height) return;
    skipRender = true;
    S.upsertMemo({
      id: id,
      title: m.title,
      category: m.category,
      body: m.body,
      color: m.color,
      width: w,
      height: h,
    });
    skipRender = false;
  });

  S.subscribe(render);
  render();
})();
