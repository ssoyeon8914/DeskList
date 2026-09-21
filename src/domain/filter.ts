import { enrich } from "./derive";
import type { AppState, EnrichedTodo, Filters, Todo } from "./types";

export function matchesFilters(todo: Todo, f: Filters): boolean {
  const e = enrich(todo);
  if (f.dates.length && !f.dates.includes(todo.date)) return false;
  if (!f.types.includes(todo.type)) return false;
  if (!f.priorities.includes(todo.priority)) return false;
  if (!f.categories.includes(todo.category)) return false;
  if (!f.statuses.includes(e.status)) return false;
  return true;
}

export function filteredTodos(state: AppState, extra?: Partial<Filters>): EnrichedTodo[] {
  const f = { ...state.filters, ...extra };
  return state.todos.map(enrich).filter((t) => matchesFilters(t, f));
}

export function monthFilteredTodos(state: AppState): EnrichedTodo[] {
  return filteredTodos(state, { dates: [] });
}

export function allCategories(todos: Todo[]): string[] {
  const set = new Set<string>();
  todos.forEach((t) => {
    if (t.category) set.add(t.category);
  });
  return [...set].sort();
}
