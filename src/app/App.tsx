import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../ui/Layout";
import { CalendarPage } from "../features/calendar/CalendarPage";
import { TodosPage } from "../features/todos/TodosPage";
import { MandalartPage } from "../features/mandalart/MandalartPage";
import { MemosPage } from "../features/memos/MemosPage";
import { NotesPage } from "../features/notes/NotesPage";
import { SettingsLayout } from "../features/settings/SettingsLayout";
import { TypesSettingsPanel } from "../features/settings/TypesSettingsPanel";
import { HolidaysSettingsPanel } from "../features/settings/HolidaysSettingsPanel";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/calendar" replace />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="todos" element={<TodosPage />} />
        <Route path="mandalart" element={<MandalartPage />} />
        <Route path="memos" element={<MemosPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<TypesSettingsPanel />} />
          <Route path="holidays" element={<HolidaysSettingsPanel />} />
        </Route>
        <Route path="holidays" element={<Navigate to="/settings/holidays" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/calendar" replace />} />
    </Routes>
  );
}
