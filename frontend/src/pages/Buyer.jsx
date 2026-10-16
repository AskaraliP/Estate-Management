
import React, { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api/client";
import "../styles/Buyer.css";

import {
  Building2,
  Search,
  RefreshCw,
  Users,
  Mail,
  Phone,
  MapPin,
  FileText,
  Plus,
  X,
  UserRound,
} from "lucide-react";

const REGISTER_BUYER_URL = "register/buyer/";

const EMPTY_FORM = {
  username: "",
  password: "",
  company_name: "",
  email: "",
  phone_number: "",
  address: "",
  gst_number: "",
};

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

function checkAdminRole(user = {}) {
  const role = String(
    user.role ||
      user.user_role ||
      user.user_type ||
      ""
  )
    .trim()
    .toLowerCase();

  return Boolean(
    user.is_staff ||
      user.is_superuser ||
      user.is_admin ||
      role === "admin" ||
      role === "administrator"
  );
}

function getErrorMessage(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if (status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (status === 404) {
    return "API endpoint not found. Check the URL in estate/urls.py.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (data && typeof data === "object") {
    const messages = Object.entries(data).map(([field, value]) => {
      const detail = Array.isArray(value)
        ? value.join(", ")
        : typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : String(value);

      return `${field}: ${detail}`;
    });

    if (messages.length) return messages.join(" | ");
  }

  return error?.message || fallback;
}

export default function Buyer() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const loadBuyers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("buyer-profiles/");
      setBuyers(getList(response.data));
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load buyers. Please check your connection."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCurrentUser = useCallback(async () => {
    setCheckingRole(true);

    try {
      const response = await API.get("user-role/");
      const user = response.data || {};

      setIsAdmin(checkAdminRole(user));
    } catch (err) {
      console.error(
        "Unable to check current user role:",
        err.response?.data || err.message
      );

      setIsAdmin(false);
    } finally {
      setCheckingRole(false);
    }
  }, []);

  useEffect(() => {
    loadBuyers();
    loadCurrentUser();
  }, [loadBuyers, loadCurrentUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
  };

  const openForm = () => {
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setError("");
    setSuccess("");

    if (!isAdmin) {
      setFormError("Only administrators can register buyers.");
      return;
    }

    const username = form.username.trim();
    const companyName = form.company_name.trim();
    const password = form.password;

    if (!username || !password || !companyName) {
      setFormError(
        "Username, password, and company name are required."
      );
      return;
    }

    if (password.length < 8) {
      setFormError("Password must contain at least 8 characters.");
      return;
    }

    const payload = {
      username,
      password,
      company_name: companyName,
      email: form.email.trim(),
      phone_number: form.phone_number.trim(),
      address: form.address.trim(),
      gst_number: form.gst_number.trim(),
    };

    setSaving(true);

    try {
      const response = await API.post(
        REGISTER_BUYER_URL,
        payload
      );

      setSuccess(
        response.data?.message ||
          "Buyer registered successfully."
      );

      setForm({ ...EMPTY_FORM });
      setShowForm(false);

      await loadBuyers();
    } catch (err) {
      setFormError(
        getErrorMessage(
          err,
          "Unable to register buyer. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredBuyers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return buyers.filter((buyer) => {
      const user = buyer.user || {};

      const searchableText = [
        buyer.company_name,
        buyer.full_name,
        buyer.phone_number,
        buyer.phone,
        buyer.email,
        user.username,
        user.email,
        buyer.gst_number,
        buyer.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(term);
    });
  }, [buyers, search]);

  return (
    <div className="buyer-page">
      <header className="buyer-page-header">
        <div>
          <p className="buyer-eyebrow">
            RUBBER ESTATE MANAGEMENT
          </p>

          <h1>B2B Buyers</h1>

          <p>
            View and manage registered rubber product buyers.
          </p>
        </div>

        <div className="buyer-header-actions">
          {isAdmin && !checkingRole && (
            <button
              type="button"
              className="buyer-add-button"
              onClick={showForm ? closeForm : openForm}
              disabled={saving}
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? "Close Form" : "Add Buyer"}
            </button>
          )}

          <button
            type="button"
            className="buyer-refresh-button"
            onClick={loadBuyers}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "buyer-spinning" : ""}
            />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </header>

      {success && (
        <div className="buyer-success-message" role="status">
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="buyer-error-message" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadBuyers}
            disabled={loading}
          >
            Try again
          </button>
        </div>
      )}

      {showForm && isAdmin && (
        <section className="buyer-form-section">
          <div className="buyer-form-heading">
            <div>
              <h2>Add New Buyer</h2>
              <p>
                Create a buyer login and company profile.
              </p>
            </div>

            <button
              type="button"
              className="buyer-form-close"
              onClick={closeForm}
              disabled={saving}
              aria-label="Close buyer form"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="buyer-form">
            <div className="buyer-form-grid">
              <label>
                Username *
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  autoComplete="username"
                  placeholder="Enter username"
                />
              </label>

              <label>
                Password *
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Create password"
                />
              </label>

              <label>
                Company Name *
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  placeholder="Enter company name"
                />
              </label>

              <label>
                Email Address
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
              </label>

              <label>
                Phone Number
                <input
                  name="phone_number"
                  type="tel"
                  value={form.phone_number}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </label>

              <label>
                GST Number
                <input
                  name="gst_number"
                  value={form.gst_number}
                  onChange={handleChange}
                  placeholder="Enter GST number"
                />
              </label>

              <label className="buyer-form-full-width">
                Company Address
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter company address"
                />
              </label>
            </div>

            {formError && (
              <div className="buyer-error-message" role="alert">
                {formError}
              </div>
            )}

            <div className="buyer-form-actions">
              <button
                type="button"
                className="buyer-cancel-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="buyer-add-button"
                disabled={saving || checkingRole}
              >
                {saving ? "Creating Buyer..." : "Create Buyer"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="buyer-summary-card">
        <div className="buyer-summary-icon">
          <Users size={24} />
        </div>

        <div>
          <span>Total Registered Buyers</span>
          <h2>{buyers.length}</h2>
        </div>
      </section>

      <section className="buyer-list-section">
        <div className="buyer-list-header">
          <div>
            <h2>Buyer Directory</h2>
            <p>
              {loading
                ? "Loading buyer records..."
                : `${filteredBuyers.length} buyer(s) found`}
            </p>
          </div>

          <div className="buyer-search-box">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search company, email, GST..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search buyers"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="buyer-empty-state">
            <RefreshCw size={26} className="buyer-spinning" />
            <p>Loading buyers...</p>
          </div>
        ) : error && buyers.length === 0 ? (
          <div className="buyer-empty-state">
            <Users size={36} />
            <h3>Unable to load buyers</h3>
            <p>Check your login and API permissions, then try again.</p>

            <button
              type="button"
              className="buyer-add-button"
              onClick={loadBuyers}
            >
              Try Again
            </button>
          </div>
        ) : filteredBuyers.length === 0 ? (
          <div className="buyer-empty-state">
            <Users size={36} />
            <h3>
              {search ? "No matching buyers" : "No buyers found"}
            </h3>
            <p>
              {search
                ? "Try another company name, email, phone, or GST number."
                : "Registered buyers will appear here."}
            </p>

            {search && (
              <button
                type="button"
                className="buyer-cancel-button"
                onClick={() => setSearch("")}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="buyer-grid">
            {filteredBuyers.map((buyer, index) => {
              const user = buyer.user || {};

              const name =
                buyer.company_name ||
                buyer.full_name ||
                user.username ||
                `Buyer #${buyer.id ?? index + 1}`;

              const email =
                buyer.email || user.email || "Not provided";

              const phone =
                buyer.phone_number ||
                buyer.phone ||
                "Not provided";

              const buyerId =
                buyer.id ?? buyer.pk ?? index;

              return (
                <article className="buyer-card" key={buyerId}>
                  <div className="buyer-card-header">
                    <div className="buyer-company-icon">
                      <Building2 size={22} />
                    </div>

                    <div className="buyer-company-info">
                      <h3>{name}</h3>
                      <span>Buyer ID: {buyerId}</span>
                    </div>
                  </div>

                  <div className="buyer-detail">
                    <UserRound size={16} />
                    <span>
                      {user.username ||
                        buyer.username ||
                        "Username not available"}
                    </span>
                  </div>

                  <div className="buyer-detail">
                    <Mail size={16} />
                    <span>{email}</span>
                  </div>

                  <div className="buyer-detail">
                    <Phone size={16} />
                    <span>{phone}</span>
                  </div>

                  <div className="buyer-detail">
                    <MapPin size={16} />
                    <span>
                      {buyer.address || "Address not provided"}
                    </span>
                  </div>

                  <div className="buyer-detail">
                    <FileText size={16} />
                    <span>
                      GST: {buyer.gst_number || "Not provided"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
