/** 9×9 cell roles matching mockups/mandalart.html */

export type MandalaCellMeta = {
  cls: string;
  /** sub-c data-src key */
  src?: string;
  /** mirror data-mirror key → readonly */
  mirror?: string;
};

const BLOCK = [
  // row 0
  "b0", "b0", "b0", "b1", "b1", "b1", "b2", "b2", "b2",
  // row 1
  "b0", "mirror b0", "b0", "b1", "mirror b1", "b1", "b2", "mirror b2", "b2",
  // row 2
  "b0", "b0", "b0", "b1", "b1", "b1", "b2", "b2", "b2",
  // row 3
  "b3", "b3", "b3", "sub-c", "sub-c", "sub-c", "b4", "b4", "b4",
  // row 4
  "b3", "mirror b3", "b3", "sub-c", "core", "sub-c", "b4", "mirror b4", "b4",
  // row 5
  "b3", "b3", "b3", "sub-c", "sub-c", "sub-c", "b4", "b4", "b4",
  // row 6
  "b5", "b5", "b5", "b6", "b6", "b6", "b7", "b7", "b7",
  // row 7
  "b5", "mirror b5", "b5", "b6", "mirror b6", "b6", "b7", "mirror b7", "b7",
  // row 8
  "b5", "b5", "b5", "b6", "b6", "b6", "b7", "b7", "b7",
] as const;

const MIRROR_AT: Record<number, string> = {
  10: "nw",
  13: "n",
  16: "ne",
  37: "w",
  43: "e",
  64: "sw",
  67: "s",
  70: "se",
};

/** sub-c indices (must match BLOCK positions) */
const SRC_AT: Record<number, string> = {
  30: "nw",
  31: "n",
  32: "ne",
  39: "w",
  41: "e",
  48: "sw",
  49: "s",
  50: "se",
};

/** sub-c index → mirror index */
export const SRC_TO_MIRROR: Record<number, number> = {
  30: 10,
  31: 13,
  32: 16,
  39: 37,
  41: 43,
  48: 64,
  49: 67,
  50: 70,
};

export const MANDALA_CELLS: MandalaCellMeta[] = BLOCK.map((base, i) => {
  const meta: MandalaCellMeta = { cls: base };
  if (MIRROR_AT[i]) {
    meta.mirror = MIRROR_AT[i];
    meta.cls = `${base} mirror-linked`;
  }
  if (SRC_AT[i]) meta.src = SRC_AT[i];
  return meta;
});

export function syncMirrors(cells: string[]): string[] {
  const next = cells.slice();
  Object.entries(SRC_TO_MIRROR).forEach(([src, mir]) => {
    next[Number(mir)] = next[Number(src)] ?? "";
  });
  return next;
}
