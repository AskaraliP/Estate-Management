
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import API from "../api/client";
import "../styles/Labour.css";

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizeId = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "object") {
    return String(value.id ?? value.pk ?? "");
  }

  return String(value);
};

const getLabourName = (labour) =>
  labour.full_name ||
  labour.name ||
  labour.user?.full_name ||
  labour.user?.first_name ||
  labour.user?.username ||
  labour.username ||
  "Unnamed Labour";

const getEstateId = (labour) => {
  const estate = labour.estate ?? labour.estate_details;

  if (estate && typeof estate === "object") {
    return normalizeId(estate.id ?? estate.pk);
  }

  return normalizeId(estate);
};

const getEstateName = (labour, estates) => {
  const estate = labour.estate_details ?? labour.estate;

  if (estate && typeof estate === "object") {
    return (
      estate.name ||
      estate.estate_name ||
      estate.location ||
      "Assigned"
    );
  }

  const estateId = normalizeId(estate);

  if (estateId) {
    const found = estates.find(
      (item) =>
        normalizeId(item.id ?? item.pk) === estateId
    );

    return (
      found?.name ||
      found?.estate_name ||
      found?.location ||
      `Estate ${estateId}`
    );
  }

  return labour.estate_name || "Not assigned";
};

const hasEstateAssignment = (labour) =>
  Boolean(getEstateId(labour) || labour.estate_name);

const formatCurrency = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (data && typeof data === "object") {
    const firstField = Object.keys(data)[0];

    if (firstField) {
      const value = data[firstField];

      if (Array.isArray(value)) {
        return `${firstField}: ${value.join(", ")}`;
      }

      if (typeof value === "string") {
        return `${firstField}: ${value}`;
      }

      if (value && typeof value === "object") {
        return `${firstField}: ${JSON.stringify(value)}`;
      }
    }
  }

  if (error?.response?.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (error?.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (error?.response?.status === 404) {
    return "Registration endpoint not found. Check register-labour/ in estate/urls.py.";
  }

  return (
    error?.message ||
    "Something went wrong. Please try again."
  );
};

const INITIAL_FORM = {
  username: "",
  password: "",
  full_name: "",
  email: "",
  phone: "",
  address: "",
  daily_wage: "0",
};

export default function Labour() {
  const [labours, setLabours] = useState([]);
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [estateFilter, setEstateFilter] = useState("ALL");

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState(INITIAL_FORM);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [labourResult, estateResult] = await Promise.all([
        API.get("labour-profiles/"),
        API.get("estates/"),
      ]);

      const labourList = getList(labourResult.data);
      const estateList = getList(estateResult.data);

      setLabours(labourList);
      setEstates(estateList);

      setEstateFilter((current) => {
        if (
          current === "ALL" ||
          current === "UNASSIGNED"
        ) {
          return current;
        }

        const stillExists = estateList.some(
          (estate) =>
            normalizeId(estate.id ?? estate.pk) === current
        );

        return stillExists ? current : "ALL";
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setFormError("");
    setSuccessMessage("");
    setFormData(INITIAL_FORM);
    setShowAddForm(true);
  };

  const closeAddForm = () => {
    if (saving) return;

    setShowAddForm(false);
    setFormError("");
  };

  const handleAddLabour = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    const username = formData.username.trim();
    const fullName = formData.full_name.trim();
    const password = formData.password;
    const dailyWage = Number(formData.daily_wage);

    if (!username || !fullName || !password) {
      setFormError(
        "Please enter the worker's full name, username, and password."
      );
      return;
    }

    if (
      formData.daily_wage.trim() === "" ||
      !Number.isFinite(dailyWage) ||
      dailyWage < 0
    ) {
      setFormError("Please enter a valid daily wage.");
      return;
    }

    setSaving(true);

    try {
      await API.post("register/labour/", {
        username,
        password,
        full_name: fullName,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        daily_wage: dailyWage,
      });

      setShowAddForm(false);
      setFormData(INITIAL_FORM);
      setSuccessMessage(
        "Labour registered successfully."
      );

      await loadData();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const filteredLabours = useMemo(() => {
    const term = search.trim().toLowerCase();

    return labours.filter((labour) => {
      const name = getLabourName(labour);
      const phone =
        labour.phone_number || labour.phone || "";
      const username =
        labour.user?.username || labour.username || "";
      const estateName = getEstateName(labour, estates);
      const estateId = getEstateId(labour);
      const assigned = hasEstateAssignment(labour);

      const matchesSearch = [
        name,
        phone,
        username,
        estateName,
        labour.email,
        labour.address,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      );

      const matchesEstate =
        estateFilter === "ALL" ||
        (estateFilter === "UNASSIGNED" && !assigned) ||
        (estateFilter !== "UNASSIGNED" &&
          estateFilter !== "ALL" &&
          estateId === estateFilter);

      return matchesSearch && matchesEstate;
    });
  }, [labours, estates, search, estateFilter]);

  const assignedCount = useMemo(
    () => labours.filter(hasEstateAssignment).length,
    [labours]
  );

  const unassignedCount = labours.length - assignedCount;

  return (
    <section className="labour-page">
      <header className="labour-header">
        <div>
          <p className="labour-eyebrow">
            RUBBER ESTATE MANAGEMENT
          </p>

          <h1>Labour Management</h1>

          <p className="labour-subtitle">
            Manage worker profiles and their estate assignments.
          </p>
        </div>

        <div className="labour-header-actions">
          <button
            type="button"
            className="labour-add-btn"
            onClick={openAddForm}
          >
            + Add Labour
          </button>

          <button
            type="button"
            className="labour-refresh-btn"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>
      </header>

      {successMessage && (
        <div className="labour-success" role="status">
          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss success message"
          >
            ×
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="labour-form-panel">
          <div className="labour-form-heading">
            <div>
              <h2>Register New Labour</h2>
              <p>
                Enter worker details to create an account.
                You can assign an estate later.
              </p>
            </div>

            <button
              type="button"
              className="labour-close-btn"
              onClick={closeAddForm}
              disabled={saving}
              aria-label="Close registration form"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleAddLabour}>
            <div className="labour-form-grid">
              <label>
                Full Name *
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleFormChange}
                  required
                  maxLength={150}
                  placeholder="Enter full name"
                />
              </label>

              <label>
                Username *
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  required
                  maxLength={150}
                  autoComplete="username"
                  placeholder="Create username"
                />
              </label>

              <label>
                Password *
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Create password"
                />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="Enter phone number"
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="Enter email address"
                />
              </label>

              <label>
                Daily Wage (₹)
                <input
                  type="number"
                  name="daily_wage"
                  value={formData.daily_wage}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label className="labour-form-full">
                Address
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Enter worker address"
                />
              </label>
            </div>

            {formError && (
              <div className="labour-error" role="alert">
                <span>{formError}</span>
              </div>
            )}

            <div className="labour-form-actions">
              <button
                type="button"
                className="labour-cancel-btn"
                onClick={closeAddForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="labour-add-btn"
                disabled={saving}
              >
                {saving
                  ? "Registering..."
                  : "Register Labour"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="labour-summary">
        <article className="labour-stat-card">
          <div className="labour-stat-icon green">♙</div>
          <div>
            <span>Total Labourers</span>
            <strong>{labours.length}</strong>
          </div>
        </article>

        <article className="labour-stat-card">
          <div className="labour-stat-icon blue">✓</div>
          <div>
            <span>Assigned to Estate</span>
            <strong>{assignedCount}</strong>
          </div>
        </article>

        <article className="labour-stat-card">
          <div className="labour-stat-icon orange">◷</div>
          <div>
            <span>Not Assigned</span>
            <strong>{unassignedCount}</strong>
          </div>
        </article>
      </div>

      <div className="labour-content">
        <div className="labour-toolbar">
          <div>
            <h2>Labour Profiles</h2>
            <p>
              Worker information and current estate assignment.
            </p>
          </div>

          <input
            type="search"
            className="labour-search"
            placeholder="Search name, phone or estate..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            aria-label="Search labour profiles"
          />
        </div>

        <div className="labour-filter-row">
          <label htmlFor="labour-estate-filter">
            Filter by estate
          </label>

          <select
            id="labour-estate-filter"
            className="labour-estate-select"
            value={estateFilter}
            onChange={(event) =>
              setEstateFilter(event.target.value)
            }
          >
            <option value="ALL">All estates</option>
            <option value="UNASSIGNED">Not assigned</option>

            {estates.map((estate) => {
              const estateId = normalizeId(
                estate.id ?? estate.pk
              );

              if (!estateId) return null;

              return (
                <option key={estateId} value={estateId}>
                  {estate.name ||
                    estate.estate_name ||
                    estate.location ||
                    `Estate ${estateId}`}
                </option>
              );
            })}
          </select>
        </div>

        {error && (
          <div className="labour-error" role="alert">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="labour-message">
            Loading labour profiles...
          </div>
        ) : error ? null : filteredLabours.length === 0 ? (
          <div className="labour-empty">
            <div className="labour-empty-icon">♙</div>
            <h3>No labourers found</h3>
            <p>
              Registered labour profiles will appear here.
              Try changing your search or estate filter.
            </p>

            {search || estateFilter !== "ALL" ? (
              <button
                type="button"
                className="labour-cancel-btn"
                onClick={() => {
                  setSearch("");
                  setEstateFilter("ALL");
                }}
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="labour-table-wrapper">
            <table className="labour-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Contact</th>
                  <th>Assigned Estate</th>
                  <th>Daily Wage</th>
                  <th>Account Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredLabours.map((labour, index) => {
                  const name = getLabourName(labour);

                  const phone =
                    labour.phone_number ||
                    labour.phone ||
                    "—";

                  const estateName = getEstateName(
                    labour,
                    estates
                  );

                  const assigned =
                    hasEstateAssignment(labour);

                  const rowKey =
                    labour.id ??
                    labour.user?.id ??
                    labour.user_id ??
                    index;

                  return (
                    <tr key={rowKey}>
                      <td>
                        <div className="labour-worker">
                          <div className="labour-avatar">
                            {name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>{name}</strong>
                            <span>
                              {labour.user?.username ||
                                labour.username ||
                                `Worker #${rowKey}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="labour-contact">
                          <span>{phone}</span>

                          {labour.email && (
                            <small>{labour.email}</small>
                          )}
                        </div>
                      </td>

                      <td>{estateName}</td>

                      <td>
                        {labour.daily_wage != null
                          ? formatCurrency(labour.daily_wage)
                          : "—"}
                      </td>

                      <td>
                        <span
                          className={`labour-status ${
                            assigned
                              ? "assigned"
                              : "unassigned"
                          }`}
                        >
                          {assigned
                            ? "Assigned"
                            : "Not Assigned"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <footer className="labour-footer">
          Showing {filteredLabours.length} of{" "}
          {labours.length} labourers
        </footer>
      </div>
    </section>
  );
}
