import type { MonthCell, WeekStartsOn } from "./types";

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function monthCells(
  year: number,
  month: number,
  weekStartsOn: WeekStartsOn,
): MonthCell[] {
  const first = new Date(year, month - 1, 1);
  let startDow = first.getDay();
  if (weekStartsOn === "mon") startDow = (startDow + 6) % 7;
  const cells: MonthCell[] = [];
  const cursor = new Date(year, month - 1, 1 - startDow);
  const today = formatDate(new Date());
  for (let i = 0; i < 42; i++) {
    cells.push({
      date: formatDate(cursor),
      day: cursor.getDate(),
      inMonth: cursor.getMonth() === month - 1,
      isToday: formatDate(cursor) === today,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}

export function weekHeaders(weekStartsOn: WeekStartsOn) {
  const sunFirst = [
    { label: "SUN", cls: "sun" },
    { label: "MON", cls: "" },
    { label: "TUE", cls: "" },
    { label: "WED", cls: "" },
    { label: "THU", cls: "" },
    { label: "FRI", cls: "" },
    { label: "SAT", cls: "sat" },
  ];
  if (weekStartsOn === "mon") return [...sunFirst.slice(1), sunFirst[0]];
  return sunFirst;
}

export function weekRange(
  year: number,
  month: number,
  weekIndex: number,
  weekStartsOn: WeekStartsOn,
) {
  const cells = monthCells(year, month, weekStartsOn);
  const start = weekIndex * 7;
  return cells.slice(start, start + 7);
}

export function weekDates(
  year: number,
  month: number,
  weekIndex: number,
  weekStartsOn: WeekStartsOn,
) {
  return weekRange(year, month, weekIndex, weekStartsOn).map((c) => c.date);
}

export function iconFor(
  types: { name: string; icon: string }[],
  typeName: string,
): string {
  const t = types.find((x) => x.name === typeName);
  return t ? t.icon : "•";
}

export function dateLabel(iso: string): string {
  const d = parseDate(iso);
  const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];
  return `${iso} ${WEEKDAYS_KO[d.getDay()]}`;
}
