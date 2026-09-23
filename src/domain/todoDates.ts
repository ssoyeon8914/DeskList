import { dateLabel, formatDate, parseDate } from "./calendarGrid";
import type { RecurWeekly, Todo } from "./types";

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

export function addDaysIso(iso: string, delta: number): string {
  const d = parseDate(iso);
  d.setDate(d.getDate() + delta);
  return formatDate(d);
}

export function normalizeRecur(r: unknown): RecurWeekly | undefined {
  if (!r || typeof r !== "object") return undefined;
  const o = r as { freq?: string; weekdays?: unknown };
  if (o.freq !== "weekly" || !Array.isArray(o.weekdays)) return undefined;
  const days: number[] = [];
  o.weekdays.forEach((d) => {
    const n = Number(d);
    if (n >= 0 && n <= 6 && !days.includes(n)) days.push(n);
  });
  days.sort((a, b) => a - b);
  if (!days.length) return undefined;
  return { freq: "weekly", weekdays: days };
}

export function normalizeTodo(raw: unknown): Todo {
  const t = (raw || {}) as Partial<Todo> & { date?: string };
  let start = t.dateStart || t.date;
  let end = t.dateEnd || start;
  if (!start) start = formatDate(new Date());
  if (!end || end < start) end = start;
  const recur = normalizeRecur(t.recur);
  const out: Todo = {
    id: String(t.id || ""),
    type: String(t.type || "할일"),
    dateStart: start,
    dateEnd: end,
    category: String(t.category || ""),
    priority: (t.priority as Todo["priority"]) || "중간",
    title: String(t.title || "(제목 없음)"),
    progress: Math.max(0, Math.min(100, Number(t.progress) || 0)),
    note: String(t.note || ""),
  };
  if (recur) out.recur = recur;
  return out;
}

export function isRecurTodo(t: Pick<Todo, "recur">): boolean {
  return Boolean(normalizeRecur(t.recur));
}

export function isRangeTodo(t: Pick<Todo, "dateStart" | "dateEnd" | "recur">): boolean {
  if (isRecurTodo(t)) return false;
  return Boolean(t.dateStart && t.dateEnd && t.dateStart !== t.dateEnd);
}

export function todoCoversDate(
  t: Pick<Todo, "dateStart" | "dateEnd" | "recur">,
  iso: string,
): boolean {
  if (!t.dateStart || !t.dateEnd) return false;
  if (iso < t.dateStart || iso > t.dateEnd) return false;
  if (!isRecurTodo(t) || !t.recur) return true;
  return t.recur.weekdays.includes(parseDate(iso).getDay());
}

export function weekdayNames(days: number[]): string {
  return days.map((d) => WEEKDAYS_KO[d] ?? "").join("");
}

export function dateRangeLabel(t: Pick<Todo, "dateStart" | "dateEnd" | "recur">): string {
  if (isRecurTodo(t) && t.recur) {
    return `매주 ${weekdayNames(t.recur.weekdays)} · ${dateLabel(t.dateStart)} – ${dateLabel(t.dateEnd)}`;
  }
  if (!isRangeTodo(t)) return dateLabel(t.dateStart);
  return `${dateLabel(t.dateStart)} – ${dateLabel(t.dateEnd)}`;
}

export type RangeSegment = "start" | "mid" | "end" | "single";

export function rangeSegment(
  t: Pick<Todo, "dateStart" | "dateEnd" | "recur">,
  iso: string,
): RangeSegment | null {
  if (!isRangeTodo(t) || !todoCoversDate(t, iso)) return null;
  if (t.dateStart === t.dateEnd) return "single";
  if (iso === t.dateStart) return "start";
  if (iso === t.dateEnd) return "end";
  return "mid";
}

/** Expand covered dates into a map (for calendar buckets). */
export function pushTodoOntoDates<T extends Todo>(
  t: T,
  byDate: Record<string, T[]>,
): void {
  const d = parseDate(t.dateStart);
  const end = parseDate(t.dateEnd);
  while (d <= end) {
    const iso = formatDate(d);
    if (todoCoversDate(t, iso)) {
      (byDate[iso] ||= []).push(t);
    }
    d.setDate(d.getDate() + 1);
  }
}
