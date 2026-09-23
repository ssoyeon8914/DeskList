import { useRef } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  clearTodos,
  downloadStateBackup,
  importBackupJson,
} from "../../state/store";
import { DLModal } from "../../ui/modal";

export function SettingsLayout() {
  const fileRef = useRef<HTMLInputElement | null>(null);

  function onExport() {
    try {
      downloadStateBackup();
      void DLModal.alert({
        title: "내보내기 완료",
        message:
          "JSON 파일이 다운로드되었습니다. 다른 포트·브라우저로 옮길 때 「가져오기」로 넣으면 됩니다.",
      });
    } catch {
      void DLModal.alert({
        title: "내보내기 실패",
        message: "파일을 저장하지 못했습니다.",
      });
    }
  }

  async function onImportFile(file: File | null) {
    if (!file) return;
    try {
      const text = await file.text();
      JSON.parse(text);
      const ok = await DLModal.confirm({
        title: "데이터 가져오기",
        message:
          "현재 데이터를 이 파일 내용으로 바꿀까요? (할일·메모·노트·설정 포함)",
        okLabel: "가져오기",
        danger: true,
      });
      if (!ok) return;
      importBackupJson(text);
      await DLModal.alert({
        title: "가져오기 완료",
        message: "데이터를 반영했습니다.",
      });
      location.reload();
    } catch {
      void DLModal.alert({
        title: "가져오기 실패",
        message: "올바른 DeskList JSON 백업 파일이 아닙니다.",
      });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onClearTodos() {
    const ok = await DLModal.confirm({
      title: "할일 초기화",
      message:
        "할일만 모두 삭제합니다. 구분·공휴일·메모·노트·만다라트 등 다른 값은 그대로 둡니다. 샘플 할일은 다시 넣지 않습니다.",
      okLabel: "할일 비우기",
      danger: true,
    });
    if (!ok) return;
    clearTodos();
    await DLModal.alert({
      title: "초기화 완료",
      message: "할일이 비었습니다.",
    });
  }

  return (
    <main className="main">
      <div className="page-head">
        <div>
          <h1>설정</h1>
          <p>
            구분·공휴일 등 앱 기본값을 관리합니다.
            <br />
            <span className="field-hint">
              데이터: localStorage (desklist/v3) · 포트가 바뀌면 내보내기→가져오기로 이전
            </span>
          </p>
        </div>
        <div className="settings-actions">
          <button type="button" className="btn" onClick={onExport}>
            데이터 내보내기
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => fileRef.current?.click()}
          >
            데이터 가져오기
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => onImportFile(e.target.files?.[0] ?? null)}
          />
          <button type="button" className="btn btn--danger" onClick={onClearTodos}>
            할일 초기화
          </button>
        </div>
      </div>

      <div className="settings-shell">
        <nav className="settings-nav" aria-label="설정 메뉴">
          <NavLink to="/settings" end className="settings-nav__link">
            구분 관리
          </NavLink>
          <NavLink to="/settings/holidays" className="settings-nav__link">
            공휴일 설정
          </NavLink>
        </nav>
        <div className="settings-panels">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
