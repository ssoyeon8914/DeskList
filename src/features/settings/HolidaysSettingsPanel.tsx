import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { monthCells, parseDate } from "../../domain/calendarGrid";
import {
  HOLIDAY_YEAR_MAX,
  HOLIDAY_YEAR_MIN,
  holidaysSorted,
} from "../../domain/holidays";
import type { Holiday } from "../../domain/types";
import { deleteHoliday, upsertHoliday } from "../../state/store";
import { useAppStore } from "../../state/useStore";
import { DLModal } from "../../ui/modal";

/** Holidays settings: year board + detail list (2026–2040 seed). */

const DOW = ["일", "월", "화", "수", "목", "금", "토"] as const;
const MONTHS = [
  "",
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
] as const;

function clampYear(y: number) {
  if (y < HOLIDAY_YEAR_MIN) return HOLIDAY_YEAR_MIN;
  if (y > HOLIDAY_YEAR_MAX) return HOLIDAY_YEAR_MAX;
  return y;
}

function defaultYear() {
  return clampYear(new Date().getFullYear());
}

type MonthGroup = { key: string; month: number; items: Holiday[] };

function groupByMonth(list: Holiday[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  const map = new Map<string, MonthGroup>();
  for (const h of list) {
    const key = h.date.slice(0, 7);
    let g = map.get(key);
    if (!g) {
      g = { key, month: Number(h.date.slice(5, 7)), items: [] };
      map.set(key, g);
      groups.push(g);
    }
    g.items.push(h);
  }
  return groups;
}

const YEAR_OPTIONS = Array.from(
  { length: HOLIDAY_YEAR_MAX - HOLIDAY_YEAR_MIN + 1 },
  (_, i) => HOLIDAY_YEAR_MIN + i,
);

export function HolidaysSettingsPanel() {
  const state = useAppStore();
  const all = useMemo(() => holidaysSorted(state.holidays), [state.holidays]);

  const [year, setYear] = useState(defaultYear);
  const [composeOpen, setComposeOpen] = useState(false);
  const [formId, setFormId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formName, setFormName] = useState("");
  const dateRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const yStr = String(year);
  const list = useMemo(
    () => all.filter((h) => h.date.startsWith(yStr)),
    [all, yStr],
  );
  const groups = useMemo(() => groupByMonth(list), [list]);
  const byDate = useMemo(() => {
    const m = new Map<string, Holiday>();
    for (const h of list) m.set(h.date, h);
    return m;
  }, [list]);

  useEffect(() => {
    if (!composeOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCompose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [composeOpen]);

  function closeCompose() {
    setComposeOpen(false);
    setFormId("");
    setFormDate("");
    setFormName("");
  }

  function openAdd() {
    setFormId("");
    setFormName("");
    setFormDate(`${year}-01-01`);
    setComposeOpen(true);
    requestAnimationFrame(() => dateRef.current?.focus());
  }

  function openEdit(h: Holiday) {
    setFormId(h.id);
    setFormDate(h.date);
    setFormName(h.name);
    setComposeOpen(true);
    requestAnimationFrame(() => nameRef.current?.focus());
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const date = formDate;
    const name = formName.trim();
    if (!date || !name) {
      void DLModal.alert({
        title: "입력 확인",
        message: "날짜와 이름을 입력해 주세요.",
      });
      return;
    }
    upsertHoliday({ id: formId || undefined, date, name });
    const y = Number(date.slice(0, 4));
    if (y >= HOLIDAY_YEAR_MIN && y <= HOLIDAY_YEAR_MAX) setYear(y);
    closeCompose();
  }

  function remove(h: Holiday) {
    void DLModal.confirm({
      title: "공휴일 삭제",
      message: `「${h.name}」을(를) 삭제할까요?`,
      okLabel: "삭제",
      danger: true,
    }).then((ok) => {
      if (!ok) return;
      deleteHoliday(h.id);
      if (formId === h.id) closeCompose();
    });
  }

  return (
    <section className="settings-panel" aria-label="공휴일 설정">
      <header className="settings-panel__head">
        <div className="settings-panel__head-row">
          <div>
            <h2>공휴일 설정</h2>
            <p>
              2026–2040 법정 공휴일·대체공휴일이 등록되어 있습니다. 연도를 골라
              한눈에 보고, 필요할 때만 수정하세요.
            </p>
          </div>
          <button type="button" className="btn btn--primary" onClick={openAdd}>
            공휴일 추가
          </button>
        </div>
      </header>

      <div className="holiday-toolbar" role="group" aria-label="연도 선택">
        <div className="holiday-year-nav">
          <button
            type="button"
            className="btn btn--ghost"
            aria-label="이전 해"
            disabled={year <= HOLIDAY_YEAR_MIN}
            onClick={() => setYear((y) => clampYear(y - 1))}
          >
            ←
          </button>
          <select
            aria-label="공휴일 연도"
            value={year}
            onChange={(e) => setYear(clampYear(Number(e.target.value)))}
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn--ghost"
            aria-label="다음 해"
            disabled={year >= HOLIDAY_YEAR_MAX}
            onClick={() => setYear((y) => clampYear(y + 1))}
          >
            →
          </button>
        </div>
        <p className="hint-inline" style={{ margin: 0 }}>
          {year}년 {list.length}건
        </p>
      </div>

      <div className="holiday-year-board" aria-label="연간 공휴일 한눈에">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
          const cells = monthCells(year, m, "sun");
          return (
            <section className="hy-month" key={m}>
              <h4 className="hy-month__title">{m}월</h4>
              <div className="hy-month__dows" aria-hidden="true">
                <span>일</span>
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span>토</span>
              </div>
              <div className="hy-month__grid">
                {cells.map((c) => {
                  const hol = byDate.get(c.date);
                  let cls = "hy-day";
                  if (!c.inMonth) cls += " hy-day--out";
                  if (hol) cls += " hy-day--hol";
                  return (
                    <span
                      key={c.date}
                      className={cls}
                      title={hol ? hol.name : undefined}
                    >
                      {c.day}
                    </span>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {composeOpen ? (
        <section className="holiday-compose" aria-label="공휴일 입력">
          <h3 className="holiday-compose__title">
            {formId ? "공휴일 수정" : "새 공휴일"}
          </h3>
          <form className="holiday-form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="holiday-date">날짜</label>
              <input
                ref={dateRef}
                id="holiday-date"
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>
            <div className="field holiday-form__name">
              <label htmlFor="holiday-name">이름</label>
              <input
                ref={nameRef}
                id="holiday-name"
                type="text"
                placeholder="예: 추석"
                required
                maxLength={40}
                autoComplete="off"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn--primary">
              {formId ? "저장" : "추가"}
            </button>
            <button type="button" className="btn" onClick={closeCompose}>
              취소
            </button>
          </form>
        </section>
      ) : null}

      <h3 className="holiday-detail__title">상세 목록</h3>
      <div className="holiday-list">
        {!list.length ? (
          <div className="holiday-empty">
            <p>이 연도에 등록된 공휴일이 없습니다.</p>
            <button type="button" className="btn btn--primary" onClick={openAdd}>
              공휴일 추가
            </button>
          </div>
        ) : (
          groups.map((g) => (
            <section className="holiday-month" key={g.key}>
              <h3 className="holiday-month__title">{MONTHS[g.month]}</h3>
              <div className="holiday-month__items">
                {g.items.map((h) => {
                  const d = parseDate(h.date);
                  const dow = d.getDay();
                  const dowCls =
                    dow === 0
                      ? " holiday-dow--sun"
                      : dow === 6
                        ? " holiday-dow--sat"
                        : "";
                  return (
                    <div
                      key={h.id}
                      className={`holiday-item${formId === h.id ? " is-editing" : ""}`}
                    >
                      <div className="holiday-item__main">
                        <span className="holiday-item__date">
                          {d.getMonth() + 1}.{d.getDate()}
                        </span>
                        <span className={`holiday-item__dow${dowCls}`}>
                          {DOW[dow]}
                        </span>
                        <span className="holiday-item__name">{h.name}</span>
                      </div>
                      <div className="holiday-item__actions">
                        <button
                          type="button"
                          className="btn btn--ghost"
                          onClick={() => openEdit(h)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost"
                          onClick={() => remove(h)}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </section>
  );
}
