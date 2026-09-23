(function () {
  var S = window.DeskList;
  var Md = window.NotesMd;
  var BODY_MAX = S.DOC_BODY_MAX || 50000;
  var TITLE_MAX = S.DOC_TITLE_MAX || 120;
  var FOLDER_MAX = S.DOC_FOLDER_NAME_MAX || 40;
  var renameId = null;
  var folderMenuId = null;
  var docMenuId = null;
  var previewTimer = null;

  var ICON_MORE =
    '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="3.5" r="1.25" fill="currentColor"/><circle cx="8" cy="8" r="1.25" fill="currentColor"/><circle cx="8" cy="12.5" r="1.25" fill="currentColor"/></svg>';
  var ICON_EDIT =
    '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><rect x="2.5" y="2.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.25"/><line x1="5" y1="6" x2="13" y2="6" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/><line x1="5" y1="9" x2="13" y2="9" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/><line x1="5" y1="12" x2="10" y2="12" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/></svg>';
  var ICON_SPLIT =
    '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><rect x="2.5" y="2.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.25"/><line x1="9" y1="2.5" x2="9" y2="15.5" stroke="currentColor" stroke-width="1.25"/><circle cx="5.2" cy="13.2" r="2.4" fill="none" stroke="currentColor" stroke-width="1.15"/><line x1="6.9" y1="14.9" x2="8.3" y2="16.3" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/></svg>';
  var ICON_PREVIEW =
    '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><rect x="2.5" y="2.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.25"/><rect x="4.5" y="4.5" width="6.5" height="2.2" rx="0.6" fill="currentColor"/><line x1="4.5" y1="9" x2="11.5" y2="9" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/><line x1="4.5" y1="11.5" x2="9.5" y2="11.5" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/><circle cx="12.8" cy="13" r="1.15" fill="currentColor"/></svg>';

  function esc(s) {
    return String(s == null ? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ui() {
    var st = S.getState();
    return (
      st.docsUi || {
        selectedFolderId: null,
        selectedDocId: null,
        mdViewMode: "edit",
        foldersCollapsed: false,
        titlesCollapsed: false,
      }
    );
  }

  function mdMode() {
    var m = ui().mdViewMode;
    return m === "split" || m === "preview" || m === "edit" ? m : "edit";
  }

  function applyShellLayout() {
    var shell = document.getElementById("notes-shell");
    var foldersCol = document.getElementById("notes-col-folders");
    var titlesCol = document.getElementById("notes-col-titles");
    var foldersBtn = document.getElementById("notes-toggle-folders");
    var titlesBtn = document.getElementById("notes-toggle-titles");
    if (!shell || !foldersCol || !titlesCol) return;
    var foldersCollapsed = !!ui().foldersCollapsed;
    var titlesCollapsed = !!ui().titlesCollapsed;
    shell.classList.toggle("notes-shell--folders-collapsed", foldersCollapsed);
    shell.classList.toggle("notes-shell--titles-collapsed", titlesCollapsed);
    foldersCol.classList.toggle("is-collapsed", foldersCollapsed);
    titlesCol.classList.toggle("is-collapsed", titlesCollapsed);
    if (foldersBtn) {
      foldersBtn.setAttribute("aria-expanded", foldersCollapsed ? "false" : "true");
      foldersBtn.title = foldersCollapsed ? "폴더 펼치기" : "폴더 접기";
      var foldersSr = foldersBtn.querySelector(".visually-hidden");
      if (foldersSr) foldersSr.textContent = foldersBtn.title;
    }
    if (titlesBtn) {
      titlesBtn.setAttribute("aria-expanded", titlesCollapsed ? "false" : "true");
      titlesBtn.title = titlesCollapsed ? "노트 목록 펼치기" : "노트 목록 접기";
      var titlesSr = titlesBtn.querySelector(".visually-hidden");
      if (titlesSr) titlesSr.textContent = titlesBtn.title;
    }
  }

  function renderFolders() {
    var el = document.getElementById("notes-folders");
    var folders = S.foldersSorted();
    var selected = ui().selectedFolderId;
    if (!folders.length) {
      el.innerHTML = '<p class="notes-empty">폴더를 만들어 기록을 시작하세요.</p>';
      return;
    }
    el.innerHTML =
      '<ul class="notes-list">' +
      folders
        .map(function (f) {
          if (renameId === f.id) {
            return (
              '<li class="notes-list__row">' +
              '<input class="notes-rename" data-rename="' +
              esc(f.id) +
              '" maxlength="' +
              FOLDER_MAX +
              '" value="' +
              esc(f.name) +
              '" aria-label="폴더 이름" />' +
              "</li>"
            );
          }
          return (
            '<li class="notes-list__row">' +
            '<button type="button" class="notes-item' +
            (selected === f.id ? " is-active" : "") +
            '" data-folder="' +
            esc(f.id) +
            '"><span class="notes-item__label">' +
            esc(f.name) +
            "</span></button>" +
            '<div class="notes-more">' +
            '<button type="button" class="notes-more__btn" data-folder-menu="' +
            esc(f.id) +
            '" aria-label="' +
            esc(f.name) +
            ' 폴더 메뉴" aria-haspopup="menu" aria-expanded="' +
            (folderMenuId === f.id) +
            '">'+
            ICON_MORE +
            "</button>" +
            (folderMenuId === f.id
              ? '<div class="notes-menu" role="menu">' +
                '<button type="button" role="menuitem" class="notes-menu__item" data-rename-btn="' +
                esc(f.id) +
                '">이름 변경</button>' +
                '<button type="button" role="menuitem" class="notes-menu__item notes-menu__item--danger" data-del-folder="' +
                esc(f.id) +
                '">삭제</button></div>'
              : "") +
            "</div></li>"
          );
        })
        .join("") +
      "</ul>";
    var inp = el.querySelector(".notes-rename");
    if (inp) {
      inp.focus();
      inp.select();
    }
  }

  function renderTitles() {
    var el = document.getElementById("notes-titles");
    var folderId = ui().selectedFolderId;
    var docId = ui().selectedDocId;
    var addTxt = document.getElementById("notes-add-txt");
    var addMd = document.getElementById("notes-add-md");
    addTxt.disabled = !folderId;
    addMd.disabled = !folderId;
    if (!folderId) {
      el.innerHTML = '<p class="notes-empty">폴더를 선택하세요.</p>';
      return;
    }
    var docs = S.docsInFolder(folderId);
    if (!docs.length) {
      el.innerHTML = '<p class="notes-empty">이 폴더에 노트를 추가하세요.</p>';
      return;
    }
    el.innerHTML =
      '<ul class="notes-list">' +
      docs
        .map(function (d) {
          return (
            '<li class="notes-list__row">' +
            '<button type="button" class="notes-item' +
            (docId === d.id ? " is-active" : "") +
            '" data-doc="' +
            esc(d.id) +
            '"><span class="notes-item__label">' +
            esc(d.title || "제목 없음") +
            '</span><span class="notes-badge">' +
            (d.format === "markdown" ? "md" : "txt") +
            "</span></button>" +
            '<div class="notes-more">' +
            '<button type="button" class="notes-more__btn" data-doc-menu="' +
            esc(d.id) +
            '" aria-label="노트 메뉴" aria-haspopup="menu" aria-expanded="' +
            (docMenuId === d.id) +
            '">'+
            ICON_MORE +
            "</button>" +
            (docMenuId === d.id
              ? '<div class="notes-menu" role="menu">' +
                '<button type="button" role="menuitem" class="notes-menu__item notes-menu__item--danger" data-del-doc="' +
                esc(d.id) +
                '">삭제</button></div>'
              : "") +
            "</div></li>"
          );
        })
        .join("") +
      "</ul>";
  }

  function renderEditor() {
    var el = document.getElementById("notes-editor");
    var docId = ui().selectedDocId;
    var d = docId ? S.getDoc(docId) : null;
    if (!d) {
      el.innerHTML =
        '<p class="notes-empty notes-empty--center">가운데에서 노트를 선택하세요.</p>';
      return;
    }
    var isMd = d.format === "markdown";
    var mode = mdMode();
    var showEdit = !isMd || mode === "edit" || mode === "split";
    var showPreview = isMd && mode !== "edit";
    var wsClass = "notes-workspace";
    if (isMd && mode === "split") wsClass += " notes-workspace--split";
    if (isMd && mode === "preview") wsClass += " notes-workspace--preview";

    el.innerHTML =
      '<div class="notes-editor__meta">' +
      '<input class="notes-editor__title" type="text" maxlength="' +
      TITLE_MAX +
      '" aria-label="노트 제목" placeholder="제목" value="' +
      esc(d.title) +
      '" data-field="title" />' +
      '<label class="notes-format"><span class="visually-hidden">형식</span>' +
      '<select aria-label="노트 형식" data-field="format">' +
      '<option value="text"' +
      (d.format === "text" ? " selected" : "") +
      ">txt</option>" +
      '<option value="markdown"' +
      (isMd ? " selected" : "") +
      ">md</option></select></label>" +
      (isMd
        ? '<div class="notes-view" role="group" aria-label="마크다운 보기 모드">' +
          '<button type="button" class="notes-view__icon' +
          (mode === "edit" ? " is-on" : "") +
          '" data-md-view="edit" aria-label="MD만" aria-pressed="' +
          (mode === "edit") +
          '" title="MD만">' +
          ICON_EDIT +
          "</button>" +
          '<button type="button" class="notes-view__icon' +
          (mode === "split" ? " is-on" : "") +
          '" data-md-view="split" aria-label="이분할" aria-pressed="' +
          (mode === "split") +
          '" title="이분할">' +
          ICON_SPLIT +
          "</button>" +
          '<button type="button" class="notes-view__icon' +
          (mode === "preview" ? " is-on" : "") +
          '" data-md-view="preview" aria-label="프리뷰만" aria-pressed="' +
          (mode === "preview") +
          '" title="프리뷰만">' +
          ICON_PREVIEW +
          "</button></div>"
        : "") +
      "</div>" +
      '<div class="' +
      wsClass +
      '">' +
      (showEdit
        ? '<textarea class="notes-editor__body" maxlength="' +
          BODY_MAX +
          '" aria-label="' +
          (isMd ? "마크다운 원문" : "노트 본문") +
          '" placeholder="' +
          (isMd ? "Markdown을 입력하세요…" : "내용을 입력하세요…") +
          '" data-field="body">' +
          esc(d.body) +
          "</textarea>"
        : "") +
      (showPreview
        ? '<div class="notes-preview" aria-label="마크다운 프리뷰" id="notes-preview"></div>'
        : "") +
      "</div>";

    if (showPreview) updatePreview(d.body);
  }

  function updatePreview(body) {
    var prev = document.getElementById("notes-preview");
    if (!prev || !Md) return;
    prev.innerHTML = Md.renderMarkdownSafe(body);
  }

  function render(opts) {
    opts = opts || {};
    applyShellLayout();
    renderFolders();
    renderTitles();
    var editor = document.getElementById("notes-editor");
    var ae = document.activeElement;
    if (
      !opts.forceEditor &&
      editor &&
      ae &&
      editor.contains(ae) &&
      (ae.getAttribute("data-field") === "body" ||
        ae.getAttribute("data-field") === "title")
    ) {
      return;
    }
    renderEditor();
  }

  document.getElementById("notes-toggle-folders").addEventListener("click", function () {
    S.setDocsSelection({ foldersCollapsed: !ui().foldersCollapsed });
  });

  document.getElementById("notes-toggle-titles").addEventListener("click", function () {
    S.setDocsSelection({ titlesCollapsed: !ui().titlesCollapsed });
  });

  document.getElementById("notes-add-folder").addEventListener("click", function () {
    S.upsertFolder({ name: "새 폴더" });
  });

  document.getElementById("notes-add-txt").addEventListener("click", function () {
    var folderId = ui().selectedFolderId;
    if (!folderId) return;
    S.upsertDoc({ folderId: folderId, title: "", format: "text", body: "" });
  });

  document.getElementById("notes-add-md").addEventListener("click", function () {
    var folderId = ui().selectedFolderId;
    if (!folderId) return;
    S.upsertDoc({ folderId: folderId, title: "", format: "markdown", body: "" });
  });

  document.getElementById("notes-folders").addEventListener("click", function (e) {
    var menuBtn = e.target.closest("[data-folder-menu]");
    if (menuBtn) {
      e.stopPropagation();
      var mid = menuBtn.getAttribute("data-folder-menu");
      folderMenuId = folderMenuId === mid ? null : mid;
      docMenuId = null;
      render();
      return;
    }
    var btn = e.target.closest("[data-folder]");
    if (btn) {
      folderMenuId = null;
      S.setDocsSelection({ selectedFolderId: btn.getAttribute("data-folder") });
      return;
    }
    var ren = e.target.closest("[data-rename-btn]");
    if (ren) {
      renameId = ren.getAttribute("data-rename-btn");
      folderMenuId = null;
      render();
      return;
    }
    var del = e.target.closest("[data-del-folder]");
    if (del) {
      var id = del.getAttribute("data-del-folder");
      var f = S.getFolder(id);
      folderMenuId = null;
      if (!f) return;
      var n = S.docsInFolder(id).length;
      DLModal.confirm({
        title: "폴더 삭제",
        message:
          "「" + f.name + "」 폴더와 안의 노트 " + n + "개가 삭제됩니다. 계속할까요?",
        okLabel: "삭제",
        danger: true,
      }).then(function (ok) {
        if (ok) S.deleteFolder(id);
        else render();
      });
    }
  });

  document.getElementById("notes-folders").addEventListener(
    "blur",
    function (e) {
      if (!e.target.classList.contains("notes-rename")) return;
      var id = e.target.getAttribute("data-rename");
      var v = e.target.value.trim().slice(0, FOLDER_MAX);
      renameId = null;
      if (v) S.upsertFolder({ id: id, name: v });
      else render();
    },
    true,
  );

  document.getElementById("notes-folders").addEventListener("keydown", function (e) {
    if (!e.target.classList.contains("notes-rename")) return;
    if (e.key === "Enter") e.target.blur();
    if (e.key === "Escape") {
      renameId = null;
      render();
    }
  });

  document.getElementById("notes-titles").addEventListener("click", function (e) {
    var menuBtn = e.target.closest("[data-doc-menu]");
    if (menuBtn) {
      e.stopPropagation();
      var mid = menuBtn.getAttribute("data-doc-menu");
      docMenuId = docMenuId === mid ? null : mid;
      folderMenuId = null;
      render();
      return;
    }
    var docBtn = e.target.closest("[data-doc]");
    if (docBtn) {
      docMenuId = null;
      S.setDocsSelection({ selectedDocId: docBtn.getAttribute("data-doc") });
      return;
    }
    var del = e.target.closest("[data-del-doc]");
    if (!del) return;
    var id = del.getAttribute("data-del-doc");
    var d = S.getDoc(id);
    docMenuId = null;
    if (!d) return;
    DLModal.confirm({
      title: "노트 삭제",
      message: "「" + (d.title || "제목 없음") + "」 노트를 삭제할까요?",
      okLabel: "삭제",
      danger: true,
    }).then(function (ok) {
      if (ok) S.deleteDoc(id);
      else render();
    });
  });

  document.getElementById("notes-editor").addEventListener("click", function (e) {
    var viewBtn = e.target.closest("[data-md-view]");
    if (!viewBtn) return;
    S.setDocsSelection({ mdViewMode: viewBtn.getAttribute("data-md-view") });
  });

  document.getElementById("notes-editor").addEventListener("input", function (e) {
    var field = e.target.getAttribute("data-field");
    if (!field) return;
    var d = S.getDoc(ui().selectedDocId);
    if (!d) return;
    if (field === "title") {
      S.upsertDoc({
        id: d.id,
        folderId: d.folderId,
        title: e.target.value.slice(0, TITLE_MAX),
        format: d.format,
        body: d.body,
      });
      return;
    }
    if (field === "body") {
      var body = e.target.value.slice(0, BODY_MAX);
      S.upsertDoc({
        id: d.id,
        folderId: d.folderId,
        title: d.title,
        format: d.format,
        body: body,
      });
      if (d.format === "markdown" && mdMode() !== "edit") {
        if (previewTimer) clearTimeout(previewTimer);
        previewTimer = setTimeout(function () {
          updatePreview(body);
        }, 200);
      }
    }
  });

  document.getElementById("notes-editor").addEventListener("change", function (e) {
    if (e.target.getAttribute("data-field") !== "format") return;
    var d = S.getDoc(ui().selectedDocId);
    if (!d) return;
    S.upsertDoc({
      id: d.id,
      folderId: d.folderId,
      title: d.title,
      format: e.target.value,
      body: d.body,
    });
    render({ forceEditor: true });
  });

  document.addEventListener("mousedown", function (e) {
    if (!folderMenuId && !docMenuId) return;
    if (e.target.closest(".notes-more")) return;
    folderMenuId = null;
    docMenuId = null;
    render();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!folderMenuId && !docMenuId) return;
    folderMenuId = null;
    docMenuId = null;
    render();
  });

  S.subscribe(function () {
    render();
  });
  render({ forceEditor: true });
})();
