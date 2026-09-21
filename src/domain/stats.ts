import type { EnrichedTodo } from "./types";

export type Stats = {
  total: number;
  byStatus: Record<string, number>;
  byPri: Record<string, { done: number; total: number }>;
  completionRate: number;
};

export function stats(list: EnrichedTodo[]): Stats {
  const byStatus: Record<string, number> = { 시작전: 0, 진행중: 0, 완료: 0 };
  const byPri: Record<string, { done: number; total: number }> = {
    높음: { done: 0, total: 0 },
    중간: { done: 0, total: 0 },
    낮음: { done: 0, total: 0 },
  };
  list.forEach((t) => {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    if (byPri[t.priority]) {
      byPri[t.priority].total++;
      if (t.status === "완료") byPri[t.priority].done++;
    }
  });
  const done = byStatus["완료"] || 0;
  const total = list.length;
  return {
    total,
    byStatus,
    byPri,
    completionRate: total ? Math.round((done / total) * 100) : 0,
  };
}
