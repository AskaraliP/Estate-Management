
import React, { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  Search,
  RefreshCw,
  Receipt,
  Wallet,
  CalendarDays,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import "../styles/Expenses.css";

const categories = [

{ value: "labourE", label: "Labour Wage" },
{ value: "PRODUCTION", label: "Production" },
{ value: "MAINTENANCE", label: "Maintenance" },
{ value: "FERTILIZER", label: "Fertilizer" },
{ value: "TRANSPORT", label: "Transport" },
{ value: "OTHER", label: "Other" },
];


const today = () => {
  const date = new Date();
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );
  return localDate.toISOString().slice(0, 10);
};

const initialForm = {
  estate: "",
  category: "OTHER",
  amount: "",
  date: today(),
  description: "",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);

  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const getErrorMessage = (error) => {
  const data = error.response?.data;

  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([field, messages]) => {
        const message = Array.isArray(messages)
          ? messages.join(", ")
          : String(messages);

        return `${field}: ${message}`;
      })
      .join("\n");
  }

  return error.message || "Something went wrong. Please try again.";
};

const getList = (data) =>
  Array.isArray(data) ? data : data?.results || [];

export default function Expenses() {
  const auth = useAuth();
  const { user, isAdmin, isEstateOwner } = auth;

  // Support common role representations from AuthContext.
  const role = String(
    user?.role || user?.user_type || user?.account_type || ""
  ).toLowerCase().replace(/[\s-]+/g, "_");

  const canManageExpenses = Boolean(
    isAdmin ||
      isEstateOwner ||
      user?.is_staff ||
      user?.is_superuser ||
      role === "admin" ||
      role === "administrator" ||
      role === "estate_owner" ||
      role === "estateowner"
  );

  const [expenses, setExpenses] = useState([]);
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const requests = [API.get("expenses/")];

      if (canManageExpenses) {
        requests.push(API.get("estates/"));
      }

      const responses = await Promise.all(requests);

      setExpenses(getList(responses[0].data));
      setEstates(
        canManageExpenses ? getList(responses[1].data) : []
      );
    } catch (err) {
      console.error(
        "Failed to load expenses:",
        err.response?.status,
        err.response?.data || err.message
      );

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [canManageExpenses]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!success) return undefined;

    const timer = setTimeout(() => setSuccess(""), 3500);
    return () => clearTimeout(timer);
  }, [success]);

  const filteredExpenses = useMemo(() => {
    const term = search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch =
        !term ||
        String(expense.estate_name || "").toLowerCase().includes(term) ||
        String(expense.description || "").toLowerCase().includes(term) ||
        String(expense.category || "").toLowerCase().includes(term) ||
        String(expense.recorded_by_name || "").toLowerCase().includes(term);

      const matchesCategory =
        categoryFilter === "ALL" ||
        expense.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, categoryFilter]);

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openForm = () => {
    setError("");
    setSuccess("");
    setForm({ ...initialForm, date: today() });
    setShowForm(true);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.estate) {
      setError("Please select an estate.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    if (!form.date) {
      setError("Please select an expense date.");
      return;
    }

    setSaving(true);

    try {
      const response = await API.post("expenses/", {
        estate: Number(form.estate),
        category: form.category,
        amount: Number(form.amount),
        expense_date: form.date,
        description: form.description.trim(),
      });

      setExpenses((previous) => [response.data, ...previous]);
      setForm({ ...initialForm, date: today() });
      setShowForm(false);
      setSuccess("Expense recorded successfully.");
    } catch (err) {
      console.error(
        "Failed to create expense:",
        err.response?.status,
        err.response?.data || err.message
      );

      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expense) => {
    const confirmed = window.confirm(
      `Delete this expense of ${formatCurrency(expense.amount)}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(expense.id);

    try {
      await API.delete(`expenses/${expense.id}/`);

      setExpenses((previous) =>
        previous.filter((item) => item.id !== expense.id)
      );

      setSuccess("Expense deleted successfully.");
    } catch (err) {
      console.error(
        "Failed to delete expense:",
        err.response?.status,
        err.response?.data || err.message
      );

      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryLabel = (value) =>
    categories.find((item) => item.value === value)?.label ||
    value ||
    "Other";

  return (
    <div className="expenses-page">
      <header className="expenses-header">
        <div>
          <h1>Expenses</h1>
          <p>Track and manage rubber estate operating expenses.</p>
        </div>

        <div className="expenses-header-actions">
          <button
            type="button"
            className="expenses-btn expenses-btn-secondary"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? "expenses-spinner" : ""}
            />
            Refresh
          </button>

          {canManageExpenses && (
            <button
              type="button"
              className="expenses-btn expenses-btn-primary"
              onClick={openForm}
            >
              <Plus size={18} />
              Add Expense
            </button>
          )}
        </div>
      </header>

      {!canManageExpenses && (
        <div className="expenses-alert expenses-alert-error" role="status">
          <AlertCircle size={19} />
          <span>
            Your current account does not have permission to add expenses.
          </span>
        </div>
      )}

      {error && (
        <div className="expenses-alert expenses-alert-error" role="alert">
          <AlertCircle size={19} />
          <span>{error}</span>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="expenses-alert expenses-alert-success" role="status">
          <Receipt size={18} />
          <span>{success}</span>
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setSuccess("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="expenses-summary">
        <article className="expenses-summary-card">
          <div className="expenses-summary-icon">
            <Wallet size={22} />
          </div>
          <div>
            <p>Total Expenses</p>
            <h2>{formatCurrency(totalExpenses)}</h2>
            <span>Based on current filters</span>
          </div>
        </article>

        <article className="expenses-summary-card">
          <div className="expenses-summary-icon">
            <Receipt size={22} />
          </div>
          <div>
            <p>Expense Records</p>
            <h2>{filteredExpenses.length}</h2>
            <span>Matching records</span>
          </div>
        </article>

        <article className="expenses-summary-card">
          <div className="expenses-summary-icon">
            <CalendarDays size={22} />
          </div>
          <div>
            <p>Categories Used</p>
            <h2>
              {
                new Set(
                  filteredExpenses.map((item) => item.category)
                ).size
              }
            </h2>
            <span>Expense categories</span>
          </div>
        </article>
      </section>

      <section className="expenses-panel">
        <div className="expenses-toolbar">
          <div className="expenses-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search estate, category or description..."
              aria-label="Search expenses"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="ALL">All categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="expenses-empty">
            <RefreshCw className="expenses-spinner" size={24} />
            <p>Loading expenses...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="expenses-empty">
            <Receipt size={36} />
            <h3>No expenses found</h3>
            <p>
              {search || categoryFilter !== "ALL"
                ? "Try changing your search or filter."
                : "Expense records will appear here once added."}
            </p>

            {canManageExpenses && (
              <button
                type="button"
                className="expenses-btn expenses-btn-primary"
                onClick={openForm}
              >
                <Plus size={17} />
                Add First Expense
              </button>
            )}
          </div>
        ) : (
          <div className="expenses-table-wrapper">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Estate</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Recorded By</th>
                  <th className="expenses-amount-cell">Amount</th>
                  {canManageExpenses && <th>Action</th>}
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{formatDate(expense.expense_date)}</td>
                    <td>
                      {expense.estate_name || `Estate #${expense.estate}`}
                    </td>
                    <td>
                      <span className="expenses-category-badge">
                        {getCategoryLabel(expense.category)}
                      </span>
                    </td>
                    <td className="expenses-description">
                      {expense.description || "—"}
                    </td>
                    <td>{expense.recorded_by_name || "—"}</td>
                    <td className="expenses-amount-cell">
                      {formatCurrency(expense.amount)}
                    </td>

                    {canManageExpenses && (
                      <td>
                        <button
                          type="button"
                          className="expenses-delete-btn"
                          onClick={() => handleDelete(expense)}
                          disabled={deletingId === expense.id}
                          aria-label={`Delete expense ${expense.id}`}
                          title="Delete expense"
                        >
                          {deletingId === expense.id ? (
                            <RefreshCw
                              size={17}
                              className="expenses-spinner"
                            />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="expenses-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              setShowForm(false);
            }
          }}
        >
          <section
            className="expenses-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="expenses-modal-title"
          >
            <div className="expenses-modal-header">
              <div>
                <h2 id="expenses-modal-title">Add Expense</h2>
                <p>Enter the estate expense details below.</p>
              </div>

              <button
                type="button"
                className="expenses-modal-close"
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="expenses-form-grid">
                <label>
                  Estate <span>*</span>
                  <select
                    name="estate"
                    value={form.estate}
                    onChange={updateForm}
                    required
                  >
                    <option value="">Select estate</option>
                    {estates.map((estate) => (
                      <option key={estate.id} value={estate.id}>
                        {estate.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Category <span>*</span>
                  <select
                    name="category"
                    value={form.category}
                    onChange={updateForm}
                    required
                  >
                    {categories.map((category) => (
                      <option
                        key={category.value}
                        value={category.value}
                      >
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Amount (₹) <span>*</span>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={updateForm}
                    min="0.01"
                    step="0.01"
                    placeholder="Enter amount"
                    required
                  />
                </label>

                <label>
                  Expense Date <span>*</span>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={updateForm}
                    required
                  />
                </label>

                <label className="expenses-full-width">
                  Description
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={updateForm}
                    rows={3}
                    placeholder="Describe the expense..."
                  />
                </label>
              </div>

              {estates.length === 0 && (
                <p className="expenses-form-note">
                  No estates are available for this account. Create or
                  assign an estate before recording an expense.
                </p>
              )}

              <div className="expenses-modal-actions">
                <button
                  type="button"
                  className="expenses-btn expenses-btn-secondary"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="expenses-btn expenses-btn-primary"
                  disabled={saving || estates.length === 0}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="expenses-spinner"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Save Expense
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
