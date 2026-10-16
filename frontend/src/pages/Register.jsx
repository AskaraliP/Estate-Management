
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api/client";
import "../styles/Register.css";

const initialForm = {
  username: "",
  full_name: "",
  company_name: "",
  email: "",
  phone_number: "",
  password: "",
  confirm_password: "",
  address: "",
  gst_number: "",
  daily_wage: "",
};

const registrationEndpoints = {
  estate_owner: "register/estate-owner/",
  labour: "register/labour/",
  buyer: "register/buyer/",
};

const validRoles = ["estate_owner", "labour", "buyer"];

function normalizeRole(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (!error?.response) {
    return "Unable to connect to the server. Check your backend and try again.";
  }

  if (error.response.status === 404) {
    return "Registration endpoint not found. Check the registration URL in estate/urls.py.";
  }

  if (error.response.status === 401) {
    return "Authentication is required for this registration. Please sign in with an authorized account.";
  }

  if (error.response.status === 403) {
    return "You do not have permission to register this account.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    if (data.detail) {
      return typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail);
    }

    return Object.entries(data)
      .map(([field, value]) => {
        let message;

        if (Array.isArray(value)) {
          message = value.join(" ");
        } else if (typeof value === "string") {
          message = value;
        } else {
          message = JSON.stringify(value);
        }

        return `${field.replaceAll("_", " ")}: ${message}`;
      })
      .join(" ");
  }

  return "Registration failed. Please check your information and try again.";
}

export default function Register() {
  const navigate = useNavigate();
  const { type } = useParams();

  const normalizedType = normalizeRole(type);

  const initialRole = validRoles.includes(normalizedType)
    ? normalizedType
    : "estate_owner";

  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({ ...initialForm });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const nextRole = validRoles.includes(normalizeRole(type))
      ? normalizeRole(type)
      : "estate_owner";

    setRole(nextRole);
    setError("");
    setSuccess("");
  }, [type]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleRoleChange = (newRole) => {
    if (!validRoles.includes(newRole)) return;

    setRole(newRole);
    setError("");
    setSuccess("");

    const rolePaths = {
      estate_owner: "/register/estate-owner",
      labour: "/register/labour",
      buyer: "/register/buyer",
    };

    navigate(rolePaths[newRole], { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validRoles.includes(role)) {
      setError("Please select a valid account type.");
      return;
    }

    if (
      !form.username.trim() ||
      !form.full_name.trim() ||
      !form.email.trim() ||
      !form.phone_number.trim() ||
      !form.password ||
      !form.confirm_password
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (role === "buyer" && !form.company_name.trim()) {
      setError("Please enter your company name.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (
      role === "labour" &&
      form.daily_wage !== "" &&
      (!Number.isFinite(Number(form.daily_wage)) ||
        Number(form.daily_wage) < 0)
    ) {
      setError("Please enter a valid daily wage.");
      return;
    }

    // Build the request using the field names expected by each
    // registration endpoint.
    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      address: form.address.trim(),
    };

    if (role === "estate_owner") {
      payload.full_name = form.full_name.trim();
      payload.phone = form.phone_number.trim();
    }

    if (role === "labour") {
      payload.full_name = form.full_name.trim();
      payload.phone = form.phone_number.trim();

      if (form.daily_wage !== "") {
        payload.daily_wage = Number(form.daily_wage);
      }
    }

    if (role === "buyer") {
      payload.full_name = form.full_name.trim();
      payload.company_name = form.company_name.trim();
      payload.phone_number = form.phone_number.trim();
      payload.gst_number = form.gst_number.trim();
    }

    setLoading(true);

    try {
      const response = await API.post(
        registrationEndpoints[role],
        payload
      );

      setSuccess(
        response.data?.message ||
          "Registration completed successfully. You can now log in."
      );

      setForm({ ...initialForm });
      setShowPassword(false);
      setShowConfirmPassword(false);

      // Redirect to login after successful registration.
      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-visual">
        <div className="register-brand">
          <div className="register-brand-icon">R</div>
          <span>Rubber Estate Management</span>
        </div>

        <div className="register-visual-content">
          <span className="register-pill">
            SMART ESTATE MANAGEMENT
          </span>

          <h1>
            Your rubber estate,
            <br />
            managed <span>smarter.</span>
          </h1>

          <p>
            Bring estate operations, labour management, production,
            and business transactions together in one place.
          </p>

          <div className="register-feature-list">
            <div>
              <span>✓</span>
              Digital estate records
            </div>

            <div>
              <span>✓</span>
              Labour and harvest tracking
            </div>

            <div>
              <span>✓</span>
              Inventory and B2B management
            </div>
          </div>
        </div>

        <p className="register-footer">
          Built for modern rubber estate operations.
        </p>
      </section>

      <section className="register-form-section">
        <div className="register-form-container">
          <div className="register-mobile-brand">
            <div className="register-brand-icon">R</div>
            <span>Rubber Estate Management</span>
          </div>

          <div className="register-heading">
            <p className="register-eyebrow">
              CREATE YOUR ACCOUNT
            </p>

            <h2>Get started</h2>

            <p>
              Register your account to access the platform.
            </p>
          </div>

          <div
            className="register-role-selector"
            aria-label="Choose account type"
          >
            <button
              type="button"
              className={role === "estate_owner" ? "selected" : ""}
              aria-pressed={role === "estate_owner"}
              onClick={() => handleRoleChange("estate_owner")}
              disabled={loading}
            >
              Estate Owner
            </button>

            <button
              type="button"
              className={role === "labour" ? "selected" : ""}
              aria-pressed={role === "labour"}
              onClick={() => handleRoleChange("labour")}
              disabled={loading}
            >
              Labour
            </button>

            <button
              type="button"
              className={role === "buyer" ? "selected" : ""}
              aria-pressed={role === "buyer"}
              onClick={() => handleRoleChange("buyer")}
              disabled={loading}
            >
              B2B Buyer
            </button>
          </div>

          {error && (
            <div className="register-alert error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="register-alert success" role="status">
              {success}
            </div>
          )}

          <form className="register-form" onSubmit={handleSubmit}>
            {role === "buyer" && (
              <div className="register-field">
                <label htmlFor="company_name">
                  Company Name *
                </label>

                <input
                  id="company_name"
                  name="company_name"
                  value={form.company_name}
                  onChange={updateField}
                  placeholder="Enter company name"
                  autoComplete="organization"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="register-field">
              <label htmlFor="full_name">
                {role === "buyer"
                  ? "Contact Person *"
                  : "Full Name *"}
              </label>

              <input
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={updateField}
                placeholder="Enter your full name"
                autoComplete="name"
                required
                disabled={loading}
              />
            </div>

            <div className="register-field">
              <label htmlFor="username">Username *</label>

              <input
                id="username"
                name="username"
                value={form.username}
                onChange={updateField}
                placeholder="Choose a username"
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>

            <div className="register-field">
              <label htmlFor="email">Email Address *</label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="register-field">
              <label htmlFor="phone_number">
                Phone Number *
              </label>

              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={form.phone_number}
                onChange={updateField}
                placeholder="Enter phone number"
                autoComplete="tel"
                required
                disabled={loading}
              />
            </div>

            {role === "buyer" && (
              <div className="register-field">
                <label htmlFor="gst_number">GST Number</label>

                <input
                  id="gst_number"
                  name="gst_number"
                  value={form.gst_number}
                  onChange={updateField}
                  placeholder="Enter GST number if applicable"
                  disabled={loading}
                />
              </div>
            )}

            {role === "labour" && (
              <div className="register-field">
                <label htmlFor="daily_wage">
                  Daily Wage (₹)
                </label>

                <input
                  id="daily_wage"
                  name="daily_wage"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.daily_wage}
                  onChange={updateField}
                  placeholder="Enter daily wage"
                  disabled={loading}
                />
              </div>
            )}

            <div className="register-field">
              <label htmlFor="address">Address</label>

              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={updateField}
                placeholder="Enter your address"
                rows={2}
                disabled={loading}
              />
            </div>

            <div className="register-field">
              <label htmlFor="password">Password *</label>

              <div className="register-password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={updateField}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="register-show-password"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="confirm_password">
                Confirm Password *
              </label>

              <div className="register-password-wrapper">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  value={form.confirm_password}
                  onChange={updateField}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="register-show-password"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="register-login-link">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>

          <p className="register-terms">
            Your information will be handled according to your
            platform's privacy and security policies.
          </p>
        </div>
      </section>
    </main>
  );
}
