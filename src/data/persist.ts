import { createSeed } from "./seed";
import type { AppState } from "../domain/types";

export const STORAGE_KEY = "desklist/v1";

function normalize(raw: unknown): AppState {
  const seed = createSeed();
  if (!raw || typeof raw !== "object") return seed;
  const o = raw as Partial<AppState> & {
    calendar?: { weekStartsOn?: string };
    week?: { weekStartsOn?: string };
  };

  const weekStartsOn =
    o.weekStartsOn === "mon" || o.weekStartsOn === "sun"
      ? o.weekStartsOn
      : o.calendar?.weekStartsOn === "mon" || o.week?.weekStartsOn === "mon"
        ? "mon"
        : "sun";

  return {
    version: 1,
    types: Array.isArray(o.types) && o.types.length ? o.types : seed.types,
    todos: Array.isArray(o.todos) ? o.todos : seed.todos,
    filters: o.filters
      ? {
          dates: o.filters.dates ?? [],
          types: o.filters.types ?? seed.filters.types,
          priorities: o.filters.priorities ?? seed.filters.priorities,
          categories: o.filters.categories ?? seed.filters.categories,
          statuses: o.filters.statuses ?? seed.filters.statuses,
        }
      : seed.filters,
    weekStartsOn,
    calendar: {
      year: o.calendar?.year ?? seed.calendar.year,
      month: o.calendar?.month ?? seed.calendar.month,
      density: o.calendar?.density === 16 ? 16 : 8,
    },
    week: {
      year: o.week?.year ?? seed.week.year,
      month: o.week?.month ?? seed.week.month,
      weekIndex: o.week?.weekIndex ?? seed.week.weekIndex,
    },
    selectedId: o.selectedId ?? null,
    mandala:
      Array.isArray(o.mandala) && o.mandala.length === 81 ? o.mandala : seed.mandala,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeed();
    return normalize(JSON.parse(raw));
  } catch {
    return createSeed();
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
