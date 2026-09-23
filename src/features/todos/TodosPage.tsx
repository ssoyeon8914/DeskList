import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { weekDates } from "../../domain/calendarGrid";
import { displayOf, statusOf } from "../../domain/derive";
import { allCategories, filteredTodos } from "../../domain/filter";
import {
  addDaysIso,
  dateRangeLabel,
  isRecurTodo,
  isRangeTodo,
} from "../../domain/todoDates";
import type { Priority, ScheduleMode, Todo } from "../../domain/types";
import {
  applyWeekDateFilter,
  deleteTodo,
  resetFilters,
  selectTodo,
  setFilterGroup,
  toggleFilterValue,
  upsertTodo,
} from "../../state/store";
import { useAppStore } from "../../state/useStore";
import { FilterGroup } from "../../ui/FilterGroup";
import { DLModal } from "../../ui/modal";
import { TodosKpi } from "./TodosKpi";
import { WeekPanel } from "./WeekPanel";

type FormState = {
  id: string;
  type: string;
  dateStart: string;
  dateEnd: string;
  mode: ScheduleMode;
  weekdays: number[];
  category: string;
  priority: Priority;
  title: string;
  progress: number;
  note: string;
};

const DEFAULT_WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function emptyForm(defaultType: string, defaultDate: string): FormState {
  return {
    id: "",
    type: defaultType,
    dateStart: defaultDate,
    dateEnd: defaultDate,
    mode: "single",
    weekdays: DEFAULT_WEEKDAYS.slice(),
    category: "",
    priority: "중간",
    title: "",
    progress: 0,
    note: "",
  };
}

function modeFromTodo(todo: Todo): ScheduleMode {
  if (isRecurTodo(todo)) return "recur";
  if (isRangeTodo(todo)) return "range";
  return "single";
}

export function TodosPage() {
  const state = useAppStore();
  const [searchParams] = useSearchParams();
  const list = useMemo(() => filteredTodos(state), [state]);
  const cats = allCategories(state.todos);

  const defaultDate = useMemo(() => {
    const dates = state.filters.dates;
    if (dates.length === 1) return dates[0];
    const wd = weekDates(
      state.week.year,
      state.week.month,
      state.week.weekIndex,
      state.weekStartsOn,
    );
    return wd[0] || "2026-09-16";
  }, [state.filters.dates, state.week, state.weekStartsOn]);

  const [form, setForm] = useState<FormState>(() =>
    emptyForm(state.types[0]?.name || "할일", defaultDate),
  );
  const [creating, setCreating] = useState(() => !state.selectedId);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const workspace = workspaceRef.current;
    const editor = editorRef.current;
    if (!workspace || !editor) return;

    function syncHeight() {
      if (!workspace || !editor) return;
      if (window.matchMedia("(max-width: 960px)").matches) {
        workspace.style.removeProperty("--todos-editor-h");
        return;
      }
      const h = Math.round(editor.getBoundingClientRect().height);
      if (h > 0) workspace.style.setProperty("--todos-editor-h", `${h}px`);
    }

    const ro = new ResizeObserver(syncHeight);
    ro.observe(editor);
    window.addEventListener("resize", syncHeight);
    syncHeight();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncHeight);
    };
  }, [creating, form.id, form.mode]);

  useEffect(() => {
    const d = searchParams.get("date");
    if (d) setFilterGroup("dates", [d]);
    else applyWeekDateFilter();
  }, [searchParams]);

  useEffect(() => {
    if (!state.selectedId) return;
    const sel = state.todos.find((t) => t.id === state.selectedId);
    if (!sel) return;
    setCreating(false);
    setForm({
      id: sel.id,
      type: sel.type,
      dateStart: sel.dateStart,
      dateEnd: sel.dateEnd,
      mode: modeFromTodo(sel),
      weekdays: sel.recur?.weekdays?.slice() || DEFAULT_WEEKDAYS.slice(),
      category: sel.category,
      priority: sel.priority,
      title: sel.title,
      progress: sel.progress,
      note: sel.note || "",
    });
  }, [state.selectedId, state.todos]);

  function patchForm(patch: Partial<FormState>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function setMode(mode: ScheduleMode) {
    setForm((f) => {
      if (mode === "single") {
        return { ...f, mode, dateEnd: f.dateStart };
      }
      if (mode === "range") {
        const end =
          f.dateEnd > f.dateStart ? f.dateEnd : addDaysIso(f.dateStart, 1);
        return { ...f, mode, dateEnd: end };
      }
      const end =
        f.dateEnd > f.dateStart ? f.dateEnd : addDaysIso(f.dateStart, 28);
      const weekdays = f.weekdays.length ? f.weekdays : DEFAULT_WEEKDAYS.slice();
      return { ...f, mode, dateEnd: end, weekdays };
    });
  }

  function toggleWeekday(day: number) {
    setForm((f) => {
      const on = f.weekdays.includes(day);
      const weekdays = on
        ? f.weekdays.filter((d) => d !== day)
        : [...f.weekdays, day].sort((a, b) => a - b);
      return { ...f, weekdays };
    });
  }

  function startNew() {
    selectTodo(null);
    setCreating(true);
    setForm(emptyForm(state.types[0]?.name || "할일", defaultDate));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const start = form.dateStart;
    let end = form.mode === "single" ? start : form.dateEnd;
    if (!end || end < start) end = start;

    if (form.mode === "recur" && !form.weekdays.length) {
      void DLModal.alert({
        title: "반복 요일",
        message: "반복할 요일을 하나 이상 선택해 주세요.",
      });
      return;
    }

    upsertTodo({
      id: form.id || undefined,
      type: form.type,
      dateStart: start,
      dateEnd: end,
      recur:
        form.mode === "recur"
          ? { freq: "weekly", weekdays: form.weekdays }
          : null,
      category: form.category,
      priority: form.priority,
      title: form.title,
      progress: form.progress,
      note: form.note,
    });
    setCreating(false);
  }

  function onDelete() {
    if (!form.id) return;
    void DLModal.confirm({
      title: "할일 삭제",
      message: "이 할일을 삭제할까요?",
      okLabel: "삭제",
      danger: true,
    }).then((ok) => {
      if (!ok) return;
      deleteTodo(form.id);
      setCreating(true);
      setForm(emptyForm(state.types[0]?.name || "할일", defaultDate));
    });
  }

  const isEmpty = creating || !form.id;

  const summaryText = useMemo(() => {
    if (form.mode === "single" || !form.dateStart) return "";
    const end = form.dateEnd >= form.dateStart ? form.dateEnd : form.dateStart;
    if (form.mode === "recur") {
      if (!form.weekdays.length) return "요일을 하나 이상 선택하세요";
      return dateRangeLabel({
        dateStart: form.dateStart,
        dateEnd: end,
        recur: { freq: "weekly", weekdays: form.weekdays },
      });
    }
    const days =
      Math.round(
        (new Date(end).getTime() - new Date(form.dateStart).getTime()) / 86400000,
      ) + 1;
    return `${dateRangeLabel({ dateStart: form.dateStart, dateEnd: end })} · ${days}일`;
  }, [form.mode, form.dateStart, form.dateEnd, form.weekdays]);

  return (
    <main className="main">
      <div className="page-head">
        <div>
          <h1>planner</h1>
          <p>주간 칸에서 날짜를 고르고, 아래 필터·요약으로 표를 좁힙니다.</p>
        </div>
      </div>

      <WeekPanel state={state} />

      <section className="dash-lean" aria-label="필터·요약">
        <div className="dash-panel">
          <TodosKpi list={list} />
          <div className="filter-bar" aria-label="필터">
            <div className="filter-bar__row filter-bar__row--primary">
              <div className="filter-bar__top">
                <span className="filter-bar__label">필터</span>
                <button
                  type="button"
                  className="btn filter-bar__reset"
                  title="필터 초기화"
                  onClick={() => resetFilters()}
                >
                  <span className="mi" aria-hidden="true">
                    restart_alt
                  </span>{" "}
                  초기화
                </button>
              </div>
              <div className="filter-bar__groups">
                <FilterGroup
                  label="구분"
                  filterKey="types"
                  values={state.types.map((t) => t.name)}
                  active={state.filters.types}
                  onToggle={toggleFilterValue}
                />
                <FilterGroup
                  label="우선순위"
                  filterKey="priorities"
                  values={["높음", "중간", "낮음"]}
                  active={state.filters.priorities}
                  onToggle={toggleFilterValue}
                />
                <FilterGroup
                  label="상태"
                  filterKey="statuses"
                  values={["시작전", "진행중", "완료"]}
                  active={state.filters.statuses}
                  onToggle={toggleFilterValue}
                />
              </div>
            </div>
            <div className="filter-bar__row filter-bar__row--category">
              <FilterGroup
                label="카테고리"
                filterKey="categories"
                values={cats.length ? cats : ["(없음)"]}
                active={state.filters.categories}
                onToggle={(key, value) => {
                  if (value === "(없음)") return;
                  toggleFilterValue(key, value);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="todos-workspace" ref={workspaceRef}>
        <div className="todos-list-pane">
          <div className="list-pane__head">
            <div>
              <h2 className="list-pane__title">할일 목록</h2>
              <p className="list-pane__hint">
                필터 결과 {list.length}건 · 행을 선택하면 오른쪽에서 수정
              </p>
            </div>
            <button type="button" className="btn btn--primary" onClick={startNew}>
              행 추가
            </button>
          </div>
          <div className="table-wrap table-wrap--workspace">
            <table className="data">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>기간</th>
                  <th>카테고리</th>
                  <th>우선순위</th>
                  <th title="우선순위 파생 1/2/3">표시</th>
                  <th>업무</th>
                  <th>진행률</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {!list.length ? (
                  <tr>
                    <td colSpan={8}>
                      필터 결과가 없습니다. 주간·필터를 확인하거나 행을 추가하세요.
                    </td>
                  </tr>
                ) : (
                  list.map((t) => (
                    <tr
                      key={t.id}
                      className={
                        t.id === state.selectedId && !creating ? "is-selected" : undefined
                      }
                      onClick={() => {
                        setCreating(false);
                        selectTodo(t.id);
                      }}
                    >
                      <td>{t.type}</td>
                      <td>{dateRangeLabel(t)}</td>
                      <td>{t.category}</td>
                      <td>{t.priority}</td>
                      <td>
                        <span
                          className="dot"
                          data-level={t.display}
                          title={`표시 ${t.display}`}
                        />
                      </td>
                      <td>{t.title}</td>
                      <td>
                        <div className="prog">
                          <i style={{ width: `${t.progress}%` }} />
                          <b>{t.progress}%</b>
                        </div>
                      </td>
                      <td>{t.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="editor-pane" aria-label="할일 편집" ref={editorRef}>
          <form
            className={`editor-form${isEmpty ? " is-empty" : ""}`}
            onSubmit={onSubmit}
          >
            <header className="editor-pane__head">
              <div>
                <p className="editor-pane__eyebrow">{isEmpty ? "새 할일" : "편집 중"}</p>
                <h2>{isEmpty ? "새 행 작성" : form.title || "(제목 없음)"}</h2>
              </div>
            </header>

            <div className="field">
              <label htmlFor="todo-title">업무</label>
              <input
                id="todo-title"
                type="text"
                placeholder="무엇을 할까요?"
                value={form.title}
                onChange={(e) => patchForm({ title: e.target.value })}
              />
            </div>

            <div className="editor-grid">
              <div className="field field--type">
                <label htmlFor="todo-type">구분</label>
                <select
                  id="todo-type"
                  value={form.type}
                  onChange={(e) => patchForm({ type: e.target.value })}
                >
                  {state.types.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.icon} {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="date-field" data-mode={form.mode}>
                <div className="date-field__head">
                  <span className="date-field__title">일정</span>
                  <div className="seg date-field__mode" role="group" aria-label="일정 유형">
                    <button
                      type="button"
                      aria-pressed={form.mode === "single"}
                      onClick={() => setMode("single")}
                    >
                      하루
                    </button>
                    <button
                      type="button"
                      aria-pressed={form.mode === "range"}
                      onClick={() => setMode("range")}
                    >
                      기간
                    </button>
                    <button
                      type="button"
                      aria-pressed={form.mode === "recur"}
                      onClick={() => setMode("recur")}
                    >
                      반복
                    </button>
                  </div>
                </div>
                <div className="date-field__inputs">
                  <div className="date-field__slot date-field__slot--start">
                    <label className="date-field__sub" htmlFor="todo-date-start">
                      {form.mode === "single" ? "날짜" : "시작"}
                    </label>
                    <input
                      id="todo-date-start"
                      type="date"
                      aria-label={form.mode === "single" ? "날짜" : "시작일"}
                      value={form.dateStart}
                      onChange={(e) => {
                        const dateStart = e.target.value;
                        setForm((f) => {
                          if (f.mode === "single") {
                            return { ...f, dateStart, dateEnd: dateStart };
                          }
                          const dateEnd = f.dateEnd < dateStart ? dateStart : f.dateEnd;
                          return { ...f, dateStart, dateEnd };
                        });
                      }}
                    />
                  </div>
                  {form.mode !== "single" && (
                    <>
                      <span className="date-field__sep" aria-hidden="true">
                        →
                      </span>
                      <div className="date-field__slot date-field__slot--end">
                        <label className="date-field__sub" htmlFor="todo-date-end">
                          {form.mode === "recur" ? "까지" : "종료"}
                        </label>
                        <input
                          id="todo-date-end"
                          type="date"
                          aria-label={form.mode === "recur" ? "반복 종료일" : "종료일"}
                          value={form.dateEnd}
                          onChange={(e) => {
                            const dateEnd = e.target.value;
                            setForm((f) => {
                              if (f.mode === "range" && dateEnd === f.dateStart) {
                                return { ...f, mode: "single", dateEnd };
                              }
                              return {
                                ...f,
                                dateEnd: dateEnd < f.dateStart ? f.dateStart : dateEnd,
                              };
                            });
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
                {form.mode === "recur" && (
                  <div className="date-field__recur">
                    <span className="date-field__sub" id="weekday-label">
                      반복 요일
                    </span>
                    <div
                      className="weekday-picks"
                      role="group"
                      aria-labelledby="weekday-label"
                    >
                      {WEEKDAY_LABELS.map((label, day) => (
                        <button
                          key={day}
                          type="button"
                          data-day={day}
                          aria-pressed={form.weekdays.includes(day)}
                          onClick={() => toggleWeekday(day)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {form.mode !== "single" && summaryText && (
                  <p className="date-field__summary" aria-live="polite">
                    {summaryText}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="todo-category">카테고리</label>
                <input
                  id="todo-category"
                  type="text"
                  placeholder="예: 프로모션"
                  value={form.category}
                  onChange={(e) => patchForm({ category: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="todo-priority">우선순위</label>
                <select
                  id="todo-priority"
                  value={form.priority}
                  onChange={(e) =>
                    patchForm({ priority: e.target.value as Priority })
                  }
                >
                  <option value="높음">높음</option>
                  <option value="중간">중간</option>
                  <option value="낮음">낮음</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label id="progress-field-label" htmlFor="progress-range">
                진행률 <span className="field-live">{form.progress}%</span>
              </label>
              <div className="progress-edit">
                <input
                  id="progress-range"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={form.progress}
                  aria-labelledby="progress-field-label"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={form.progress}
                  onChange={(e) => patchForm({ progress: Number(e.target.value) })}
                />
                <input
                  id="todo-progress"
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={form.progress}
                  aria-label="진행률 %"
                  onChange={(e) =>
                    patchForm({
                      progress: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                    })
                  }
                />
              </div>
              <div className="derived-row">
                <span className="badge badge--derived">
                  표시 <strong>{displayOf(form.priority)}</strong>
                </span>
                <span className="badge badge--derived">
                  상태 <strong>{statusOf(form.progress)}</strong>
                </span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="todo-note">비고</label>
              <textarea
                id="todo-note"
                rows={3}
                placeholder="선택 메모"
                value={form.note}
                onChange={(e) => patchForm({ note: e.target.value })}
              />
            </div>

            <div className="form-actions editor-actions">
              <button type="submit" className="btn btn--primary">
                저장
              </button>
              {!isEmpty && (
                <button type="button" className="btn" onClick={onDelete}>
                  삭제
                </button>
              )}
            </div>
          </form>
        </aside>
      </div>
    </main>
  );
}
