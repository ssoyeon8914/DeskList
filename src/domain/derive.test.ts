import { describe, expect, it } from "vitest";
import { displayOf, statusOf, enrich } from "../domain/derive";
import { matchesFilters } from "../domain/filter";
import { monthCells } from "../domain/calendarGrid";
import {
  isRangeTodo,
  isRecurTodo,
  normalizeTodo,
  todoCoversDate,
} from "../domain/todoDates";
import type { Filters, Todo } from "../domain/types";

describe("derive", () => {
  it("displayOf maps priority", () => {
    expect(displayOf("높음")).toBe(3);
    expect(displayOf("중간")).toBe(2);
    expect(displayOf("낮음")).toBe(1);
    expect(displayOf("기타")).toBe(1);
  });

  it("statusOf maps progress", () => {
    expect(statusOf(0)).toBe("시작전");
    expect(statusOf(50)).toBe("진행중");
    expect(statusOf(100)).toBe("완료");
  });

  it("enrich attaches fields", () => {
    const e = enrich({
      id: "1",
      type: "할일",
      dateStart: "2026-09-16",
      dateEnd: "2026-09-16",
      category: "A",
      priority: "높음",
      title: "x",
      progress: 100,
      note: "",
    });
    expect(e.display).toBe(3);
    expect(e.status).toBe("완료");
  });
});

describe("todoDates", () => {
  it("migrates legacy date field", () => {
    const t = normalizeTodo({
      id: "1",
      type: "할일",
      date: "2026-09-16",
      category: "A",
      priority: "중간",
      title: "x",
      progress: 0,
      note: "",
    });
    expect(t.dateStart).toBe("2026-09-16");
    expect(t.dateEnd).toBe("2026-09-16");
  });

  it("covers range and weekly recur", () => {
    const range: Todo = {
      id: "r",
      type: "일정",
      dateStart: "2026-09-15",
      dateEnd: "2026-09-18",
      category: "A",
      priority: "높음",
      title: "캠페인",
      progress: 0,
      note: "",
    };
    expect(isRangeTodo(range)).toBe(true);
    expect(todoCoversDate(range, "2026-09-16")).toBe(true);
    expect(todoCoversDate(range, "2026-09-19")).toBe(false);

    const recur: Todo = {
      ...range,
      id: "w",
      dateEnd: "2026-10-10",
      recur: { freq: "weekly", weekdays: [1, 3, 5] },
    };
    expect(isRecurTodo(recur)).toBe(true);
    expect(isRangeTodo(recur)).toBe(false);
    expect(todoCoversDate(recur, "2026-09-16")).toBe(true); // Wed
    expect(todoCoversDate(recur, "2026-09-15")).toBe(false); // Tue
  });
});

describe("matchesFilters", () => {
  const todo: Todo = {
    id: "1",
    type: "할일",
    dateStart: "2026-09-16",
    dateEnd: "2026-09-16",
    category: "프로모션",
    priority: "중간",
    title: "x",
    progress: 50,
    note: "",
  };

  const base: Filters = {
    dates: [],
    types: ["할일"],
    priorities: ["중간"],
    categories: ["프로모션"],
    statuses: ["진행중"],
  };

  it("empty dates = all dates", () => {
    expect(matchesFilters(todo, base)).toBe(true);
  });

  it("empty types = match none", () => {
    expect(matchesFilters(todo, { ...base, types: [] })).toBe(false);
  });

  it("dates restrict with overlap", () => {
    expect(matchesFilters(todo, { ...base, dates: ["2026-09-17"] })).toBe(false);
    expect(matchesFilters(todo, { ...base, dates: ["2026-09-16"] })).toBe(true);
    const ranged = { ...todo, dateStart: "2026-09-15", dateEnd: "2026-09-18" };
    expect(matchesFilters(ranged, { ...base, dates: ["2026-09-17"] })).toBe(true);
  });
});

describe("monthCells", () => {
  it("returns 42 cells", () => {
    expect(monthCells(2026, 9, "sun")).toHaveLength(42);
  });

  it("monday start shifts first cell", () => {
    const sun = monthCells(2026, 9, "sun")[0].date;
    const mon = monthCells(2026, 9, "mon")[0].date;
    expect(sun).not.toBe(mon);
  });
});
