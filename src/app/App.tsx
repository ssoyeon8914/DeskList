import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../ui/Layout";
import { CalendarPage } from "../features/calendar/CalendarPage";
import { TodosPage } from "../features/todos/TodosPage";
import { MandalartPage } from "../features/mandalart/MandalartPage";
import { SettingsPage } from "../features/settings/SettingsPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/calendar" replace />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="todos" element={<TodosPage />} />
        <Route path="mandalart" element={<MandalartPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/calendar" replace />} />
    </Routes>
  );
}
