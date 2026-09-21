/**
 * DeskList 목업 공통 모달 — native alert/confirm 대체.
 * 이후 목업 안내·확인은 모두 DLModal을 사용한다.
 *
 * DLModal.alert({ title?, message, okLabel? }) → Promise<void>
 * DLModal.confirm({ title?, message, okLabel?, cancelLabel?, danger? }) → Promise<boolean>
 */
(function (global) {
  var ROOT_ID = "dl-modal-root";
  var active = null;

  function ensureRoot() {
    var el = document.getElementById(ROOT_ID);
    if (el) return el;
    el = document.createElement("div");
    el.id = ROOT_ID;
    el.className = "dl-modal";
    el.hidden = true;
    el.innerHTML =
      '<div class="dl-modal__backdrop" data-dl-dismiss="backdrop"></div>' +
      '<div class="dl-modal__panel" role="dialog" aria-modal="true" aria-labelledby="dl-modal-title" aria-describedby="dl-modal-body">' +
      '  <h2 class="dl-modal__title" id="dl-modal-title"></h2>' +
      '  <p class="dl-modal__body" id="dl-modal-body"></p>' +
      '  <div class="dl-modal__actions">' +
      '    <button type="button" class="btn dl-modal__cancel" data-dl-action="cancel">취소</button>' +
      '    <button type="button" class="btn btn--primary dl-modal__ok" data-dl-action="ok">확인</button>' +
      "  </div>" +
      "</div>";
    document.body.appendChild(el);
    return el;
  }

  function close(result) {
    if (!active) return;
    var root = active.root;
    var resolve = active.resolve;
    var prevFocus = active.prevFocus;
    document.removeEventListener("keydown", active.onKey);
    root.hidden = true;
    root.classList.remove("dl-modal--open");
    document.body.classList.remove("dl-modal-open");
    active = null;
    if (prevFocus && typeof prevFocus.focus === "function") {
      try {
        prevFocus.focus();
      } catch (_) {}
    }
    resolve(result);
  }

  function open(opts) {
    var mode = opts.mode === "alert" ? "alert" : "confirm";
    var root = ensureRoot();
    var titleEl = root.querySelector(".dl-modal__title");
    var bodyEl = root.querySelector(".dl-modal__body");
    var cancelBtn = root.querySelector(".dl-modal__cancel");
    var okBtn = root.querySelector(".dl-modal__ok");

    titleEl.textContent = opts.title || (mode === "alert" ? "알림" : "확인");
    bodyEl.textContent = opts.message || "";
    okBtn.textContent = opts.okLabel || "확인";
    cancelBtn.textContent = opts.cancelLabel || "취소";
    cancelBtn.hidden = mode === "alert";
    okBtn.classList.toggle("btn--danger", Boolean(opts.danger) && mode === "confirm");
    okBtn.classList.toggle("btn--primary", !(opts.danger && mode === "confirm"));

    return new Promise(function (resolve) {
      if (active) close(mode === "alert" ? undefined : false);

      function onKey(e) {
        if (e.key === "Escape") {
          e.preventDefault();
          close(mode === "alert" ? undefined : false);
        } else if (e.key === "Enter" && e.target === okBtn) {
          e.preventDefault();
          close(mode === "alert" ? undefined : true);
        }
      }

      active = {
        root: root,
        resolve: resolve,
        prevFocus: document.activeElement,
        onKey: onKey,
        mode: mode,
      };

      root.onclick = function (e) {
        var t = e.target;
        if (t.getAttribute("data-dl-dismiss") === "backdrop") {
          close(mode === "alert" ? undefined : false);
          return;
        }
        var action = t.getAttribute("data-dl-action");
        if (action === "ok") close(mode === "alert" ? undefined : true);
        if (action === "cancel") close(false);
      };

      document.addEventListener("keydown", onKey);
      root.hidden = false;
      root.classList.add("dl-modal--open");
      document.body.classList.add("dl-modal-open");
      okBtn.focus();
    });
  }

  global.DLModal = {
    alert: function (opts) {
      if (typeof opts === "string") opts = { message: opts };
      return open({
        mode: "alert",
        title: opts.title,
        message: opts.message,
        okLabel: opts.okLabel,
      });
    },
    confirm: function (opts) {
      if (typeof opts === "string") opts = { message: opts };
      return open({
        mode: "confirm",
        title: opts.title,
        message: opts.message,
        okLabel: opts.okLabel,
        cancelLabel: opts.cancelLabel,
        danger: opts.danger,
      });
    },
  };
})(window);
