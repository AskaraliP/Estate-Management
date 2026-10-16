
import { useCallback, useEffect, useState } from "react";
import API from "../api/client";
import { useAuth } from "../context/AuthContext";
import "../styles/Harvest.css";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function normalizeRole(value) {
  const role = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (["owner", "estateowner"].includes(role)) {
    return "estate_owner";
  }

  if (["labourer", "labor", "laborer"].includes(role)) {
    return "labour";
  }

  if (["administrator", "superuser"].includes(role)) {
    return "admin";
  }

  return role;
}

function getErrorMessage(err, fallback) {
  const data = err?.response?.data;

  if (typeof data === "string") return data;
  if (data?.detail) return String(data.detail);
  if (data?.message) return String(data.message);

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([key, value]) => {
        const message = Array.isArray(value)
          ? value.map(String).join(", ")
          : typeof value === "object" && value !== null
            ? JSON.stringify(value)
            : String(value);

        return `${key}: ${message}`;
      })
      .join(" | ");
  }

  if (err?.message && !err?.response) {
    return `${fallback} ${err.message}`;
  }

  return fallback;
}

function getRecordStatus(record) {
  if (
    record.is_verified === true ||
    record.is_verified === 1 ||
    record.verified === true
  ) {
    return "VERIFIED";
  }

  const value = String(
    record.status || record.verification_status || ""
  )
    .trim()
    .toUpperCase();

  if (["VERIFIED", "APPROVED"].includes(value)) {
    return "VERIFIED";
  }

  if (value === "REJECTED") {
    return "REJECTED";
  }

  return "PENDING";
}

function getEstateId(value) {
  if (value && typeof value === "object") {
    return value.id ?? value.pk ?? "";
  }

  return value ?? "";
}

function Harvest() {
  const { user } = useAuth();

  const [harvests, setHarvests] = useState([]);
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------------------------------------------------------
  // ROLE DETECTION
  // ---------------------------------------------------------

  const role = normalizeRole(
    user?.role ||
      user?.user_role ||
      user?.user_type ||
      user?.profile?.role ||
      localStorage.getItem("user_role") ||
      localStorage.getItem("role")
  );

  const isAdmin = Boolean(
    user?.is_staff ||
      user?.is_superuser ||
      role === "admin"
  );

  const isEstateOwner = role === "estate_owner";
  const isLabour = role === "labour";

  // Owners and admins verify. Labourers submit.
  const canVerify = isAdmin || isEstateOwner;
  const canSubmit = isLabour && !isAdmin && !isEstateOwner;

  const [form, setForm] = useState({
    estate: "",
    harvest_date: getTodayDate(),
    category: "LATEX",
    quantity: "",
    unit: "LITRE",
    notes: "",
  });

  // ---------------------------------------------------------
  // LOAD HARVESTS AND VISIBLE ESTATES
  // ---------------------------------------------------------

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const requests = [
        API.get("tapping-records/"),
        API.get("estates/"),
      ];

      const [harvestResult, estateResult] =
        await Promise.all(requests);

      setHarvests(getList(harvestResult.data));
      setEstates(getList(estateResult.data));
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load harvest records. Check your login and API."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Select the first estate visible to this user.
  useEffect(() => {
    if (estates.length === 0) return;

    const estateExists = estates.some(
      (estate) => String(estate.id) === String(form.estate)
    );

    if (!form.estate || !estateExists) {
      setForm((previous) => ({
        ...previous,
        estate: String(estates[0].id),
      }));
    }
  }, [estates, form.estate]);

  // ---------------------------------------------------------
  // FORM INPUTS
  // ---------------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "category"
        ? {
            unit: value === "LATEX" ? "LITRE" : "KG",
          }
        : {}),
    }));
  };

  // ---------------------------------------------------------
  // LABOURER SUBMITS HARVEST
  // ---------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!canSubmit) {
      setError("Only labourers can submit harvest records.");
      return;
    }

    if (!form.estate) {
      setError(
        "No estate is available. Please join an estate before submitting harvest."
      );
      return;
    }

    if (!form.harvest_date) {
      setError("Please select the harvest date.");
      return;
    }

    if (
      !form.quantity ||
      !Number.isFinite(Number(form.quantity)) ||
      Number(form.quantity) <= 0
    ) {
      setError("Enter a valid quantity greater than zero.");
      return;
    }

    setSubmitting(true);

    try {
      await API.post("tapping-records/", {
        estate: Number(form.estate),
        harvest_date: form.harvest_date,
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        notes: form.notes.trim(),
      });

      setSuccess(
        "Harvest submitted successfully. It is waiting for owner verification."
      );

      setForm((previous) => ({
        ...previous,
        harvest_date: getTodayDate(),
        quantity: "",
        notes: "",
      }));

      await loadData();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to submit harvest. Please try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // OWNER / ADMIN VERIFIES HARVEST
  // ---------------------------------------------------------

  const handleVerify = async (record) => {
    if (!canVerify || verifyingId !== null) return;

    if (getRecordStatus(record) !== "PENDING") {
      setError("This harvest record is no longer pending.");
      return;
    }

    const confirmed = window.confirm(
      "Verify this harvest? The backend will add its quantity to inventory."
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setVerifyingId(record.id);

    try {
      await API.post(`tapping-records/${record.id}/verify/`);

      setSuccess(
        "Harvest verified successfully. Inventory and production records have been updated."
      );

      await loadData();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to verify this harvest record."
        )
      );
    } finally {
      setVerifyingId(null);
    }
  };

  // ---------------------------------------------------------
  // DISPLAY HELPERS
  // ---------------------------------------------------------

  const getEstateName = (record) => {
    const recordEstate =
      record.estate_details || record.estate;

    if (
      recordEstate &&
      typeof recordEstate === "object"
    ) {
      return (
        recordEstate.name ||
        recordEstate.estate_name ||
        "—"
      );
    }

    const estateId = getEstateId(recordEstate);

    const match = estates.find(
      (estate) => String(estate.id) === String(estateId)
    );

    return (
      match?.name ||
      match?.estate_name ||
      (estateId ? `Estate ${estateId}` : "—")
    );
  };

  const pendingCount = harvests.filter(
    (record) => getRecordStatus(record) === "PENDING"
  ).length;

  const verifiedCount = harvests.filter(
    (record) => getRecordStatus(record) === "VERIFIED"
  ).length;

  const rejectedCount = harvests.filter(
    (record) => getRecordStatus(record) === "REJECTED"
  ).length;

  // ---------------------------------------------------------
  // PAGE
  // ---------------------------------------------------------

  return (
    <div className="harvest-page">
      <div className="harvest-header">
        <div>
          <h2>
            {canVerify
              ? "Harvest Management"
              : canSubmit
                ? "My Harvest"
                : "Harvest Records"}
          </h2>

          <p>
            {canVerify
              ? "Review submitted harvests and verify estate production."
              : canSubmit
                ? "Submit your daily harvest and track its verification."
                : "View harvest records for your account."}
          </p>
        </div>

        <button
          type="button"
          className="harvest-refresh"
          onClick={loadData}
          disabled={loading || submitting || verifyingId !== null}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="harvest-alert error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="harvest-alert success" role="status">
          {success}
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="harvest-stats">
        <div className="harvest-stat-card">
          <span>Total Records</span>
          <strong>{harvests.length}</strong>
        </div>

        <div className="harvest-stat-card">
          <span>Pending Verification</span>
          <strong>{pendingCount}</strong>
        </div>

        <div className="harvest-stat-card">
          <span>Verified Records</span>
          <strong>{verifiedCount}</strong>
        </div>

        {canVerify && (
          <div className="harvest-stat-card">
            <span>Rejected Records</span>
            <strong>{rejectedCount}</strong>
          </div>
        )}
      </div>

      {/* LABOURER HARVEST SUBMISSION FORM */}

      {canSubmit && (
        <div className="harvest-card">
          <h3>Submit Daily Harvest</h3>

          {estates.length === 0 && !loading && (
            <div className="harvest-alert error" role="alert">
              No estate is available for your account. Ask the
              estate owner to approve your estate membership.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="harvest-form-grid">
              <div className="harvest-field">
                <label htmlFor="harvest-date">
                  Harvest Date
                </label>

                <input
                  id="harvest-date"
                  type="date"
                  name="harvest_date"
                  value={form.harvest_date}
                  max={getTodayDate()}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="harvest-field">
                <label htmlFor="harvest-estate">
                  Assigned Estate
                </label>

                <select
                  id="harvest-estate"
                  name="estate"
                  value={form.estate}
                  onChange={handleChange}
                  required
                  disabled={
                    submitting ||
                    loading ||
                    estates.length === 0
                  }
                >
                  <option value="">Select estate</option>

                  {estates.map((estate) => (
                    <option
                      key={estate.id}
                      value={String(estate.id)}
                    >
                      {estate.name ||
                        estate.estate_name ||
                        `Estate ${estate.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="harvest-field">
                <label htmlFor="harvest-category">
                  Harvest Type
                </label>

                <select
                  id="harvest-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                >
                  <option value="LATEX">Latex</option>
                  <option value="SHEET">Rubber Sheet</option>
                  <option value="SCRAP">Scrap Rubber</option>
                </select>
              </div>

              <div className="harvest-field">
                <label htmlFor="harvest-quantity">
                  Quantity
                </label>

                <input
                  id="harvest-quantity"
                  type="number"
                  name="quantity"
                  min="0.01"
                  step="0.01"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="harvest-field">
                <label htmlFor="harvest-unit">
                  Unit
                </label>

                <select
                  id="harvest-unit"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                >
                  <option value="LITRE">Litre</option>
                  <option value="KG">Kilogram</option>
                </select>
              </div>

              <div className="harvest-field full-width">
                <label htmlFor="harvest-notes">
                  Notes (Optional)
                </label>

                <textarea
                  id="harvest-notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add harvest notes..."
                  disabled={submitting}
                />
              </div>
            </div>

            <button
              type="submit"
              className="harvest-submit"
              disabled={
                submitting ||
                loading ||
                estates.length === 0
              }
            >
              {submitting
                ? "Submitting..."
                : "Submit Harvest"}
            </button>
          </form>
        </div>
      )}

      {/* HARVEST HISTORY */}

      <div className="harvest-card">
        <h3>
          {canVerify ? "Estate Harvest History" : "Harvest History"}
        </h3>

        {loading ? (
          <div className="harvest-empty">
            Loading harvest history...
          </div>
        ) : harvests.length === 0 ? (
          <div className="harvest-empty">
            <h3>No harvest records yet</h3>

            <p>
              {canVerify
                ? "Harvest submissions from your estates will appear here."
                : canSubmit
                  ? "Submit your first harvest using the form above."
                  : "No harvest records are available for your account."}
            </p>
          </div>
        ) : (
          <div className="harvest-table-wrapper">
            <table className="harvest-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Estate</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Verification</th>
                  {canVerify && <th>Action</th>}
                </tr>
              </thead>

              <tbody>
                {harvests.map((record) => {
                  const status = getRecordStatus(record);

                  return (
                    <tr key={record.id}>
                      <td>
                        {record.harvest_date ||
                          record.tap_date ||
                          record.date ||
                          "—"}
                      </td>

                      <td>{getEstateName(record)}</td>

                      <td>
                        {record.category ||
                          record.harvest_type ||
                          "—"}
                      </td>

                      <td>
                        {record.quantity ?? record.weight ?? "—"}{" "}
                        {record.unit || ""}
                      </td>

                      <td>
                        <span
                          className={`harvest-status ${status.toLowerCase()}`}
                        >
                          {status}
                        </span>
                      </td>

                      {canVerify && (
                        <td>
                          {status === "PENDING" ? (
                            <button
                              type="button"
                              className="harvest-verify-button"
                              onClick={() => handleVerify(record)}
                              disabled={
                                verifyingId !== null ||
                                loading
                              }
                            >
                              {verifyingId === record.id
                                ? "Verifying..."
                                : "Verify"}
                            </button>
                          ) : (
                            <span>—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Harvest;
