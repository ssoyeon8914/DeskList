type FilterKey = "types" | "categories" | "statuses" | "priorities";

export function FilterGroup({
  label,
  filterKey,
  values,
  active,
  onToggle,
}: {
  label: string;
  filterKey: FilterKey;
  values: string[];
  active: string[];
  onToggle: (key: FilterKey, value: string) => void;
}) {
  return (
    <div className="slicer-group" data-key={filterKey}>
      <span>{label}</span>
      {values.map((v) => (
        <button
          key={v}
          type="button"
          data-value={v}
          aria-pressed={active.includes(v)}
          onClick={() => onToggle(filterKey, v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
