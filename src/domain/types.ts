export type Priority = "높음" | "중간" | "낮음";
export type Status = "시작전" | "진행중" | "완료";
export type WeekStartsOn = "sun" | "mon";

export type Todo = {
  id: string;
  type: string;
  date: string;
  category: string;
  priority: Priority;
  title: string;
  progress: number;
  note: string;
};

export type EnrichedTodo = Todo & {
  display: number;
  status: Status;
};

export type TypeSetting = { name: string; icon: string };

export type Filters = {
  dates: string[];
  types: string[];
  priorities: Priority[];
  categories: string[];
  statuses: Status[];
};

export type AppState = {
  version: 1;
  types: TypeSetting[];
  todos: Todo[];
  filters: Filters;
  weekStartsOn: WeekStartsOn;
  calendar: { year: number; month: number; density: 8 | 16 };
  week: { year: number; month: number; weekIndex: number };
  selectedId: string | null;
  mandala: string[];
};

export type MonthCell = {
  date: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
};

export type TodoInput = {
  id?: string;
  type: string;
  date: string;
  category?: string;
  priority?: Priority;
  title?: string;
  progress?: number;
  note?: string;
};
