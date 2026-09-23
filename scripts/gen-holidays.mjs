import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const KoreanLunarCalendar = require("korean-lunar-calendar");

function pad(n) {
  return String(n).padStart(2, "0");
}
function iso(y, m, d) {
  return `${y}-${pad(m)}-${pad(d)}`;
}
function parse(isoStr) {
  const [y, m, d] = isoStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function fmt(dt) {
  return iso(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}
function addDays(isoStr, n) {
  const dt = parse(isoStr);
  dt.setDate(dt.getDate() + n);
  return fmt(dt);
}
function dow(isoStr) {
  return parse(isoStr).getDay();
}
function lunarSolar(ly, lm, ld) {
  const cal = new KoreanLunarCalendar();
  cal.setLunarDate(ly, lm, ld, false);
  const s = cal.getSolarCalendar();
  return iso(s.year, s.month, s.day);
}
function nextOpen(set, fromIso) {
  let d = addDays(fromIso, 1);
  while (dow(d) === 0 || dow(d) === 6 || set.has(d)) {
    d = addDays(d, 1);
  }
  return d;
}

function holidaysForYear(year) {
  /** @type {Map<string, string>} */
  const map = new Map();
  /** @type {string[]} */
  const pendingSubs = [];

  const claim = (date, name) => {
    if (!map.has(date)) {
      map.set(date, name);
      return;
    }
    const cur = map.get(date);
    if (cur === name) return;
    // Overlap: keep both labels (e.g. 추석·개천절)
    if (!cur.includes(name)) {
      map.set(date, `${cur}·${name}`);
    }
  };

  // Lunar first so fixed holidays can detect overlap
  const seollal = lunarSolar(year, 1, 1);
  claim(addDays(seollal, -1), "설날 연휴");
  claim(seollal, "설날");
  claim(addDays(seollal, 1), "설날 연휴");

  const buddha = lunarSolar(year, 4, 8);
  claim(buddha, "부처님오신날");

  const chuseok = lunarSolar(year, 8, 15);
  claim(addDays(chuseok, -1), "추석 연휴");
  claim(chuseok, "추석");
  claim(addDays(chuseok, 1), "추석 연휴");

  const fixed = [
    { date: iso(year, 1, 1), name: "신정", sub: false },
    { date: iso(year, 3, 1), name: "삼일절", sub: true },
    { date: iso(year, 5, 1), name: "노동절", sub: true },
    { date: iso(year, 5, 5), name: "어린이날", sub: true },
    { date: iso(year, 6, 6), name: "현충일", sub: false },
    { date: iso(year, 7, 17), name: "제헌절", sub: true },
    { date: iso(year, 8, 15), name: "광복절", sub: true },
    { date: iso(year, 10, 3), name: "개천절", sub: true },
    { date: iso(year, 10, 9), name: "한글날", sub: true },
    { date: iso(year, 12, 25), name: "크리스마스", sub: true },
  ];

  for (const f of fixed) {
    const before = map.get(f.date);
    claim(f.date, f.name);
    if (!f.sub) continue;
    const w = dow(f.date);
    if (w === 0 || w === 6) {
      pendingSubs.push(f.name);
    } else if (before && before !== f.name) {
      // Weekday overlap with lunar holiday → substitute for fixed day
      pendingSubs.push(f.name);
    }
  }

  // 부처님오신날 weekend substitute
  {
    const w = dow(buddha);
    if (w === 0 || w === 6) pendingSubs.push("부처님오신날");
  }

  // 설·추석: Sunday in the 3-day window
  for (const [label, center] of [
    ["설날", seollal],
    ["추석", chuseok],
  ]) {
    const days = [addDays(center, -1), center, addDays(center, 1)];
    if (days.some((d) => dow(d) === 0)) pendingSubs.push(label);
  }

  for (const name of pendingSubs) {
    // Find anchor date for nextOpen start
    let anchor = null;
    for (const [d, n] of map.entries()) {
      if (n === name || n.endsWith(`·${name}`) || n.startsWith(`${name}·`)) {
        if (!anchor || d > anchor) anchor = d;
      }
    }
    if (name === "설날") anchor = addDays(seollal, 1);
    if (name === "추석") anchor = addDays(chuseok, 1);
    if (name === "부처님오신날") anchor = buddha;
    if (!anchor) continue;
    const sub = nextOpen(map, anchor);
    if (!map.has(sub)) map.set(sub, `대체공휴일(${name})`);
  }

  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, name]) => ({ date, name }));
}

const all = [];
let id = 0;
for (let y = 2026; y <= 2040; y++) {
  for (const h of holidaysForYear(y)) {
    id += 1;
    all.push({ id: `h${id}`, date: h.date, name: h.name });
  }
}

for (const y of [2026, 2027, 2028]) {
  const rows = all.filter((h) => h.date.startsWith(String(y)));
  console.log(y, "count", rows.length);
  console.log(rows.map((h) => h.date.slice(5) + " " + h.name).join(" | "));
}
console.log("TOTAL", all.length);

const outDir = path.resolve("d:/Workspace/To-do-list");
const ts = `import type { Holiday } from "./types";

/** Generated KR public holidays 2026–2040 (incl. substitutes). */
export const HOLIDAY_SEED: Holiday[] = ${JSON.stringify(all, null, 2)};
`;
fs.writeFileSync(path.join(outDir, "src/domain/holidaySeed.ts"), ts, "utf8");
const js = `/* Generated KR public holidays 2026–2040 */
window.DeskListHolidaySeed = ${JSON.stringify(all)};
`;
fs.writeFileSync(path.join(outDir, "mockups/js/holiday-seed.js"), js, "utf8");
console.log("wrote seed files");
