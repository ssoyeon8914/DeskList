import { weekDates } from "../domain/calendarGrid";
import { enrich } from "../domain/derive";
import { allCategories } from "../domain/filter";
import type {
  AppState,
  Doc,
  DocFolder,
  DocFormat,
  DocsUiState,
  EnrichedTodo,
  Filters,
  Holiday,
  Memo,
  MemoColor,
  Priority,
  Status,
  TodoInput,
  TypeSetting,
  WeekStartsOn,
} from "../domain/types";
import { holidaysSorted, normalizeHoliday } from "../domain/holidays";
import { memosSorted, normalizeMemo } from "../domain/memos";
import {
  docsInFolder,
  foldersSorted,
  normalizeDoc,
  normalizeFolder,
  resolveDocsUi,
  DOC_BODY_MAX,
  DOC_FOLDER_NAME_MAX,
  DOC_TITLE_MAX,
} from "../domain/notes";
import { loadState, saveState, importStateJson } from "../data/persist";
import { createSeed, seedMandala } from "../data/seed";

export {
  STORAGE_KEY,
  exportStateJson,
  downloadStateBackup,
} from "../data/persist";

function uid(): string {
  return `t_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function holidayUid(): string {
  return `h_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function memoUid(): string {
  return `m_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

let state: AppState = typeof localStorage !== "undefined" ? loadState() : createSeed();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  // New root reference so useSyncExternalStore clients re-render
  state = { ...state };
  saveState(state);
  emit();
}

function replace(next: AppState) {
  state = next;
  persist();
}

export function getState(): AppState {
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetSeed() {
  const s = createSeed();
  s.selectedId = "t2";
  replace(s);
}

/** Clear all todos only — keep types, holidays, memos, notes, mandala, settings. */
export function clearTodos() {
  state = {
    ...state,
    todos: [],
    selectedId: null,
    filters: {
      ...state.filters,
      dates: [],
      categories: [],
    },
  };
  persist();
}

/** Replace app state from backup JSON, then notify subscribers. */
export function importBackupJson(json: string) {
  state = importStateJson(json);
  listeners.forEach((l) => l());
}

export function upsertTodo(input: TodoInput): EnrichedTodo {
  const progress = Math.max(0, Math.min(100, Number(input.progress) || 0));
  let start = input.dateStart;
  let end = input.dateEnd || start;
  if (!start) {
    const today = new Date();
    start = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }
  if (!end || end < start) end = start;
  const recur =
    input.recur === null || input.recur === undefined
      ? undefined
      : input.recur.freq === "weekly" && input.recur.weekdays?.length
        ? {
            freq: "weekly" as const,
            weekdays: [...new Set(input.recur.weekdays.filter((d) => d >= 0 && d <= 6))].sort(
              (a, b) => a - b,
            ),
          }
        : undefined;

  const payload = {
    type: input.type,
    dateStart: start,
    dateEnd: end,
    category: input.category || "",
    priority: (input.priority || "중간") as Priority,
    title: input.title || "(제목 없음)",
    progress,
    note: input.note || "",
    ...(recur ? { recur } : {}),
  };
  if (input.id) {
    const idx = state.todos.findIndex((t) => t.id === input.id);
    if (idx !== -1) {
      const todos = state.todos.slice();
      const next = { ...todos[idx], ...payload };
      if (!recur) delete next.recur;
      todos[idx] = next;
      state = { ...state, todos, selectedId: input.id };
      persist();
      return enrich(todos[idx]);
    }
  }
  const created = { id: uid(), ...payload };
  const todos = [...state.todos, created];
  let filters = state.filters;
  if (payload.category && !filters.categories.includes(payload.category)) {
    filters = {
      ...filters,
      categories: [...filters.categories, payload.category],
    };
  }
  state = { ...state, todos, selectedId: created.id, filters };
  persist();
  return enrich(created);
}

export function deleteTodo(id: string) {
  const todos = state.todos.filter((t) => t.id !== id);
  const selectedId =
    state.selectedId === id ? (todos[0]?.id ?? null) : state.selectedId;
  state = { ...state, todos, selectedId };
  persist();
}

export function selectTodo(id: string | null) {
  state = { ...state, selectedId: id };
  persist();
}

export function setCalendar(patch: Partial<AppState["calendar"]>) {
  state = { ...state, calendar: { ...state.calendar, ...patch } };
  persist();
}

export function setWeekStartsOn(weekStartsOn: WeekStartsOn) {
  state = { ...state, weekStartsOn };
  persist();
}

export function setWeek(patch: Partial<AppState["week"]>) {
  const week = { ...state.week, ...patch };
  state = {
    ...state,
    week,
    filters: {
      ...state.filters,
      dates: weekDates(week.year, week.month, week.weekIndex, state.weekStartsOn),
    },
  };
  persist();
}

export function applyWeekDateFilter() {
  state.filters = {
    ...state.filters,
    dates: weekDates(
      state.week.year,
      state.week.month,
      state.week.weekIndex,
      state.weekStartsOn,
    ),
  };
  persist();
}

export function setFilterGroup<K extends keyof Filters>(key: K, values: Filters[K]) {
  state.filters = { ...state.filters, [key]: [...(values as string[])] as Filters[K] };
  persist();
}

export function toggleFilterValue(
  key: "types" | "priorities" | "categories" | "statuses" | "dates",
  value: string,
) {
  const arr = [...state.filters[key]] as string[];
  const i = arr.indexOf(value);
  if (i === -1) arr.push(value);
  else arr.splice(i, 1);
  state.filters = { ...state.filters, [key]: arr as Filters[typeof key] };
  persist();
}

export function resetFilters() {
  state.filters = {
    types: state.types.map((t) => t.name),
    priorities: ["높음", "중간", "낮음"],
    categories: allCategories(state.todos),
    statuses: ["시작전", "진행중", "완료"] as Status[],
    dates: weekDates(
      state.week.year,
      state.week.month,
      state.week.weekIndex,
      state.weekStartsOn,
    ),
  };
  persist();
}

export function addType(name: string, icon: string) {
  const t = { name: name || "새 구분", icon: icon || "📌" };
  state = {
    ...state,
    types: [...state.types, t],
    filters: {
      ...state.filters,
      types: [...state.filters.types, t.name],
    },
  };
  persist();
}

export function updateType(index: number, name: string, icon: string) {
  if (!state.types[index]) return;
  const old = state.types[index].name;
  const types = state.types.map((t, i) => (i === index ? { name, icon } : t));
  const todos = state.todos.map((t) =>
    t.type === old ? { ...t, type: name } : t,
  );
  const filterTypes = state.filters.types.map((n) => (n === old ? name : n));
  state = {
    ...state,
    types,
    todos,
    filters: { ...state.filters, types: filterTypes },
  };
  persist();
}

export function removeType(index: number): boolean {
  if (state.types.length <= 1) return false;
  const removed = state.types[index].name;
  const types = state.types.filter((_, i) => i !== index);
  const fallback = types[0].name;
  const todos = state.todos.map((t) =>
    t.type === removed ? { ...t, type: fallback } : t,
  );
  let filterTypes = state.filters.types.filter((n) => n !== removed);
  if (!filterTypes.includes(fallback)) filterTypes = [...filterTypes, fallback];
  state = {
    ...state,
    types,
    todos,
    filters: { ...state.filters, types: filterTypes },
  };
  persist();
  return true;
}

export function setTypes(types: TypeSetting[]) {
  let next = types.map((t) => ({
    name: String(t.name).trim() || "구분",
    icon: t.icon || "📌",
  }));
  if (!next.length) next = [{ name: "할일", icon: "✔️" }];
  state = { ...state, types: next };
  resetFilters();
}

export function getMandala(): string[] {
  if (!Array.isArray(state.mandala) || state.mandala.length !== 81) {
    state = { ...state, mandala: seedMandala() };
  }
  return state.mandala.slice();
}

export function setMandala(cells: string[]) {
  if (!Array.isArray(cells) || cells.length !== 81) return;
  state = {
    ...state,
    mandala: cells.map((c) => String(c ?? "")),
  };
  persist();
}

export function setMandalaCell(index: number, value: string) {
  if (index < 0 || index > 80) return;
  let mandala = state.mandala;
  if (!Array.isArray(mandala) || mandala.length !== 81) {
    mandala = seedMandala();
  } else {
    mandala = mandala.slice();
  }
  mandala[index] = String(value ?? "");
  state = { ...state, mandala };
  persist();
}

export function sendMandalaToTodo(index: number) {
  const cells = getMandala();
  const title = (cells[index] || "").trim() || "(만다라트)";
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return upsertTodo({
    type: "할일",
    dateStart: date,
    dateEnd: date,
    category: "만다라트",
    priority: "중간",
    title,
    progress: 0,
    note: `만다라트 #${index + 1}`,
  });
}

export function upsertHoliday(input: {
  id?: string;
  date: string;
  name: string;
}): Holiday | null {
  const normalized = normalizeHoliday({
    id: input.id || holidayUid(),
    date: input.date,
    name: input.name,
  });
  if (!normalized) return null;
  if (input.id) {
    const idx = state.holidays.findIndex((h) => h.id === input.id);
    if (idx !== -1) {
      const holidays = state.holidays.slice();
      holidays[idx] = normalized;
      state = { ...state, holidays };
      persist();
      return normalized;
    }
  }
  state = { ...state, holidays: [...state.holidays, normalized] };
  persist();
  return normalized;
}

export function deleteHoliday(id: string) {
  state = {
    ...state,
    holidays: state.holidays.filter((h) => h.id !== id),
  };
  persist();
}

export function getHolidaysSorted(): Holiday[] {
  return holidaysSorted(state.holidays);
}

export function getMemosSorted(): Memo[] {
  return memosSorted(state.memos || []);
}

export function upsertMemo(input: {
  id?: string;
  title?: string;
  category?: string;
  body?: string;
  color?: MemoColor;
  width?: number;
  height?: number;
}): Memo {
  const now = new Date().toISOString();
  const list = Array.isArray(state.memos) ? state.memos.slice() : [];

  if (input.id) {
    const idx = list.findIndex((m) => m.id === input.id);
    if (idx !== -1) {
      const prev = list[idx];
      const updated = normalizeMemo({
        ...prev,
        title: input.title !== undefined ? input.title : prev.title,
        category: input.category !== undefined ? input.category : prev.category,
        body: input.body !== undefined ? input.body : prev.body,
        color: input.color !== undefined ? input.color : prev.color,
        width: input.width !== undefined ? input.width : prev.width,
        height: input.height !== undefined ? input.height : prev.height,
        updatedAt: now,
      })!;
      list[idx] = updated;
      state = { ...state, memos: list };
      persist();
      return updated;
    }
  }

  const created = normalizeMemo({
    id: memoUid(),
    title: input.title ?? "",
    category: input.category,
    body: input.body ?? "",
    color: input.color ?? "cream",
    width: input.width,
    height: input.height,
    updatedAt: now,
  })!;
  state = { ...state, memos: [created, ...list] };
  persist();
  return created;
}

export function deleteMemo(id: string) {
  state = {
    ...state,
    memos: (state.memos || []).filter((m) => m.id !== id),
  };
  persist();
}

function docUid() {
  return `dn_${Math.random().toString(36).slice(2, 10)}`;
}

function folderUid() {
  return `df_${Math.random().toString(36).slice(2, 10)}`;
}

function syncDocsUi(partial?: Partial<DocsUiState>) {
  const folders = state.docFolders || [];
  const docs = state.docs || [];
  const next = resolveDocsUi(folders, docs, {
    selectedFolderId:
      partial?.selectedFolderId !== undefined
        ? partial.selectedFolderId
        : state.docsUi?.selectedFolderId ?? null,
    selectedDocId:
      partial?.selectedDocId !== undefined
        ? partial.selectedDocId
        : state.docsUi?.selectedDocId ?? null,
    mdViewMode:
      partial?.mdViewMode !== undefined
        ? partial.mdViewMode
        : state.docsUi?.mdViewMode,
    foldersCollapsed:
      partial?.foldersCollapsed !== undefined
        ? partial.foldersCollapsed
        : state.docsUi?.foldersCollapsed,
    titlesCollapsed:
      partial?.titlesCollapsed !== undefined
        ? partial.titlesCollapsed
        : state.docsUi?.titlesCollapsed,
  });
  state = { ...state, docsUi: next };
}

export function setDocsSelection(partial: Partial<DocsUiState>) {
  syncDocsUi(partial);
  persist();
}

export function upsertFolder(input: { id?: string; name: string }): DocFolder {
  const now = new Date().toISOString();
  const list = Array.isArray(state.docFolders) ? state.docFolders.slice() : [];
  if (input.id) {
    const idx = list.findIndex((f) => f.id === input.id);
    if (idx !== -1) {
      const updated = normalizeFolder({
        ...list[idx],
        name: input.name,
        updatedAt: now,
      })!;
      list[idx] = updated;
      state = { ...state, docFolders: list };
      syncDocsUi();
      persist();
      return updated;
    }
  }
  const created = normalizeFolder({
    id: folderUid(),
    name: input.name.slice(0, DOC_FOLDER_NAME_MAX) || "새 폴더",
    sort: list.length,
    updatedAt: now,
  })!;
  state = { ...state, docFolders: [...list, created] };
  syncDocsUi({ selectedFolderId: created.id, selectedDocId: null });
  persist();
  return created;
}

/** Deletes folder and all docs inside. Caller must confirm via DLModal. */
export function deleteFolder(id: string) {
  state = {
    ...state,
    docFolders: (state.docFolders || []).filter((f) => f.id !== id),
    docs: (state.docs || []).filter((d) => d.folderId !== id),
  };
  syncDocsUi();
  persist();
}

export function upsertDoc(input: {
  id?: string;
  folderId: string;
  title?: string;
  format?: DocFormat;
  body?: string;
}): Doc {
  const now = new Date().toISOString();
  const list = Array.isArray(state.docs) ? state.docs.slice() : [];
  if (input.id) {
    const idx = list.findIndex((d) => d.id === input.id);
    if (idx !== -1) {
      const prev = list[idx];
      const updated = normalizeDoc({
        ...prev,
        folderId: input.folderId || prev.folderId,
        title: input.title !== undefined ? input.title : prev.title,
        format: input.format !== undefined ? input.format : prev.format,
        body: input.body !== undefined ? input.body : prev.body,
        updatedAt: now,
      })!;
      list[idx] = updated;
      state = { ...state, docs: list };
      syncDocsUi({ selectedDocId: updated.id, selectedFolderId: updated.folderId });
      persist();
      return updated;
    }
  }
  const created = normalizeDoc({
    id: docUid(),
    folderId: input.folderId,
    title: input.title ?? "",
    format: input.format ?? "text",
    body: input.body ?? "",
    updatedAt: now,
  })!;
  state = { ...state, docs: [created, ...list] };
  syncDocsUi({ selectedFolderId: created.folderId, selectedDocId: created.id });
  persist();
  return created;
}

export function deleteDoc(id: string) {
  state = {
    ...state,
    docs: (state.docs || []).filter((d) => d.id !== id),
  };
  syncDocsUi();
  persist();
}

export function getFoldersSorted(): DocFolder[] {
  return foldersSorted(state.docFolders || []);
}

export function getDocsInFolder(folderId: string): Doc[] {
  return docsInFolder(state.docs || [], folderId);
}

export {
  DOC_BODY_MAX,
  DOC_TITLE_MAX,
  DOC_FOLDER_NAME_MAX,
};

