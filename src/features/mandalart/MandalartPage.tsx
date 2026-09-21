import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MANDALA_CELLS, SRC_TO_MIRROR, syncMirrors } from "../../domain/mandalaMeta";
import { seedMandala } from "../../data/seed";
import {
  getMandala,
  sendMandalaToTodo,
  setMandala,
  subscribe,
} from "../../state/store";
import { useAppStore } from "../../state/useStore";
import { DLModal } from "../../ui/modal";

export function MandalartPage() {
  useAppStore(); // re-render on store updates when not focused
  const [cells, setCells] = useState(() => syncMirrors(getMandala()));
  const [selected, setSelected] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [sendMsg, setSendMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribe(() => {
      const active = document.activeElement;
      if (active && gridRef.current?.contains(active)) return;
      setCells(syncMirrors(getMandala()));
    });
  }, []);

  function scheduleSave(next: string[]) {
    setSaveStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setMandala(next);
      setSaveStatus("saved");
    }, 200);
  }

  function updateCell(index: number, value: string) {
    setCells((prev) => {
      let next = prev.slice();
      next[index] = value;
      if (SRC_TO_MIRROR[index] != null) {
        next[SRC_TO_MIRROR[index]] = value;
      }
      next = syncMirrors(next);
      scheduleSave(next);
      return next;
    });
  }

  const canSend = selected != null && Boolean(cells[selected]?.trim());

  const statusText = useMemo(() => {
    if (saveStatus === "saving") return "저장 중…";
    if (saveStatus === "saved") return "저장됨";
    return null;
  }, [saveStatus]);

  return (
    <main className="main">
      <div className="mandala-layout">
        <aside className="mandala-aside">
          <h1>mandala goal chart</h1>
          <div className="mandala-quote">
            Visualize your goals,
            <br />
            design your future
          </div>
          <div className="mandala-deco" aria-hidden="true" />
          <p className="note" style={{ marginTop: "2rem" }}>
            중앙 <strong>세부 목표</strong>를 수정하면 외곽이 미러됩니다. 입력 내용은{" "}
            <strong>자동 저장</strong>됩니다.
          </p>
          {statusText && (
            <p className="hint-inline" id="mandala-save-status">
              {statusText}
            </p>
          )}
          <div className="mandala-actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={!canSend}
              onClick={() => {
                if (selected == null) return;
                setMandala(cells);
                const created = sendMandalaToTodo(selected);
                setSendMsg(`「${created.title}」을(를) 할일에 추가했습니다.`);
              }}
            >
              선택 칸 → 할일로 보내기
            </button>
            {sendMsg && (
              <p className="hint-inline">
                {sendMsg} <Link to="/todos">할일에서 보기</Link>
              </p>
            )}
            <button
              type="button"
              className="btn"
              onClick={() => {
                void DLModal.confirm({
                  title: "만다라트 초기화",
                  message: "만다라트를 샘플 내용으로 되돌릴까요?",
                  okLabel: "초기화",
                  danger: true,
                }).then((ok) => {
                  if (!ok) return;
                  const next = syncMirrors(seedMandala());
                  setCells(next);
                  setMandala(next);
                  setSaveStatus("saved");
                  setSendMsg(null);
                });
              }}
            >
              만다라트 샘플로 초기화
            </button>
            <Link className="btn" to="/todos">
              할일 화면으로
            </Link>
          </div>
        </aside>

        <div
          className="m9"
          role="grid"
          aria-label="만다라트 9x9"
          ref={gridRef}
        >
          {MANDALA_CELLS.map((meta, i) => {
            const isMirror = Boolean(meta.mirror);
            const r = Math.floor(i / 9);
            const c = i % 9;
            let label = `${r},${c}`;
            if (meta.cls.includes("core")) label += " 핵심";
            else if (meta.src) label += " 세부";
            else if (meta.mirror) label += " 미러";

            return (
              <input
                key={i}
                className={meta.cls}
                value={cells[i] ?? ""}
                readOnly={isMirror}
                aria-label={label}
                data-src={meta.src}
                data-mirror={meta.mirror}
                onFocus={() => setSelected(i)}
                onMouseDown={() => setSelected(i)}
                onChange={(e) => {
                  if (isMirror) return;
                  updateCell(i, e.target.value);
                }}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
