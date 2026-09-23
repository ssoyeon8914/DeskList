export type Priority = "높음" | "중간" | "낮음";
export type Status = "시작전" | "진행중" | "완료";
export type WeekStartsOn = "sun" | "mon";

export type RecurWeekly = {
  freq: "weekly";
  /** 0=일 … 6=토 */
  weekdays: number[];
};

export type Holiday = {
  id: string;
  date: string;
  name: string;
};

export type MemoColor = "cream" | "mint" | "sky" | "rose";

export type Memo = {
  id: string;
  title: string;
  category: string;
  body: string;
  color: MemoColor;
  /** px */
  width: number;
  /** px */
  height: number;
  updatedAt: string;
};

export type DocFormat = "text" | "markdown";

export type DocFolder = {
  id: string;
  name: string;
  sort?: number;
  updatedAt: string;
};

export type Doc = {
  id: string;
  folderId: string;
  title: string;
  format: DocFormat;
  body: string;
  updatedAt: string;
};

export type DocsUiState = {
  selectedFolderId: string | null;
  selectedDocId: string | null;
  /** markdown 노트 보기: 원문 | 분할 | 프리뷰 */
  mdViewMode?: "edit" | "split" | "preview";
  foldersCollapsed?: boolean;
  titlesCollapsed?: boolean;
};

export type Todo = {
  id: string;
  type: string;
  dateStart: string;
  dateEnd: string;
  category: string;
  priority: Priority;
  title: string;
  progress: number;
  note: string;
  recur?: RecurWeekly;
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
  version: 3;
  types: TypeSetting[];
  todos: Todo[];
  holidays: Holiday[];
  memos: Memo[];
  docFolders: DocFolder[];
  docs: Doc[];
  docsUi: DocsUiState;
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
  dateStart: string;
  dateEnd: string;
  recur?: RecurWeekly | null;
  category?: string;
  priority?: Priority;
  title?: string;
  progress?: number;
  note?: string;
};

export type ScheduleMode = "single" | "range" | "recur";
