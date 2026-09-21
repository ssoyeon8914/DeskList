(function () {
  var S = window.DeskList;
  if (!S) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    var state = S.getState();
    var rows = document.getElementById("settings-rows");
    rows.innerHTML = state.types
      .map(function (t, i) {
        return (
          '<div class="settings-row" data-index="' +
          i +
          '">' +
          '<div class="field" style="margin:0"><label>구분</label>' +
          '<input type="text" class="type-name" value="' +
          esc(t.name) +
          '" /></div>' +
          '<div class="field" style="margin:0"><label>아이콘</label>' +
          '<input type="text" class="type-icon" value="' +
          esc(t.icon) +
          '" style="width:4.5rem;text-align:center" /></div>' +
          '<button type="button" class="btn btn-save">저장</button>' +
          '<button type="button" class="btn btn--ghost btn-del">삭제</button>' +
          "</div>"
        );
      })
      .join("");

    var preview = document.getElementById("preview-select");
    preview.innerHTML = state.types
      .map(function (t) {
        return "<option>" + esc(t.icon + " " + t.name) + "</option>";
      })
      .join("");
  }

  document.getElementById("settings-rows").addEventListener("click", function (e) {
    var row = e.target.closest(".settings-row");
    if (!row) return;
    var i = Number(row.getAttribute("data-index"));
    if (e.target.classList.contains("btn-save")) {
      S.updateType(i, row.querySelector(".type-name").value, row.querySelector(".type-icon").value);
      return;
    }
    if (e.target.classList.contains("btn-del")) {
      if (!S.removeType(i)) {
        DLModal.alert({
          title: "삭제 불가",
          message: "구분은 최소 1개 필요합니다.",
        });
      }
    }
  });

  document.getElementById("add-type").addEventListener("click", function () {
    S.addType("새 구분", "📌");
  });

  document.getElementById("reset-seed").addEventListener("click", function () {
    DLModal.confirm({
      title: "샘플 초기화",
      message: "샘플 데이터로 초기화할까요? (할일·구분 포함)",
      okLabel: "초기화",
      danger: true,
    }).then(function (ok) {
      if (ok) S.resetSeed();
    });
  });

  S.subscribe(render);
  render();
})();
