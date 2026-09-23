import type { Memo, MemoColor } from "./types";

export const MEMO_COLORS: MemoColor[] = ["cream", "mint", "sky", "rose"];
export const MEMO_BODY_MAX = 3000;
export const MEMO_TITLE_MAX = 80;
export const MEMO_CATEGORY_MAX = 40;
export const MEMO_CATEGORY_DEFAULT = "일반";
export const MEMO_W_DEFAULT = 240;
export const MEMO_H_DEFAULT = 220;
export const MEMO_W_MIN = 180;
export const MEMO_H_MIN = 160;
export const MEMO_W_MAX = 480;
export const MEMO_H_MAX = 560;

function clampSize(n: number, min: number, max: number, fallback: number) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, Math.round(v)));
}

export function normalizeCategory(raw: unknown): string {
  return String(raw ?? "").trim().slice(0, MEMO_CATEGORY_MAX);
}

/** Empty → 기본 카테고리 (필터·표시용). */
export function effectiveCategory(raw: unknown): string {
  return normalizeCategory(raw) || MEMO_CATEGORY_DEFAULT;
}

export function seedMemos(): Memo[] {
  const now = new Date().toISOString();
  return [
    {
      id: "m1",
      title: "주간 다짐",
      category: "회고",
      body: "주간 회고 때 적을 한 줄 다짐",
      color: "cream",
      width: MEMO_W_DEFAULT,
      height: MEMO_H_DEFAULT,
      updatedAt: now,
    },
    {
      id: "m2",
      title: "오늘의 문장",
      category: "일반",
      body: "오늘은 깊게, 내일은 넓게.",
      color: "mint",
      width: MEMO_W_DEFAULT,
      height: MEMO_H_DEFAULT,
      updatedAt: now,
    },
    {
      id: "m3",
      title: "촬영 체크",
      category: "촬영",
      body: "촬영 전 체크: 배터리 · 마이크 · 삼각대",
      color: "sky",
      width: MEMO_W_DEFAULT,
      height: MEMO_H_DEFAULT,
      updatedAt: now,
    },
  ];
}

export function normalizeMemo(raw: unknown): Memo | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Partial<Memo>;
  const body = String(m.body ?? "").slice(0, MEMO_BODY_MAX);
  const title = String(m.title ?? "").slice(0, MEMO_TITLE_MAX);
  const color: MemoColor = MEMO_COLORS.includes(m.color as MemoColor)
    ? (m.color as MemoColor)
    : "cream";
  const hasCategory =
    Object.prototype.hasOwnProperty.call(m, "category") &&
    m.category !== undefined;
  return {
    id: String(m.id || `m_${Math.random().toString(36).slice(2, 10)}`),
    title,
    category: hasCategory
      ? normalizeCategory(m.category)
      : MEMO_CATEGORY_DEFAULT,
    body,
    color,
    width: clampSize(m.width as number, MEMO_W_MIN, MEMO_W_MAX, MEMO_W_DEFAULT),
    height: clampSize(m.height as number, MEMO_H_MIN, MEMO_H_MAX, MEMO_H_DEFAULT),
    updatedAt: String(m.updatedAt || new Date().toISOString()),
  };
}

export function memosSorted(list: Memo[]): Memo[] {
  return list.slice().sort((a, b) => (a.id < b.id ? 1 : -1));
}

/** Unique categories, locale-sorted (ko). */
export function memoCategories(list: Memo[]): string[] {
  const set = new Set<string>();
  for (const m of list) set.add(effectiveCategory(m.category));
  return [...set].sort((a, b) => a.localeCompare(b, "ko"));
}

export function memosInCategory(list: Memo[], category: string | "all"): Memo[] {
  if (category === "all") return list;
  return list.filter((m) => effectiveCategory(m.category) === category);
}
