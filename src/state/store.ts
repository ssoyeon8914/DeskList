import { weekDates } from "../domain/calendarGrid";
import { enrich } from "../domain/derive";
import { allCategories } from "../domain/filter";
import type {
  AppState,
  EnrichedTodo,
  Filters,
  Priority,
  Status,
  TodoInput,
  TypeSetting,
  WeekStartsOn,
} from "../domain/types";
import { loadState, saveState } from "../data/persist";
import { createSeed, seedMandala } from "../data/seed";

function uid(): string {
  return `t_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
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

export function upsertTodo(input: TodoInput): EnrichedTodo {
  const progress = Math.max(0, Math.min(100, Number(input.progress) || 0));
  const payload = {
    type: input.type,
    date: input.date,
    category: input.category || "",
    priority: (input.priority || "중간") as Priority,
    title: input.title || "(제목 없음)",
    progress,
    note: input.note || "",
  };
  if (input.id) {
    const idx = state.todos.findIndex((t) => t.id === input.id);
    if (idx !== -1) {
      const todos = state.todos.slice();
      todos[idx] = { ...todos[idx], ...payload };
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
    date,
    category: "만다라트",
    priority: "중간",
    title,
    progress: 0,
    note: `만다라트 #${index + 1}`,
  });
}
