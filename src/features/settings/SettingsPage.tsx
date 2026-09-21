import { useEffect, useState } from "react";
import { useAppStore } from "../../state/useStore";
import {
  addType,
  removeType,
  resetSeed,
  updateType,
} from "../../state/store";
import { DLModal } from "../../ui/modal";

type Draft = { name: string; icon: string };

export function SettingsPage() {
  const state = useAppStore();
  const [drafts, setDrafts] = useState<Draft[]>(() =>
    state.types.map((t) => ({ name: t.name, icon: t.icon })),
  );

  useEffect(() => {
    setDrafts(state.types.map((t) => ({ name: t.name, icon: t.icon })));
  }, [state.types]);

  function setDraft(i: number, patch: Partial<Draft>) {
    setDrafts((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  return (
    <main className="main">
      <div className="page-head">
        <div>
          <h1>settings</h1>
          <p>
            구분 ↔ 아이콘 마스터. 저장 시 할일·달력 아이콘에 반영됩니다.
            <br />
            <span className="field-hint">데이터: localStorage (desklist/v1)</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => addType("새 구분", "📌")}
          >
            구분 추가
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              void DLModal.confirm({
                title: "샘플 초기화",
                message: "샘플 데이터로 초기화할까요? (할일·구분 포함)",
                okLabel: "초기화",
                danger: true,
              }).then((ok) => {
                if (ok) resetSeed();
              });
            }}
          >
            샘플 초기화
          </button>
        </div>
      </div>

      <p className="note" style={{ marginTop: 0 }}>
        할일 폼 드롭다운·달력 셀 아이콘은 이 목록을 읽습니다.
      </p>

      <div className="settings-rows" style={{ marginTop: "var(--space-4)" }}>
        {drafts.map((d, i) => (
          <div className="settings-row" key={`${state.types[i]?.name ?? i}-${i}`}>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor={`type-name-${i}`}>구분</label>
              <input
                id={`type-name-${i}`}
                type="text"
                value={d.name}
                onChange={(e) => setDraft(i, { name: e.target.value })}
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor={`type-icon-${i}`}>아이콘</label>
              <input
                id={`type-icon-${i}`}
                type="text"
                value={d.icon}
                onChange={(e) => setDraft(i, { icon: e.target.value })}
                style={{ width: "4.5rem", textAlign: "center" }}
              />
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => updateType(i, d.name, d.icon)}
            >
              저장
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                if (!removeType(i)) {
                  void DLModal.alert({
                    title: "삭제 불가",
                    message: "구분은 최소 1개 필요합니다.",
                  });
                }
              }}
            >
              삭제
            </button>
          </div>
        ))}
      </div>

      <p className="hint-inline" style={{ marginTop: "var(--space-4)" }}>
        미리보기 (할일 폼 드롭다운):{" "}
        <select aria-label="연동 미리보기">
          {state.types.map((t) => (
            <option key={t.name}>
              {t.icon} {t.name}
            </option>
          ))}
        </select>
      </p>
    </main>
  );
}
