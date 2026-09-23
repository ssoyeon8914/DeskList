import { Link } from "react-router-dom";
import {
  iconFor,
  monthCells,
  weekHeaders,
} from "../../domain/calendarGrid";
import { allCategories, monthFilteredTodos } from "../../domain/filter";
import { parseDate } from "../../domain/calendarGrid";
import { holidayOn } from "../../domain/holidays";
import {
  dateRangeLabel,
  isRangeTodo,
  isRecurTodo,
  pushTodoOntoDates,
  rangeSegment,
  todoCoversDate,
} from "../../domain/todoDates";
import type { EnrichedTodo, WeekStartsOn } from "../../domain/types";
import {
  resetFilters,
  setCalendar,
  setWeekStartsOn,
  toggleFilterValue,
} from "../../state/store";
import { useAppStore } from "../../state/useStore";
import { FilterGroup } from "../../ui/FilterGroup";

function CalTask({
  t,
  iso,
  cellIndex,
  types,
}: {
  t: EnrichedTodo;
  iso: string;
  cellIndex: number;
  types: { name: string; icon: string }[];
}) {
  if (isRangeTodo(t)) {
    const seg = rangeSegment(t, iso);
    if (!seg) return null;
    const showTitle =
      iso === t.dateStart ||
      (cellIndex % 7 === 0 && todoCoversDate(t, iso));
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
      className={`task${t.progress >= 100 ? " task--done" : ""}${
        isRecurTodo(t) ? " task--recur" : ""
      }`}
    >
      <span className="task__icon">{iconFor(types, t.type)}</span>
      <span className="task__pri" data-level={t.display} />
      <span className="task__title">
        {isRecurTodo(t) ? "↻ " : ""}
        {t.title}
      </span>
      <span className="task__bar">
        <i style={{ width: `${t.progress}%` }} />
      </span>
    </div>
  );
}

export function CalendarPage() {
  const state = useAppStore();
  const { calendar, weekStartsOn, filters, types } = state;
  const list = monthFilteredTodos(state);
  const byDate: Record<string, EnrichedTodo[]> = {};
  list.forEach((t) => pushTodoOntoDates(t, byDate));

  const headers = weekHeaders(weekStartsOn);
  const cells = monthCells(calendar.year, calendar.month, weekStartsOn);
  const dens = calendar.density;
  const cats = allCategories(state.todos);

  return (
    <main className="main">
      <div className="planner-title">
        <h1>monthly planner</h1>
        <p>할일 스토어와 연동 · 칸 클릭 시 할일 화면으로</p>
      </div>

      <div className="cal-layout">
        <div>
          <div className="cal-toolbar">
            <div className="ym-label">
              {calendar.year}년 {calendar.month}월
            </div>
            <div className="density-toggle">
              <span>하루 표시</span>
              <div className="seg" role="group" aria-label="셀 표시 밀도">
                <button
                  type="button"
                  aria-pressed={dens === 8}
                  onClick={() => setCalendar({ density: 8 })}
                >
                  8
                </button>
                <button
                  type="button"
                  aria-pressed={dens === 16}
                  onClick={() => setCalendar({ density: 16 })}
                >
                  16
                </button>
              </div>
              <span className="hint-inline" style={{ margin: 0 }}>
                초과 시 <span className="lamp lamp--yellow" /> /{" "}
                <span className="lamp lamp--orange" />
              </span>
            </div>
          </div>

          <div className="weekdays" aria-hidden="true">
            {headers.map((h) => (
              <div key={h.label} className={h.cls || undefined}>
                {h.label}
              </div>
            ))}
          </div>

          <div
            className="cal-grid"
            data-density={String(dens)}
            aria-label="월간 달력"
          >
            {cells.map((cell, cellIndex) => {
              const items = byDate[cell.date] || [];
              const n = items.length;
              const holiday = holidayOn(state.holidays, cell.date);
              const dow = parseDate(cell.date).getDay();
              let dayCls = "day";
              if (!cell.inMonth) dayCls += " day--muted";
              if (cell.isToday) dayCls += " day--today";
              if (dow === 0) dayCls += " day--sun";
              if (dow === 6) dayCls += " day--sat";
              if (holiday) dayCls += " day--holiday";
              if (n > 16) dayCls += " day--alert";
              else if (n > 8) dayCls += " day--warn";

              const lamp =
                n > 16 ? (
                  <span className="lamp lamp--orange" title="16개 초과" />
                ) : n > 8 ? (
                  <span className="lamp lamp--yellow" title="8개 초과" />
                ) : null;

              const shown = items.slice(0, dens);

              return (
                <Link
                  key={cell.date}
                  className={dayCls}
                  to={`/todos?date=${cell.date}`}
                >
                  <div className="day__num">
                    {cell.day}
                    {lamp}
                  </div>
                  {holiday && (
                    <span className="day__holiday" title={holiday.name}>
                      {holiday.name}
                    </span>
                  )}
                  {shown.map((t) => (
                    <CalTask
                      key={t.id}
                      t={t}
                      iso={cell.date}
                      cellIndex={cellIndex}
                      types={types}
                    />
                  ))}
                  {n > dens && (
                    <div className="task-overflow">+{n - dens} 더보기</div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="cal-rail" aria-label="달력 조작">
          <div>
            <h2>연도</h2>
            <div className="year-spin">
              <output>{calendar.year}</output>
              <div className="spin-btns">
                <button
                  type="button"
                  className="btn"
                  aria-label="연도 증가"
                  onClick={() => setCalendar({ year: calendar.year + 1 })}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="btn"
                  aria-label="연도 감소"
                  onClick={() => setCalendar({ year: calendar.year - 1 })}
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
          <div>
            <h2>월</h2>
            <div className="month-grid">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={calendar.month === m}
                  onClick={() => setCalendar({ month: m })}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="start-day">
            <h2>시작일</h2>
            <select
              aria-label="주 시작 요일"
              value={weekStartsOn}
              onChange={(e) =>
                setWeekStartsOn(e.target.value as WeekStartsOn)
              }
            >
              <option value="sun">일요일</option>
              <option value="mon">월요일</option>
            </select>
          </div>
          <div className="cal-rail__filters">
            <h2>필터</h2>
            <div className="cal-filters" aria-label="달력 필터">
              <FilterGroup
                label="구분"
                filterKey="types"
                values={types.map((t) => t.name)}
                active={filters.types}
                onToggle={toggleFilterValue}
              />
              <FilterGroup
                label="카테고리"
                filterKey="categories"
                values={cats}
                active={filters.categories}
                onToggle={toggleFilterValue}
              />
              <FilterGroup
                label="상태"
                filterKey="statuses"
                values={["시작전", "진행중", "완료"]}
                active={filters.statuses}
                onToggle={toggleFilterValue}
              />
              <FilterGroup
                label="우선순위"
                filterKey="priorities"
                values={["높음", "중간", "낮음"]}
                active={filters.priorities}
                onToggle={toggleFilterValue}
              />
              <button
                type="button"
                className="btn"
                id="cal-filter-reset"
                title="필터 해제"
                onClick={() => resetFilters()}
              >
                <span className="mi" aria-hidden="true">
                  restart_alt
                </span>{" "}
                필터 해제
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
