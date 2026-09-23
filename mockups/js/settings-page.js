(function () {
  var S = window.DeskList;
  if (!S) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function currentTab() {
    var q = new URLSearchParams(location.search).get("tab");
    return q === "holidays" ? "holidays" : "types";
  }

  function setTab(tab) {
    var types = document.getElementById("panel-types");
    var holidays = document.getElementById("panel-holidays");
    var actions = document.getElementById("settings-actions");
    if (!types || !holidays) return;

    var isTypes = tab === "types";
    types.hidden = !isTypes;
    holidays.hidden = isTypes;
    if (actions) {
      actions.hidden = false;
      actions.style.display = "flex";
    }
    var addType = document.getElementById("add-type");
    if (addType) addType.hidden = !isTypes;

    document.querySelectorAll(".settings-nav__link").forEach(function (a) {
      var on = a.getAttribute("data-tab") === tab;
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    var url = new URL(location.href);
    url.searchParams.set("tab", tab);
    history.replaceState(null, "", url.pathname + "?" + url.searchParams.toString());
  }

  function renderTypes() {
    var state = S.getState();
    var rows = document.getElementById("settings-rows");
    if (!rows) return;
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
    if (preview) {
      preview.innerHTML = state.types
        .map(function (t) {
          return "<option>" + esc(t.icon + " " + t.name) + "</option>";
        })
        .join("");
    }
  }

  document.getElementById("settings-rows") &&
    document.getElementById("settings-rows").addEventListener("click", function (e) {
      var row = e.target.closest(".settings-row");
      if (!row) return;
      var i = Number(row.getAttribute("data-index"));
      if (e.target.classList.contains("btn-save")) {
        S.updateType(
          i,
          row.querySelector(".type-name").value,
          row.querySelector(".type-icon").value,
        );
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

  var addType = document.getElementById("add-type");
  if (addType) {
    addType.addEventListener("click", function () {
      S.addType("새 구분", "📌");
    });
  }

  var resetSeed = document.getElementById("reset-seed");
  if (resetSeed) {
    resetSeed.addEventListener("click", function () {
      DLModal.confirm({
        title: "할일 초기화",
        message:
          "할일만 모두 삭제합니다. 구분·공휴일·메모·노트·만다라트 등 다른 값은 그대로 둡니다. 샘플 할일은 다시 넣지 않습니다.",
        okLabel: "할일 비우기",
        danger: true,
      }).then(function (ok) {
        if (!ok) return;
        S.clearTodos();
        DLModal.alert({
          title: "초기화 완료",
          message: "할일이 비었습니다.",
        });
      });
    });
  }

  var exportBtn = document.getElementById("export-data");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      try {
        S.downloadStateBackup();
        DLModal.alert({
          title: "내보내기 완료",
          message:
            "JSON 파일이 다운로드되었습니다. 다른 포트·브라우저로 옮길 때 「가져오기」로 넣으면 됩니다.",
        });
      } catch (e) {
        DLModal.alert({ title: "내보내기 실패", message: "파일을 저장하지 못했습니다." });
      }
    });
  }

  var importBtn = document.getElementById("import-data");
  var importFile = document.getElementById("import-data-file");
  if (importBtn && importFile) {
    importBtn.addEventListener("click", function () {
      importFile.click();
    });
    importFile.addEventListener("change", function () {
      var file = importFile.files && importFile.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var text = String(reader.result || "");
        try {
          JSON.parse(text);
        } catch (e) {
          DLModal.alert({
            title: "가져오기 실패",
            message: "올바른 DeskList JSON 백업 파일이 아닙니다.",
          });
          importFile.value = "";
          return;
        }
        DLModal.confirm({
          title: "데이터 가져오기",
          message: "현재 데이터를 이 파일 내용으로 바꿀까요?",
          okLabel: "가져오기",
          danger: true,
        }).then(function (ok) {
          if (!ok) {
            importFile.value = "";
            return;
          }
          try {
            S.importStateJson(text);
            DLModal.alert({
              title: "가져오기 완료",
              message: "데이터를 반영했습니다.",
            }).then(function () {
              location.reload();
            });
          } catch (e) {
            DLModal.alert({
              title: "가져오기 실패",
              message: "올바른 DeskList JSON 백업 파일이 아닙니다.",
            });
          }
          importFile.value = "";
        });
      };
      reader.readAsText(file);
    });
  }

  document.querySelectorAll(".settings-nav__link").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      setTab(a.getAttribute("data-tab") || "types");
    });
  });

  S.subscribe(renderTypes);
  setTab(currentTab());
  renderTypes();
})();
