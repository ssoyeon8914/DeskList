import { useEffect, useMemo, useRef, useState } from "react";
import {
  DOC_BODY_MAX,
  DOC_FOLDER_NAME_MAX,
  DOC_TITLE_MAX,
  docsInFolder,
  foldersSorted,
  normalizeMdViewMode,
  renderMarkdownSafe,
  type MdViewMode,
} from "../../domain/notes";
import type { Doc, DocFolder, DocFormat } from "../../domain/types";
import {
  deleteDoc,
  deleteFolder,
  setDocsSelection,
  upsertDoc,
  upsertFolder,
} from "../../state/store";
import { useAppStore } from "../../state/useStore";
import { DLModal } from "../../ui/modal";

function IconMore({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="3.5" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="12.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function IconSplit({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="2.5" y="2.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <line x1="9" y1="2.5" x2="9" y2="15.5" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="5.2" cy="13.2" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.15" />
      <line x1="6.9" y1="14.9" x2="8.3" y2="16.3" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

function IconPreview({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="2.5" y="2.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <rect x="4.5" y="4.5" width="6.5" height="2.2" rx="0.6" fill="currentColor" />
      <line x1="4.5" y1="9" x2="11.5" y2="9" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
      <line x1="4.5" y1="11.5" x2="9.5" y2="11.5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
      <circle cx="12.8" cy="13" r="1.15" fill="currentColor" />
    </svg>
  );
}

function IconEdit({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="2.5" y="2.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <line x1="5" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
      <line x1="5" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
      <line x1="5" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

function IconCollapse({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M8.5 3.25 4.75 7 8.5 10.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NotesPage() {
  const state = useAppStore();
  const folders = useMemo(
    () => foldersSorted(state.docFolders || []),
    [state.docFolders],
  );
  const folderId = state.docsUi?.selectedFolderId ?? null;
  const docId = state.docsUi?.selectedDocId ?? null;
  const mdViewMode = normalizeMdViewMode(state.docsUi?.mdViewMode);
  const foldersCollapsed = !!state.docsUi?.foldersCollapsed;
  const titlesCollapsed = !!state.docsUi?.titlesCollapsed;
  const docs = useMemo(
    () => (folderId ? docsInFolder(state.docs || [], folderId) : []),
    [state.docs, folderId],
  );
  const active = useMemo(
    () => docs.find((d) => d.id === docId) ?? null,
    [docs, docId],
  );
  const [renameId, setRenameId] = useState<string | null>(null);
  const [folderMenuId, setFolderMenuId] = useState<string | null>(null);
  const [docMenuId, setDocMenuId] = useState<string | null>(null);
  const renameRef = useRef<HTMLInputElement | null>(null);
  const folderMenuRef = useRef<HTMLDivElement | null>(null);
  const docMenuRef = useRef<HTMLDivElement | null>(null);
  const previewTimer = useRef<number | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    if (renameId && renameRef.current) renameRef.current.focus();
  }, [renameId]);

  useEffect(() => {
    if (!folderMenuId && !docMenuId) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (folderMenuRef.current && !folderMenuRef.current.contains(t)) {
        setFolderMenuId(null);
      }
      if (docMenuRef.current && !docMenuRef.current.contains(t)) {
        setDocMenuId(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setFolderMenuId(null);
        setDocMenuId(null);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [folderMenuId, docMenuId]);

  useEffect(() => {
    if (!active || active.format !== "markdown") {
      setPreviewHtml("");
      return;
    }
    if (mdViewMode === "edit") {
      setPreviewHtml("");
      return;
    }
    if (previewTimer.current) window.clearTimeout(previewTimer.current);
    previewTimer.current = window.setTimeout(() => {
      setPreviewHtml(renderMarkdownSafe(active.body));
    }, 200);
    return () => {
      if (previewTimer.current) window.clearTimeout(previewTimer.current);
    };
  }, [active?.id, active?.body, active?.format, mdViewMode]);

  function selectFolder(id: string) {
    const list = docsInFolder(state.docs || [], id);
    setFolderMenuId(null);
    setDocsSelection({
      selectedFolderId: id,
      selectedDocId: list[0]?.id ?? null,
    });
  }

  function selectDoc(id: string) {
    setDocsSelection({ selectedDocId: id });
  }

  function setMdView(mode: MdViewMode) {
    setDocsSelection({ mdViewMode: mode });
  }

  function toggleFoldersCollapsed() {
    setDocsSelection({ foldersCollapsed: !foldersCollapsed });
  }

  function toggleTitlesCollapsed() {
    setDocsSelection({ titlesCollapsed: !titlesCollapsed });
  }

  async function onAddFolder() {
    upsertFolder({ name: "새 폴더" });
  }

  async function onDeleteFolder(f: DocFolder) {
    setFolderMenuId(null);
    const n = (state.docs || []).filter((d) => d.folderId === f.id).length;
    const ok = await DLModal.confirm({
      title: "폴더 삭제",
      message: `「${f.name}」 폴더와 안의 노트 ${n}개가 삭제됩니다. 계속할까요?`,
      okLabel: "삭제",
      danger: true,
    });
    if (ok) deleteFolder(f.id);
  }

  function onAddDoc(format: DocFormat) {
    if (!folderId) return;
    upsertDoc({ folderId, title: "", format, body: "" });
  }

  async function onDeleteDoc(d: Doc) {
    const ok = await DLModal.confirm({
      title: "노트 삭제",
      message: `「${d.title || "제목 없음"}」 노트를 삭제할까요?`,
      okLabel: "삭제",
      danger: true,
    });
    if (ok) deleteDoc(d.id);
  }

  function patchDoc(d: Doc, partial: Partial<Doc>) {
    upsertDoc({
      id: d.id,
      folderId: d.folderId,
      title: partial.title !== undefined ? partial.title : d.title,
      format: partial.format !== undefined ? partial.format : d.format,
      body: partial.body !== undefined ? partial.body : d.body,
    });
  }

  const showEdit =
    !active ||
    active.format !== "markdown" ||
    mdViewMode === "edit" ||
    mdViewMode === "split";
  const showPreview =
    !!active && active.format === "markdown" && mdViewMode !== "edit";

  return (
    <main className="main main--notes">
      <div className="page-head page-head--notes">
        <div>
          <h1>노트</h1>
          <p>
            폴더로 묶어 긴 글을 기록합니다. Markdown은 보기 모드로 편집·분할·프리뷰를 고릅니다.
            <br />
            <span className="field-hint">자동 저장 · 마지막 선택 기억 · localStorage</span>
          </p>
        </div>
      </div>

      <div
        className={`notes-shell${foldersCollapsed ? " notes-shell--folders-collapsed" : ""}${
          titlesCollapsed ? " notes-shell--titles-collapsed" : ""
        }`}
        aria-label="노트 3단"
      >
        <aside
          className={`notes-col notes-col--folders${foldersCollapsed ? " is-collapsed" : ""}`}
        >
          <div className="notes-col__head">
            <div className="notes-col__head-start">
              <button
                type="button"
                className="notes-col__toggle"
                aria-expanded={!foldersCollapsed}
                aria-controls="notes-folders"
                title={foldersCollapsed ? "폴더 펼치기" : "폴더 접기"}
                onClick={toggleFoldersCollapsed}
              >
                <IconCollapse />
                <span className="visually-hidden">
                  {foldersCollapsed ? "폴더 펼치기" : "폴더 접기"}
                </span>
              </button>
              <span className="notes-col__label">폴더</span>
            </div>
            <button type="button" className="btn btn--ghost notes-col__add" onClick={onAddFolder}>
              + 폴더
            </button>
          </div>
          <div id="notes-folders">
          {!folders.length ? (
            <p className="notes-empty">폴더를 만들어 기록을 시작하세요.</p>
          ) : (
            <ul className="notes-list">
              {folders.map((f) => (
                <li key={f.id} className="notes-list__row">
                  {renameId === f.id ? (
                    <input
                      ref={renameRef}
                      className="notes-rename"
                      maxLength={DOC_FOLDER_NAME_MAX}
                      defaultValue={f.name}
                      aria-label="폴더 이름"
                      onBlur={(e) => {
                        const v = e.target.value.trim().slice(0, DOC_FOLDER_NAME_MAX);
                        if (v && v !== f.name) upsertFolder({ id: f.id, name: v });
                        setRenameId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        if (e.key === "Escape") setRenameId(null);
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      className={`notes-item${folderId === f.id ? " is-active" : ""}`}
                      onClick={() => selectFolder(f.id)}
                      onDoubleClick={() => setRenameId(f.id)}
                    >
                      <span className="notes-item__label">{f.name}</span>
                    </button>
                  )}
                  <div
                    className="notes-more"
                    ref={folderMenuId === f.id ? folderMenuRef : undefined}
                  >
                    <button
                      type="button"
                      className="notes-more__btn"
                      aria-label={`${f.name} 폴더 메뉴`}
                      aria-haspopup="menu"
                      aria-expanded={folderMenuId === f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderMenuId((cur) => (cur === f.id ? null : f.id));
                      }}
                    >
                      <IconMore />
                    </button>
                    {folderMenuId === f.id ? (
                      <div className="notes-menu" role="menu">
                        <button
                          type="button"
                          role="menuitem"
                          className="notes-menu__item"
                          onClick={() => {
                            setFolderMenuId(null);
                            setRenameId(f.id);
                          }}
                        >
                          이름 변경
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="notes-menu__item notes-menu__item--danger"
                          onClick={() => onDeleteFolder(f)}
                        >
                          삭제
                        </button>
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
          </div>
        </aside>

        <section
          className={`notes-col notes-col--titles${titlesCollapsed ? " is-collapsed" : ""}`}
        >
          <div className="notes-col__head">
            <div className="notes-col__head-start">
              <button
                type="button"
                className="notes-col__toggle"
                aria-expanded={!titlesCollapsed}
                aria-controls="notes-titles"
                title={titlesCollapsed ? "노트 목록 펼치기" : "노트 목록 접기"}
                onClick={toggleTitlesCollapsed}
              >
                <IconCollapse />
                <span className="visually-hidden">
                  {titlesCollapsed ? "노트 목록 펼치기" : "노트 목록 접기"}
                </span>
              </button>
              <span className="notes-col__label">노트</span>
            </div>
            <div className="notes-col__add-group">
              <button
                type="button"
                className="btn btn--ghost notes-col__add"
                disabled={!folderId}
                onClick={() => onAddDoc("text")}
              >
                + txt
              </button>
              <button
                type="button"
                className="btn btn--ghost notes-col__add"
                disabled={!folderId}
                onClick={() => onAddDoc("markdown")}
              >
                + md
              </button>
            </div>
          </div>
          <div id="notes-titles">
          {!folderId ? (
            <p className="notes-empty">폴더를 선택하세요.</p>
          ) : !docs.length ? (
            <p className="notes-empty">이 폴더에 노트를 추가하세요.</p>
          ) : (
            <ul className="notes-list">
              {docs.map((d) => (
                <li key={d.id} className="notes-list__row">
                  <button
                    type="button"
                    className={`notes-item${docId === d.id ? " is-active" : ""}`}
                    onClick={() => selectDoc(d.id)}
                  >
                    <span className="notes-item__label">
                      {d.title || "제목 없음"}
                    </span>
                    <span className="notes-badge">{d.format === "markdown" ? "md" : "txt"}</span>
                  </button>
                  <div
                    className="notes-more"
                    ref={docMenuId === d.id ? docMenuRef : undefined}
                  >
                    <button
                      type="button"
                      className="notes-more__btn"
                      aria-label={`${d.title || "제목 없음"} 노트 메뉴`}
                      aria-haspopup="menu"
                      aria-expanded={docMenuId === d.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDocMenuId((cur) => (cur === d.id ? null : d.id));
                      }}
                    >
                      <IconMore />
                    </button>
                    {docMenuId === d.id ? (
                      <div className="notes-menu" role="menu">
                        <button
                          type="button"
                          role="menuitem"
                          className="notes-menu__item notes-menu__item--danger"
                          onClick={() => {
                            setDocMenuId(null);
                            void onDeleteDoc(d);
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
          </div>
        </section>

        <section className="notes-col notes-col--editor">
          {!active ? (
            <p className="notes-empty notes-empty--center">
              가운데에서 노트를 선택하세요.
            </p>
          ) : (
            <>
              <div className="notes-editor__meta">
                <input
                  className="notes-editor__title"
                  type="text"
                  maxLength={DOC_TITLE_MAX}
                  aria-label="노트 제목"
                  placeholder="제목"
                  value={active.title}
                  onChange={(e) =>
                    patchDoc(active, {
                      title: e.target.value.slice(0, DOC_TITLE_MAX),
                    })
                  }
                />
                <label className="notes-format">
                  <span className="visually-hidden">형식</span>
                  <select
                    value={active.format}
                    aria-label="노트 형식"
                    onChange={(e) =>
                      patchDoc(active, {
                        format: e.target.value as DocFormat,
                      })
                    }
                  >
                    <option value="text">txt</option>
                    <option value="markdown">md</option>
                  </select>
                </label>
                {active.format === "markdown" ? (
                  <div
                    className="notes-view"
                    role="group"
                    aria-label="마크다운 보기 모드"
                  >
                    <button
                      type="button"
                      className={`notes-view__icon${mdViewMode === "edit" ? " is-on" : ""}`}
                      aria-label="MD만"
                      aria-pressed={mdViewMode === "edit"}
                      title="MD만"
                      onClick={() => setMdView("edit")}
                    >
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      className={`notes-view__icon${mdViewMode === "split" ? " is-on" : ""}`}
                      aria-label="이분할"
                      aria-pressed={mdViewMode === "split"}
                      title="이분할"
                      onClick={() => setMdView("split")}
                    >
                      <IconSplit />
                    </button>
                    <button
                      type="button"
                      className={`notes-view__icon${mdViewMode === "preview" ? " is-on" : ""}`}
                      aria-label="프리뷰만"
                      aria-pressed={mdViewMode === "preview"}
                      title="프리뷰만"
                      onClick={() => setMdView("preview")}
                    >
                      <IconPreview />
                    </button>
                  </div>
                ) : null}
              </div>
              <div
                className={`notes-workspace${
                  active.format === "markdown" && mdViewMode === "split"
                    ? " notes-workspace--split"
                    : ""
                }${
                  active.format === "markdown" && mdViewMode === "preview"
                    ? " notes-workspace--preview"
                    : ""
                }`}
              >
                {showEdit ? (
                  <textarea
                    className="notes-editor__body"
                    maxLength={DOC_BODY_MAX}
                    aria-label={
                      active.format === "markdown" ? "마크다운 원문" : "노트 본문"
                    }
                    placeholder={
                      active.format === "markdown"
                        ? "Markdown을 입력하세요…"
                        : "내용을 입력하세요…"
                    }
                    value={active.body}
                    onChange={(e) =>
                      patchDoc(active, {
                        body: e.target.value.slice(0, DOC_BODY_MAX),
                      })
                    }
                  />
                ) : null}
                {showPreview ? (
                  <div
                    className="notes-preview"
                    aria-label="마크다운 프리뷰"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : null}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
