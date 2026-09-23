import { useEffect, useMemo, useRef, useState } from "react";
import {
  MEMO_BODY_MAX,
  MEMO_CATEGORY_DEFAULT,
  MEMO_CATEGORY_MAX,
  MEMO_COLORS,
  MEMO_TITLE_MAX,
  effectiveCategory,
  memoCategories,
  memosInCategory,
  memosSorted,
} from "../../domain/memos";
import type { Memo, MemoColor } from "../../domain/types";
import { deleteMemo, upsertMemo } from "../../state/store";
import { useAppStore } from "../../state/useStore";
import { DLModal } from "../../ui/modal";

export function MemosPage() {
  const state = useAppStore();
  const all = useMemo(() => memosSorted(state.memos || []), [state.memos]);
  const categories = useMemo(() => memoCategories(all), [all]);
  const [filter, setFilter] = useState<string | "all">("all");
  const [focusId, setFocusId] = useState<string | null>(null);
  const focusRef = useRef<HTMLInputElement | null>(null);

  const list = useMemo(
    () => memosInCategory(all, filter),
    [all, filter],
  );

  useEffect(() => {
    if (filter !== "all" && !categories.includes(filter)) {
      setFilter("all");
    }
  }, [categories, filter]);

  useEffect(() => {
    if (!focusId || !focusRef.current) return;
    focusRef.current.focus();
    setFocusId(null);
  }, [focusId, list]);

  function addMemo() {
    const category = filter === "all" ? MEMO_CATEGORY_DEFAULT : filter;
    const m = upsertMemo({ title: "", body: "", color: "cream", category });
    setFocusId(m.id);
  }

  function patch(m: Memo, partial: Partial<Memo>) {
    upsertMemo({
      id: m.id,
      title: partial.title !== undefined ? partial.title : m.title,
      category: partial.category !== undefined ? partial.category : m.category,
      body: partial.body !== undefined ? partial.body : m.body,
      color: partial.color !== undefined ? partial.color : m.color,
      width: partial.width !== undefined ? partial.width : m.width,
      height: partial.height !== undefined ? partial.height : m.height,
    });
  }

  function onDelete(m: Memo) {
    void DLModal.confirm({
      title: "메모 삭제",
      message: "이 메모를 삭제할까요?",
      okLabel: "삭제",
      danger: true,
    }).then((ok) => {
      if (ok) deleteMemo(m.id);
    });
  }

  function saveSize(m: Memo, el: HTMLElement) {
    const w = Math.round(el.offsetWidth);
    const h = Math.round(el.offsetHeight);
    if (w === m.width && h === m.height) return;
    patch(m, { width: w, height: h });
  }

  return (
    <main className="main">
      <div className="page-head">
        <div>
          <h1>메모</h1>
          <p>
            카테고리로 나눠 정리하고, 모서리로 크기를 조절할 수 있습니다.
            <br />
            <span className="field-hint">자동 저장 · localStorage</span>
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={addMemo}>
          메모 추가
        </button>
      </div>

      <div className="memo-toolbar" role="group" aria-label="카테고리 필터">
        <button
          type="button"
          className={`memo-filter${filter === "all" ? " is-active" : ""}`}
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          전체
          <span className="memo-filter__count">{all.length}</span>
        </button>
        {categories.map((c) => {
          const n = all.filter((m) => effectiveCategory(m.category) === c).length;
          return (
            <button
              key={c}
              type="button"
              className={`memo-filter${filter === c ? " is-active" : ""}`}
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {c}
              <span className="memo-filter__count">{n}</span>
            </button>
          );
        })}
      </div>

      <datalist id="memo-category-list">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="memo-board" aria-label="메모 보드">
        {!list.length ? (
          <div className="memo-empty">
            <p>
              {filter === "all"
                ? "첫 메모를 남겨 보세요."
                : `「${filter}」 카테고리에 메모가 없습니다.`}
            </p>
            <button type="button" className="btn btn--primary" onClick={addMemo}>
              메모 추가
            </button>
          </div>
        ) : (
          list.map((m) => (
            <article
              key={m.id}
              className={`memo-card memo-card--${m.color}`}
              data-id={m.id}
              style={{ width: m.width, height: m.height }}
              onPointerUp={(e) => saveSize(m, e.currentTarget)}
            >
              <input
                ref={focusId === m.id ? focusRef : undefined}
                className="memo-card__title"
                type="text"
                maxLength={MEMO_TITLE_MAX}
                aria-label="메모 제목"
                placeholder="제목"
                value={m.title}
                onChange={(e) =>
                  patch(m, { title: e.target.value.slice(0, MEMO_TITLE_MAX) })
                }
              />
              <input
                className="memo-card__cat"
                type="text"
                list="memo-category-list"
                maxLength={MEMO_CATEGORY_MAX}
                aria-label="카테고리"
                placeholder="카테고리"
                value={m.category}
                onChange={(e) =>
                  patch(m, {
                    category: e.target.value.slice(0, MEMO_CATEGORY_MAX),
                  })
                }
                onBlur={(e) => {
                  const next =
                    e.target.value.trim().slice(0, MEMO_CATEGORY_MAX) ||
                    MEMO_CATEGORY_DEFAULT;
                  if (next !== m.category) patch(m, { category: next });
                }}
              />
              <textarea
                className="memo-card__body"
                maxLength={MEMO_BODY_MAX}
                aria-label="메모 내용"
                placeholder="적어 보세요…"
                value={m.body}
                onChange={(e) =>
                  patch(m, { body: e.target.value.slice(0, MEMO_BODY_MAX) })
                }
              />
              <div className="memo-card__bar">
                <div className="memo-card__swatches">
                  {MEMO_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`memo-swatch memo-swatch--${c}${m.color === c ? " is-on" : ""}`}
                      aria-label={`색 ${c}`}
                      aria-pressed={m.color === c}
                      onClick={() => patch(m, { color: c as MemoColor })}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn--ghost memo-card__del"
                  onClick={() => onDelete(m)}
                >
                  삭제
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
