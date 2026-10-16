
import { Search, X } from "lucide-react";
import "../styles/SearchBar.css";

export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Search records...",
  onClear,
  disabled = false,
  size = "medium",
}) {
  const handleClear = () => {
    onChange?.("");
    onClear?.();
  };

  return (
    <div className={`search-bar search-bar-${size}`}>
      <Search
        className="search-bar-icon"
        size={18}
        aria-hidden="true"
      />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        disabled={disabled}
      />

      {value && (
        <button
          type="button"
          className="search-bar-clear"
          onClick={handleClear}
          disabled={disabled}
          aria-label="Clear search"
          title="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
