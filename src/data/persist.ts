import { createSeed } from "./seed";
import {
  mergeHolidaySeed,
  normalizeHoliday,
  seedHolidays,
} from "../domain/holidays";
import { normalizeMemo, seedMemos } from "../domain/memos";
import {
  normalizeDoc,
  normalizeFolder,
  resolveDocsUi,
  seedDocs,
  seedDocsUi,
  seedFolders,
} from "../domain/notes";
import { normalizeTodo } from "../domain/todoDates";
import type { AppState } from "../domain/types";

export const STORAGE_KEY = "desklist/v3";
const LEGACY_KEYS = ["desklist/v2", "desklist/v1"];

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

  const todos = Array.isArray(o.todos)
    ? o.todos.map((t) => normalizeTodo(t)).filter((t) => t.id)
    : seed.todos;

  const holidays = Array.isArray(o.holidays)
    ? mergeHolidaySeed(
        o.holidays
          .map(normalizeHoliday)
          .filter((h): h is NonNullable<typeof h> => Boolean(h)),
      )
    : seedHolidays();

  const memos = Array.isArray(o.memos)
    ? o.memos.map(normalizeMemo).filter((m): m is NonNullable<typeof m> => Boolean(m))
    : seedMemos();

  const docFolders = Array.isArray(o.docFolders)
    ? o.docFolders
        .map(normalizeFolder)
        .filter((f): f is NonNullable<typeof f> => Boolean(f))
    : seedFolders();

  const folderIds = new Set(docFolders.map((f) => f.id));
  const docs = Array.isArray(o.docs)
    ? o.docs
        .map(normalizeDoc)
        .filter((d): d is NonNullable<typeof d> => Boolean(d))
        .filter((d) => folderIds.has(d.folderId))
    : seedDocs();

  const docsUi = resolveDocsUi(docFolders, docs, o.docsUi ?? seedDocsUi());

  return {
    version: 3,
    types: Array.isArray(o.types) && o.types.length ? o.types : seed.types,
    todos,
    holidays,
    memos,
    docFolders,
    docs,
    docsUi,
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
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const key of LEGACY_KEYS) {
        raw = localStorage.getItem(key);
        if (raw) break;
      }
    }
    if (!raw) return createSeed();
    const state = normalize(JSON.parse(raw));
    saveState(state);
    return state;
  } catch {
    return createSeed();
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Pretty JSON of the current persisted blob (for backup / port migrate). */
export function exportStateJson(): string {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }
  return JSON.stringify(createSeed(), null, 2);
}

/** Validate + write JSON, then return normalized AppState. */
export function importStateJson(json: string): AppState {
  const parsed = JSON.parse(json) as unknown;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("유효한 JSON 객체가 아닙니다.");
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  return loadState();
}

export function downloadStateBackup(): void {
  const blob = new Blob([exportStateJson()], {
    type: "application/json;charset=utf-8",
  });
  const a = document.createElement("a");
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  a.href = URL.createObjectURL(blob);
  a.download = `desklist-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
