
import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Plus, X, RefreshCw } from "lucide-react";
import "../styles/EstateOwner.css";

const initialOwnerForm = {
  username: "",
  password: "",
  phone: "",
  address: "",
};

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const getErrorMessage = (err) => {
  const data = err?.response?.data;

  if (typeof data?.detail === "string") return data.detail;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([key, value]) => {
        const message = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "string"
            ? value
            : JSON.stringify(value);

        return `${key}: ${message}`;
      })
      .join(" | ");
  }

  return "Unable to complete the request. Please try again.";
};

function EstateOwner() {
  const { user } = useAuth();

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
      ["admin", "administrator", "superuser"].includes(role)
  );

  const [owners, setOwners] = useState([]);
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [ownerForm, setOwnerForm] = useState(initialOwnerForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        API.get("estate-owner-profiles/"),
        API.get("estates/"),
      ]);

      if (results[0].status === "rejected") {
        throw results[0].reason;
      }

      setOwners(getList(results[0].value.data));

      if (results[1].status === "fulfilled") {
        setEstates(getList(results[1].value.data));
      } else {
        setEstates([]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getUser = (owner) =>
    owner.user_details || owner.user || {};

  const getName = (owner) => {
    const user = getUser(owner);

    return (
      owner.full_name ||
      user.full_name ||
      [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      user.username ||
      owner.username ||
      "Estate Owner"
    );
  };

  const getUsername = (owner) => {
    const user = getUser(owner);
    return user.username || owner.username || "—";
  };

  const getEmail = (owner) => {
    const user = getUser(owner);
    return owner.email || user.email || "—";
  };

  const getPhone = (owner) =>
    owner.phone_number || owner.phone || "—";

  const getOwnerId = (estate) => {
    const owner = estate.owner_details ?? estate.owner;

    return typeof owner === "object"
      ? String(owner?.id ?? owner?.pk ?? "")
      : String(owner ?? "");
  };

  const getProfileUserId = (owner) => {
    const user = getUser(owner);

    return String(
      user.id ??
        user.pk ??
        owner.user_id ??
        (typeof owner.user === "number" ||
        typeof owner.user === "string"
          ? owner.user
          : "") ??
        owner.id ??
        ""
    );
  };

  const getOwnerEstates = (owner) => {
    const userId = getProfileUserId(owner);

    return estates.filter(
      (estate) => getOwnerId(estate) === userId
    );
  };

  const getAddress = (owner) => owner.address || "—";

  const filteredOwners = useMemo(() => {
    const query = search.trim().toLowerCase();

    return owners.filter((owner) =>
      [
        getName(owner),
        getUsername(owner),
        getEmail(owner),
        getPhone(owner),
        getAddress(owner),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [owners, search]);

  const assignedEstateCount = estates.length;

  const handleAddOwner = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isAdmin) {
      setError("Only an administrator can add an estate owner.");
      return;
    }

    if (!ownerForm.username.trim() || !ownerForm.password) {
      setError("Username and password are required.");
      return;
    }

    setSaving(true);

    try {
      await API.post("register/estate-owner/", {
        username: ownerForm.username.trim(),
        password: ownerForm.password,
        phone: ownerForm.phone.trim(),
        address: ownerForm.address.trim(),
      });

      setMessage("Estate owner registered successfully.");
      setOwnerForm(initialOwnerForm);
      setShowForm(false);

      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="estate-owner-page">
      <div className="estate-owner-header">
        <div>
          <h2>Estate Owner Management</h2>
          <p>
            View registered owners and their estate information.
          </p>
        </div>

        <div className="estate-owner-header-actions">
          <button
            type="button"
            className="estate-owner-refresh"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? "Loading..." : "Refresh"}
          </button>

          {isAdmin && (
            <button
              type="button"
              className="estate-owner-add"
              onClick={() => {
                setError("");
                setMessage("");
                setShowForm(true);
              }}
            >
              <Plus size={17} />
              Add Estate Owner
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="estate-owner-alert estate-owner-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="estate-owner-alert" role="alert">
          {error}
        </div>
      )}

      <div className="estate-owner-stats">
        <div className="estate-owner-stat">
          <span>Total Owners</span>
          <strong>{owners.length}</strong>
        </div>

        <div className="estate-owner-stat">
          <span>Total Estates</span>
          <strong>{assignedEstateCount}</strong>
        </div>

        <div className="estate-owner-stat">
          <span>Average Estates per Owner</span>
          <strong>
            {owners.length
              ? (assignedEstateCount / owners.length).toFixed(1)
              : "0"}
          </strong>
        </div>
      </div>

      <div className="estate-owner-content">
        <div className="estate-owner-toolbar">
          <input
            type="search"
            placeholder="Search owner, email, or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search estate owners"
          />
        </div>

        {loading ? (
          <div className="estate-owner-empty">
            Loading estate owners...
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="estate-owner-empty">
            <h3>No estate owners found</h3>
            <p>Registered estate owners will appear here.</p>
          </div>
        ) : (
          <div className="estate-owner-table-wrapper">
            <table className="estate-owner-table">
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Number of Estates</th>
                  <th>Registration Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredOwners.map((owner) => {
                  const ownerEstates = getOwnerEstates(owner);

                  return (
                    <tr key={owner.id}>
                      <td>
                        <div className="estate-owner-person">
                          <div className="estate-owner-avatar">
                            {getName(owner).charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>{getName(owner)}</strong>
                            <small>@{getUsername(owner)}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div>{getPhone(owner)}</div>
                        <small className="estate-owner-email">
                          {getEmail(owner)}
                        </small>
                      </td>

                      <td>{getAddress(owner)}</td>

                      <td>
                        <span className="estate-owner-count">
                          {ownerEstates.length}
                        </span>
                      </td>

                      <td>
                        {owner.created_at
                          ? new Date(
                              owner.created_at
                            ).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="estate-owner-footer">
          Showing {filteredOwners.length} of {owners.length} owners
        </div>
      </div>

      {showForm && isAdmin && (
        <div
          className="estate-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <section
            className="estate-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="owner-modal-title"
          >
            <div className="estate-modal-header">
              <div>
                <h2 id="owner-modal-title">Add Estate Owner</h2>
                <p>Create a new estate owner account.</p>
              </div>

              <button
                type="button"
                className="estate-close-button"
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddOwner}>
              <div className="estate-form-grid">
                <label className="estate-field">
                  Username *
                  <input
                    type="text"
                    autoComplete="username"
                    value={ownerForm.username}
                    onChange={(event) =>
                      setOwnerForm({
                        ...ownerForm,
                        username: event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label className="estate-field">
                  Password *
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={ownerForm.password}
                    onChange={(event) =>
                      setOwnerForm({
                        ...ownerForm,
                        password: event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label className="estate-field">
                  Phone
                  <input
                    type="tel"
                    value={ownerForm.phone}
                    onChange={(event) =>
                      setOwnerForm({
                        ...ownerForm,
                        phone: event.target.value,
                      })
                    }
                  />
                </label>

                <label className="estate-field">
                  Address
                  <input
                    type="text"
                    value={ownerForm.address}
                    onChange={(event) =>
                      setOwnerForm({
                        ...ownerForm,
                        address: event.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <div className="estate-modal-actions">
                <button
                  type="button"
                  className="estate-owner-refresh"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="estate-owner-add"
                  disabled={saving}
                >
                  {saving ? "Creating..." : "Create Estate Owner"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default EstateOwner;