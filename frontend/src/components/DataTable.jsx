import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { useMemo, useState } from "react";
import "../styles/DataTable.css";

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder = "Search records...",
  emptyMessage = "No records found.",
  pageSize = 8,
  onRowClick,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return data;

    return data.filter((row) =>
      columns.some((column) => {
        if (column.searchable === false) return false;

        const value = column.accessor
          ? row[column.accessor]
          : "";

        return String(value ?? "").toLowerCase().includes(term);
      })
    );
  }, [data, columns, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const changeSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <section className="data-table-card">
      <div className="data-table-toolbar">
        <div className="data-table-heading">
          <h3>Records</h3>
          <span>
            {filteredData.length}{" "}
            {filteredData.length === 1 ? "record" : "records"}
          </span>
        </div>

        <label className="data-table-search">
          <Search size={17} />
          <input
            type="search"
            value={search}
            onChange={(event) => changeSearch(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search table"
          />
        </label>
      </div>

      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={Math.max(columns.length, 1)}>
                  <div className="data-table-state">
                    Loading records...
                  </div>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id ?? index}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? "data-table-clickable" : ""}
                >
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render
                        ? column.render(row)
                        : row[column.accessor] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={Math.max(columns.length, 1)}>
                  <div className="data-table-state">
                    <Inbox size={28} />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="data-table-footer">
        <span>
          {filteredData.length === 0
            ? "Showing 0 records"
            : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
                currentPage * pageSize,
                filteredData.length
              )} of ${filteredData.length}`}
        </span>

        <div className="data-table-pagination">
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onClick={() => setPage((previous) => Math.max(1, previous - 1))}
          >
            <ChevronLeft size={17} />
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage >= totalPages}
            onClick={() =>
              setPage((previous) => Math.min(totalPages, previous + 1))
            }
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}
