import type { Holiday } from "./types";
import { HOLIDAY_SEED } from "./holidaySeed";

export function seedHolidays(): Holiday[] {
  return HOLIDAY_SEED.map((h) => ({ ...h }));
}

/** Merge missing seed holidays into an existing list (by date). */
export function mergeHolidaySeed(existing: Holiday[]): Holiday[] {
  const byDate = new Map(existing.map((h) => [h.date, h]));
  for (const h of HOLIDAY_SEED) {
    if (!byDate.has(h.date)) byDate.set(h.date, { ...h });
  }
  return holidaysSorted([...byDate.values()]);
}

export function normalizeHoliday(raw: unknown): Holiday | null {
  if (!raw || typeof raw !== "object") return null;
  const h = raw as Partial<Holiday>;
  const date = String(h.date || "").slice(0, 10);
  const name = String(h.name || "").trim();
  if (!date || !name) return null;
  return {
    id: String(h.id || `h_${Math.random().toString(36).slice(2, 10)}`),
    date,
    name,
  };
}

export function holidaysSorted(list: Holiday[]): Holiday[] {
  return list.slice().sort((a, b) => {
    if (a.date === b.date) return a.name.localeCompare(b.name, "ko");
    return a.date < b.date ? -1 : 1;
  });
}

export function holidayOn(list: Holiday[], iso: string): Holiday | null {
  return list.find((h) => h.date === iso) || null;
}

export const HOLIDAY_YEAR_MIN = 2026;
export const HOLIDAY_YEAR_MAX = 2040;
