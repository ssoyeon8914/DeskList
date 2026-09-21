import type { EnrichedTodo, Priority, Status, Todo } from "./types";

const PRI_TO_DISPLAY: Record<string, number> = { 낮음: 1, 중간: 2, 높음: 3 };

export function displayOf(priority: Priority | string): number {
  return PRI_TO_DISPLAY[priority] ?? 1;
}

export function statusOf(progress: number): Status {
  const p = Number(progress);
  if (!Number.isFinite(p) || p <= 0) return "시작전";
  if (p >= 100) return "완료";
  return "진행중";
}

export function enrich(todo: Todo): EnrichedTodo {
  return {
    ...todo,
    display: displayOf(todo.priority),
    status: statusOf(todo.progress),
  };
}
