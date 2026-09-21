import { stats } from "../../domain/stats";
import type { EnrichedTodo } from "../../domain/types";

export function TodosKpi({ list }: { list: EnrichedTodo[] }) {
  const st = stats(list);
  const wait = st.byStatus["시작전"] || 0;
  const run = st.byStatus["진행중"] || 0;
  const done = st.byStatus["완료"] || 0;
  const sum = wait + run + done;
  const stripCols = !sum
    ? "1fr"
    : [wait, run, done].map((n) => (n > 0 ? `${n}fr` : "0fr")).join(" ");

  return (
    <div className="summary-row">
      <article className="metric-card metric-card--status" aria-label="상태·완료율">
        <div className="status-board">
          <div className="stat stat--total">
            <span className="stat__label">전체</span>
            <span className="stat__num">{st.total}</span>
          </div>
          <div className="status-breakdown">
            <div className="status-stats status-stats--compact">
              <div className="stat">
                <span className="stat__label stat__label--muted">시작전</span>
                <span className="stat__num">{wait}</span>
              </div>
              <div className="stat">
                <span className="stat__label stat__label--run">진행중</span>
                <span className="stat__num">{run}</span>
              </div>
              <div className="stat">
                <span className="stat__label stat__label--done">완료</span>
                <span className="stat__num">{done}</span>
              </div>
            </div>
            <div
              className="status-strip"
              aria-hidden="true"
              style={{ gridTemplateColumns: stripCols }}
            >
              {!sum ? (
                <i className="seg-wait" style={{ opacity: 0.35 }} />
              ) : (
                <>
                  <i className="seg-wait" />
                  <i className="seg-run" />
                  <i className="seg-done" />
                </>
              )}
            </div>
          </div>
          <div className="status-rate">
            <div
              className="donut"
              style={{ ["--p" as string]: String(st.completionRate) }}
              aria-label={`완료율 ${st.completionRate}%`}
            >
              <div className="donut__hole">
                <strong>{st.completionRate}%</strong>
                <span>완료율</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article className="metric-card metric-card--priority" aria-label="우선순위별 완료">
        <div className="pri-chart">
          {(["높음", "중간", "낮음"] as const).map((p) => {
            const info = st.byPri[p];
            const pct = info.total ? Math.round((info.done / info.total) * 100) : 0;
            const cls =
              p === "높음" ? "pri-high" : p === "중간" ? "pri-mid" : "pri-low";
            return (
              <div className="pri-col" key={p}>
                <span className="pri-frac">
                  {info.done} / {info.total}
                </span>
                <div className="pri-stack" style={{ ["--fill" as string]: `${pct}%` }}>
                  <i className={`pri-stack__done ${cls}`} />
                  <i className={`pri-stack__rest ${cls}`} />
                </div>
                <span className="pri-name">{p}</span>
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}
