
import React, { useCallback, useEffect, useState } from "react";
import API from "../api/client";
import { useAuth } from "../context/AuthContext";
import "../styles/Estates.css";
import {
  Building2,
  Search,
  RefreshCw,
  MapPin,
  Plus,
  X,
  LandPlot,
  Users,
  Pencil,
  Trash2,
  Send,
} from "lucide-react";

const initialForm = {
  name: "",
  location: "",
  total_area: "",
  description: "",
  max_labour: 20,
  is_active: true,
};

function normalizeRole(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function getRole(user) {
  // Explicit administrator flags take priority over any stale role string.
  if (user?.is_superuser || user?.is_staff) return "admin";

  const candidates = [
    user?.role,
    user?.user_role,
    user?.user_type,
    user?.profile?.role,
  ]
    .filter(Boolean)
    .map(normalizeRole);

  if (
    candidates.some((role) =>
      ["admin", "administrator", "superuser"].includes(role)
    )
  ) {
    return "admin";
  }

  if (
    candidates.some((role) =>
      ["estate_owner", "owner", "estateowner"].includes(role)
    )
  ) {
    return "estate_owner";
  }

  if (
    candidates.some((role) =>
      ["labour", "labor", "labourer"].includes(role)
    )
  ) {
    return "labour";
  }

  return candidates[0] || "";
}

function getErrorMessage(err, fallback) {
  const data = err?.response?.data;

  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;

  if (data && typeof data === "object") {
    const details = Object.entries(data)
      .map(([key, value]) => {
        const text = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "object" && value !== null
            ? JSON.stringify(value)
            : String(value);

        return `${key}: ${text}`;
      })
      .join(" | ");

    if (details) return details;
  }

  return fallback;
}

function getLabourCount(estate) {
  const possibleCounts = [
    estate.labour_count,
    estate.labours_count,
    estate.labourers_count,
    estate.current_labour,
    estate.current_labour_count,
    estate.labours?.length,
    estate.labour_profiles?.length,
  ];

  const count = possibleCounts.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      Number.isFinite(Number(value))
  );

  return count === undefined ? null : Number(count);
}

// Read the assigned estate from the authenticated user/profile when available.
// AuthContext may expose the estate as an ID or as a nested object.
function getAssignedEstateId(user) {
  const possibleValues = [
    user?.estate_id,
    user?.estate?.id,
    user?.labour_profile?.estate_id,
    user?.labour_profile?.estate?.id,
    user?.labourprofile?.estate_id,
    user?.labourprofile?.estate?.id,
    user?.profile?.estate_id,
    user?.profile?.estate?.id,
  ];

  const assigned = possibleValues.find(
    (value) => value !== undefined && value !== null && value !== ""
  );

  return assigned === undefined ? null : String(assigned);
}

function isAlreadyAssignedToUser(estate, user) {
  const userId = user?.id == null ? null : String(user.id);
  const assignedEstateId = getAssignedEstateId(user);

  if (assignedEstateId !== null && String(estate.id) === assignedEstateId) {
    return true;
  }

  // Also support estate API responses that include assigned labour IDs.
  const labourIds = [
    ...(Array.isArray(estate.labour_ids) ? estate.labour_ids : []),
    ...(Array.isArray(estate.labour_user_ids) ? estate.labour_user_ids : []),
    ...(Array.isArray(estate.labours) ? estate.labours.map((item) =>
      typeof item === "object" ? item.user_id ?? item.user?.id ?? item.id : item
    ) : []),
    ...(Array.isArray(estate.labour_profiles) ? estate.labour_profiles.map((item) =>
      typeof item === "object" ? item.user_id ?? item.user?.id ?? item.user?.pk : item
    ) : []),
  ];

  return userId !== null && labourIds.some((id) => String(id) === userId);
}

export default function Estates() {
  const { user } = useAuth();

  const role = getRole(user);
  const isAdmin = role === "admin";
  const isEstateOwner = role === "estate_owner";
  const isLabour = role === "labour";

  // Admin and estate owners can manage estates.
  // Django must restrict owners to their own estates.
  const canAddEstate = isAdmin || isEstateOwner;
  const canManageEstate = isAdmin || isEstateOwner;

  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingEstateId, setDeletingEstateId] = useState(null);
  const [requestingEstateId, setRequestingEstateId] = useState(null);
  const [requestedEstateIds, setRequestedEstateIds] = useState([]);
  const [assignmentConfirmed, setAssignmentConfirmed] = useState(
    getAssignedEstateId(user) !== null
  );
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingEstate, setEditingEstate] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadEstates = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("estates/");
      const data = response.data?.results ?? response.data ?? [];

      setEstates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load estates. Please check your login and API."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEstates();
  }, [loadEstates]);

  useEffect(() => {
    if (getAssignedEstateId(user) !== null) {
      setAssignmentConfirmed(true);
    }
  }, [user]);

  const filteredEstates = estates.filter((estate) => {
    const text = [
      estate.name,
      estate.location,
      estate.description,
      estate.owner_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const activeEstates = estates.filter(
    (estate) => estate.is_active !== false
  );

  const totalCapacity = estates.reduce(
    (total, estate) => total + (Number(estate.max_labour) || 0),
    0
  );

  function openCreateForm() {
    setError("");
    setMessage("");
    setEditingEstate(null);
    setForm(initialForm);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingEstate(null);
    setForm(initialForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!canManageEstate) {
      setError("You do not have permission to manage estates.");
      return;
    }

    if (!form.name.trim() || !form.location.trim()) {
      setError("Please enter the estate name and location.");
      return;
    }

    const area =
      form.total_area === "" ? null : Number(form.total_area);
    const maxLabour = Number(form.max_labour);

    if (area !== null && (!Number.isFinite(area) || area < 0)) {
      setError("Please enter a valid estate area.");
      return;
    }

    if (!Number.isInteger(maxLabour) || maxLabour < 1) {
      setError("Maximum labourers must be at least 1.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        location: form.location.trim(),
        total_area: area,
        max_labour: maxLabour,
      };

      if (editingEstate) {
        await API.patch(`estates/${editingEstate.id}/`, payload);
        setMessage("Estate updated successfully.");
      } else {
        await API.post("estates/", payload);
        setMessage("Estate created successfully.");
      }

      closeForm();
      await loadEstates();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save estate."));
    } finally {
      setSaving(false);
    }
  }

  function handleEditEstate(estate) {
    if (!canManageEstate) return;

    setError("");
    setMessage("");
    setEditingEstate(estate);

    setForm({
      name: estate.name || "",
      location: estate.location || "",
      total_area: estate.total_area ?? "",
      description: estate.description || "",
      max_labour: estate.max_labour ?? 20,
      is_active: estate.is_active !== false,
    });

    setShowForm(true);
  }

  async function handleDeleteEstate(estate) {
    if (!canManageEstate || deletingEstateId !== null) return;

    const confirmed = window.confirm(
      `Delete estate "${estate.name || `#${estate.id}`}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setDeletingEstateId(estate.id);

    try {
      await API.delete(`estates/${estate.id}/`);

      setEstates((current) =>
        current.filter((item) => item.id !== estate.id)
      );

      setMessage("Estate deleted successfully.");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to delete estate. Check your permissions and try again."
        )
      );
    } finally {
      setDeletingEstateId(null);
    }
  }

  async function handleRequestToJoin(estate) {
    if (
      !isLabour ||
      estate.is_active === false ||
      assignmentConfirmed ||
      isAlreadyAssignedToUser(estate, user)
    ) {
      return;
    }

    setError("");
    setMessage("");

    if (requestedEstateIds.includes(estate.id)) {
      setMessage("You have already submitted a request for this estate.");
      return;
    }

    const confirmed = window.confirm(
      `Submit a request to join ${estate.name}?`
    );

    if (!confirmed) return;

    setRequestingEstateId(estate.id);

    try {
      // Keep this URL aligned with the existing Django router.
      await API.post("labour-estate-requests/", {
        estate: estate.id,
      });

      setRequestedEstateIds((current) => [
        ...current,
        estate.id,
      ]);

      setMessage(
        `Your request to join ${estate.name} was submitted successfully.`
      );
    } catch (err) {
      const errorText = getErrorMessage(
        err,
        "Unable to submit your request. You may already have a pending request."
      );

      if (/already assigned/i.test(errorText)) {
        setAssignmentConfirmed(true);
        setError("");
        setMessage("You are already assigned to an estate. You cannot request to join another estate.");
      } else {
        setError(errorText);
      }
    } finally {
      setRequestingEstateId(null);
    }
  }

  return (
    <div className="estates-page">
      <header className="estates-header">
        <div>
          <h1>{isLabour ? "Find Estate" : "Estates"}</h1>
          <p>
            {isLabour
              ? "Browse available estates and request to join one."
              : isEstateOwner
                ? "Manage your estates and review estate information."
                : "Manage your rubber estates and estate information."}
          </p>
        </div>

        <div className="estates-header-actions">
          <button
            type="button"
            className="estate-button estate-button-secondary"
            onClick={loadEstates}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          {canAddEstate && (
            <button
              type="button"
              className="estate-button estate-button-primary"
              onClick={openCreateForm}
            >
              <Plus size={17} />
              Add Estate
            </button>
          )}
        </div>
      </header>

      {message && (
        <div className="estate-message estate-message-success">
          {message}
        </div>
      )}

      {error && (
        <div className="estate-message estate-message-error">
          {error}
        </div>
      )}

      <section className="estates-stats">
        <article className="estate-stat-card">
          <div className="estate-stat-icon">
            <Building2 size={22} />
          </div>
          <div>
            <span>Total Estates</span>
            <strong>{estates.length}</strong>
          </div>
        </article>

        <article className="estate-stat-card">
          <div className="estate-stat-icon">
            <LandPlot size={22} />
          </div>
          <div>
            <span>Active Estates</span>
            <strong>{activeEstates.length}</strong>
          </div>
        </article>

        <article className="estate-stat-card">
          <div className="estate-stat-icon">
            <Users size={22} />
          </div>
          <div>
            <span>Total Labour Capacity</span>
            <strong>{totalCapacity}</strong>
          </div>
        </article>
      </section>

      <section className="estates-list-section">
        <div className="estates-list-heading">
          <div>
            <h2>Estate Directory</h2>
            <p>{filteredEstates.length} estate(s) found</p>
          </div>

          <div className="estate-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search estates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="estate-empty-state">Loading estates...</div>
        ) : filteredEstates.length === 0 ? (
          <div className="estate-empty-state">
            <Building2 size={36} />
            <h3>No estates found</h3>
            <p>
              {isLabour
                ? "No estates are currently available."
                : "Create an estate or try another search."}
            </p>
          </div>
        ) : (
          <div className="estates-grid">
            {filteredEstates.map((estate) => {
              const labourCount = getLabourCount(estate);
              const maxLabour = Number(estate.max_labour ?? 10);
              const isFull =
                labourCount !== null && labourCount >= maxLabour;

              return (
                <article className="estate-card" key={estate.id}>
                  <div className="estate-card-top">
                    <div className="estate-card-icon">
                      <Building2 size={23} />
                    </div>

                    <span
                      className={`estate-status ${
                        estate.is_active === false
                          ? "inactive"
                          : "active"
                      }`}
                    >
                      {estate.is_active === false
                        ? "Inactive"
                        : "Active"}
                    </span>
                  </div>

                  <h3>{estate.name || `Estate #${estate.id}`}</h3>

                  <div className="estate-location">
                    <MapPin size={16} />
                    <span>
                      {estate.location || "Location not provided"}
                    </span>
                  </div>

                  <p className="estate-description">
                    {estate.description || "No description provided."}
                  </p>

                  <div className="estate-card-details">
                    <div>
                      <span>Total Area</span>
                      <strong>
                        {estate.total_area ?? "—"}
                        {estate.total_area != null ? " acres" : ""}
                      </strong>
                    </div>

                    <div>
                      <span>Labour Capacity</span>
                      <strong>
                        {labourCount === null ? "—" : labourCount}
                        /{maxLabour}
                      </strong>
                    </div>
                  </div>

                  <div className="estate-card-footer">
                    <span>Estate ID: {estate.id}</span>
                    {estate.owner_name && (
                      <span>{estate.owner_name}</span>
                    )}
                  </div>

                  {canManageEstate && (
                    <div className="estate-card-actions">
                      <button
                        type="button"
                        className="estate-button-update"
                        onClick={() => handleEditEstate(estate)}
                        aria-label={`Update ${estate.name || "estate"}`}
                      >
                        <Pencil size={15} />
                        Update
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          className="estate-button-delete"
                          onClick={() => handleDeleteEstate(estate)}
                          disabled={deletingEstateId === estate.id}
                          aria-label={`Delete ${estate.name || "estate"}`}
                        >
                          <Trash2 size={15} />
                          {deletingEstateId === estate.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      )}
                    </div>
                  )}

                  {isLabour && estate.is_active !== false && (
                    <div className="estate-card-actions">
                      {assignmentConfirmed ||
                      isAlreadyAssignedToUser(estate, user) ? (
                        <span className="estate-assignment-status">
                          Already Assigned
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="estate-button estate-button-primary"
                          onClick={() => handleRequestToJoin(estate)}
                          disabled={
                            isFull ||
                            requestingEstateId === estate.id ||
                            requestedEstateIds.includes(estate.id)
                          }
                        >
                          <Send size={15} />
                          {isFull
                            ? "Estate Full"
                            : requestingEstateId === estate.id
                              ? "Submitting..."
                              : requestedEstateIds.includes(estate.id)
                                ? "Request Submitted"
                                : "Request to Join"}
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {showForm && canManageEstate && (
        <div
          className="estate-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeForm();
            }
          }}
        >
          <section
            className="estate-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="estate-modal-title"
          >
            <div className="estate-modal-header">
              <div>
                <h2 id="estate-modal-title">
                  {editingEstate ? "Update Estate" : "Add New Estate"}
                </h2>
                <p>
                  {editingEstate
                    ? "Update the estate details below."
                    : "Enter the rubber estate details below."}
                </p>
              </div>

              <button
                type="button"
                className="estate-close-button"
                aria-label="Close form"
                onClick={closeForm}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="estate-form-grid">
                <label className="estate-field">
                  Estate Name *
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g. Green Valley Estate"
                    required
                  />
                </label>

                <label className="estate-field">
                  Location *
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="e.g. Areekode, Kerala"
                    required
                  />
                </label>

                <label className="estate-field">
                  Total Area (acres)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.total_area}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        total_area: e.target.value,
                      })
                    }
                    placeholder="Enter area"
                  />
                </label>

                <label className="estate-field">
                  Maximum Labourers
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.max_labour}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        max_labour: e.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label className="estate-field estate-field-full">
                  Description
                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe the estate..."
                  />
                </label>

                <label className="estate-checkbox-field estate-field-full">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        is_active: e.target.checked,
                      })
                    }
                  />
                  Estate is active
                </label>
              </div>

              {error && (
                <div className="estate-message estate-message-error">
                  {error}
                </div>
              )}

              <div className="estate-modal-actions">
                <button
                  type="button"
                  className="estate-button estate-button-secondary"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="estate-button estate-button-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingEstate
                      ? "Save Changes"
                      : "Create Estate"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
