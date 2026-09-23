import {
  iconFor,
  parseDate,
  weekHeaders,
  weekRange,
} from "../../domain/calendarGrid";
import { filteredTodos } from "../../domain/filter";
import { holidayOn } from "../../domain/holidays";
import {
  dateRangeLabel,
  isRangeTodo,
  isRecurTodo,
  rangeSegment,
  todoCoversDate,
} from "../../domain/todoDates";
import type { AppState, EnrichedTodo, WeekStartsOn } from "../../domain/types";
import {
  applyWeekDateFilter,
  setFilterGroup,
  setWeek,
  setWeekStartsOn,
} from "../../state/store";

function WeekItem({
  t,
  iso,
  colIndex,
  types,
}: {
  t: EnrichedTodo;
  iso: string;
  colIndex: number;
  types: AppState["types"];
}) {
  if (isRangeTodo(t)) {
    const seg = rangeSegment(t, iso);
    if (!seg) return null;
    const showTitle =
      iso === t.dateStart || (colIndex === 0 && todoCoversDate(t, iso));
    return (
      <div
        className={`range-bar range-bar--${seg}${t.progress >= 100 ? " range-bar--done" : ""}`}
        data-level={t.display}
        title={`${dateRangeLabel(t)} · ${t.title}`}
      >
        {showTitle && (
          <>
            <span className="range-bar__icon">{iconFor(types, t.type)}</span>
            <span className="range-bar__title">{t.title}</span>
          </>
        )}
      </div>
    );
  }
  return (
    <div
      className={`day-chip${t.progress >= 100 ? " day-chip--done" : ""}${
        isRecurTodo(t) ? " day-chip--recur" : ""
      }`}
      title={t.title}
    >
      {isRecurTodo(t) && <span className="day-chip__recur">↻ </span>}
      {iconFor(types, t.type)} {t.title}
    </div>
  );
}

export function WeekPanel({ state }: { state: AppState }) {
  const w = state.week;
  const headers = weekHeaders(state.weekStartsOn);
  const cells = weekRange(w.year, w.month, w.weekIndex, state.weekStartsOn);
  const weekDays = cells.map((c) => c.date);
  const active = state.filters.dates;
  const fullWeek =
    active.length === 7 && weekDays.every((d) => active.includes(d));
  const list = filteredTodos(state, { dates: weekDays });

  function onDayActivate(d: string) {
    if (active.length === 1 && active[0] === d) {
      applyWeekDateFilter();
      return;
    }
    setFilterGroup("dates", [d]);
  }

  let scopeText: string;
  if (fullWeek) {
    scopeText = `범위: ${weekDays[0]} ~ ${weekDays[6]} (주 전체) · 칸을 누르면 하루만 봅니다`;
  } else if (active.length === 1) {
    scopeText = `범위: ${active[0]} (하루) · 같은 칸을 다시 누르거나 「주 전체」`;
  } else {
    scopeText = `범위: ${active.join(", ") || "없음"}`;
  }

  return (
    <section className="week-panel" aria-label="주간 달력">
      <div className="week-panel__head">
        <h2>주간 달력</h2>
        <div className="week-controls">
          <label>
            연도
            <select
              aria-label="주간 연도"
              value={w.year}
              onChange={(e) => setWeek({ year: Number(e.target.value) })}
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label>
            월
            <select
              aria-label="주간 월"
              value={w.month}
              onChange={(e) => setWeek({ month: Number(e.target.value) })}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label>
            주차
            <select
              aria-label="주차"
              value={w.weekIndex}
              onChange={(e) => setWeek({ weekIndex: Number(e.target.value) })}
            >
              {Array.from({ length: 6 }, (_, i) => {
                const range = weekRange(w.year, w.month, i, state.weekStartsOn);
                return (
                  <option key={i} value={i}>
                    {i + 1}주 ({range[0].day}–{range[6].day})
                  </option>
                );
              })}
            </select>
          </label>
          <label>
            시작
            <select
              aria-label="주 시작 요일"
              value={state.weekStartsOn}
              onChange={(e) => {
                setWeekStartsOn(e.target.value as WeekStartsOn);
                applyWeekDateFilter();
              }}
            >
              <option value="sun">일요일</option>
              <option value="mon">월요일</option>
            </select>
          </label>
          <button type="button" className="btn" onClick={() => applyWeekDateFilter()}>
            주 전체
          </button>
        </div>
      </div>
      <div className="week-grid" aria-label="주간 그리드">
        {headers.map((h) => (
          <div key={h.label} className={`wd ${h.cls}`.trim()}>
            {h.label}
          </div>
        ))}
        {cells.map((c, colIndex) => {
          const items = list.filter((t) => todoCoversDate(t, c.date));
          const holiday = holidayOn(state.holidays, c.date);
          const dow = parseDate(c.date).getDay();
          let selCls = " wc--on";
          if (!fullWeek) {
            if (active.includes(c.date)) {
              selCls = active.length === 1 ? " wc--solo" : " wc--on";
            } else {
              selCls = " wc--off";
            }
          }
          if (holiday) selCls += " wc--holiday";
          if (dow === 0) selCls += " wc--sun";
          if (dow === 6) selCls += " wc--sat";
          return (
            <div
              key={c.date}
              className={`wc${selCls}`}
              style={c.inMonth ? undefined : { opacity: 0.45 }}
              data-date={c.date}
              role="button"
              tabIndex={0}
              title={`${holiday ? `${holiday.name} · ` : ""}클릭: 이 날만 · 같은 날 다시: 주 전체`}
              onClick={() => onDayActivate(c.date)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDayActivate(c.date);
                }
              }}
            >
              <strong>{c.day}</strong>
              {holiday && <span className="day__holiday">{holiday.name}</span>}
              {items.slice(0, 4).map((t) => (
                <WeekItem
                  key={t.id}
                  t={t}
                  iso={c.date}
                  colIndex={colIndex}
                  types={state.types}
                />
              ))}
              {items.length > 4 && (
                <span className="badge-num">+{items.length - 4}</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="week-scope hint-inline">{scopeText}</p>
    </section>
  );
}
