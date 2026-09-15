(function () {
  var S = window.DeskList;
  if (!S) return;

  var grid = document.getElementById("mandala-grid");
  var inputs = grid ? grid.querySelectorAll("input") : [];
  var selected = null;
  var sendBtn = document.getElementById("send-todo");
  var msg = document.getElementById("send-msg");
  var statusEl = document.getElementById("mandala-save-status");
  var saveTimer = null;

  function syncMirrorsFromSources() {
    document.querySelectorAll(".sub-c[data-src]").forEach(function (src) {
      var key = src.getAttribute("data-src");
      document.querySelectorAll('.mirror[data-mirror="' + key + '"]').forEach(function (m) {
        m.value = src.value;
      });
    });
  }

  function applyFromStore() {
    var cells = S.getMandala();
    inputs.forEach(function (el, i) {
      el.value = cells[i] != null ? cells[i] : "";
    });
    syncMirrorsFromSources();
  }

  function collectCells() {
    var out = [];
    inputs.forEach(function (el) {
      out.push(el.value);
    });
    return out;
  }

  function markSaved() {
    if (!statusEl) return;
    statusEl.textContent = "저장됨";
    statusEl.hidden = false;
  }

  function scheduleSave() {
    if (statusEl) {
      statusEl.textContent = "저장 중…";
      statusEl.hidden = false;
    }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      S.setMandala(collectCells());
      markSaved();
    }, 200);
  }

  applyFromStore();

  document.querySelectorAll(".sub-c[data-src]").forEach(function (src) {
    src.addEventListener("input", function () {
      var key = src.getAttribute("data-src");
      document.querySelectorAll('.mirror[data-mirror="' + key + '"]').forEach(function (m) {
        m.value = src.value;
      });
      scheduleSave();
    });
  });

  inputs.forEach(function (el) {
    if (el.classList.contains("mirror") || el.classList.contains("sub-c")) return;
    el.addEventListener("input", scheduleSave);
  });

  grid.addEventListener("focusin", function (e) {
    if (e.target.tagName !== "INPUT") return;
    selected = e.target;
    sendBtn.disabled = !selected.value.trim();
  });

  grid.addEventListener("input", function (e) {
    if (e.target === selected) {
      sendBtn.disabled = !selected.value.trim();
    }
  });

  sendBtn.addEventListener("click", function () {
    if (!selected || !selected.value.trim()) return;
    var created = S.upsertTodo({
      type: "할일",
      date: "2026-09-16",
      category: "만다라트",
      priority: "중간",
      title: selected.value.trim(),
      progress: 0,
      note: "만다라트에서 추가",
    });
    msg.hidden = false;
    msg.innerHTML =
      "「" +
      created.title +
      "」을(를) 할일에 추가했습니다. <a href=\"todos.html\">할일에서 보기</a>";
  });

  var resetBtn = document.getElementById("mandala-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (!confirm("만다라트를 샘플 내용으로 되돌릴까요?")) return;
      S.setMandala(S.seedMandala());
      applyFromStore();
      markSaved();
    });
  }

  S.subscribe(function () {
    /* 다른 탭/설정 샘플 초기화 후 동기화 */
    if (document.activeElement && grid.contains(document.activeElement)) return;
    applyFromStore();
  });
})();
