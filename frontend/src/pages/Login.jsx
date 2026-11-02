import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  UserRound,
  LockKeyhole,
  ArrowRight,
  Sprout,
  ShoppingBasket,
  Users,
  ShieldCheck,
} from "lucide-react";

import API from "../api/client";
import EstateCarousel from "../components/EstateCarousel";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getErrorMessage = (data) => {
    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (Array.isArray(data?.non_field_errors)) {
      return data.non_field_errors.join(" ");
    }

    if (Array.isArray(data?.username)) {
      return data.username.join(" ");
    }

    if (Array.isArray(data?.password)) {
      return data.password.join(" ");
    }

    return "Invalid username or password. Please try again.";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Authenticate with Django JWT.
      const response = await API.post("token/", {
        username: username.trim(),
        password,
      });

      const accessToken = response.data?.access;
      const refreshToken = response.data?.refresh;

      if (!accessToken) {
        throw new Error(
          "Login failed. The server did not return an access token."
        );
      }

      // Step 2: Save tokens and configure API authorization.
      localStorage.setItem("access_token", accessToken);

      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      } else {
        localStorage.removeItem("refresh_token");
      }

      API.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      // Step 3: Load the authenticated user's role.
      const userResponse = await API.get("user-role/");
      const userData = userResponse.data;

      const rawRole =
        userData?.role ||
        userData?.user_role ||
        userData?.user_type ||
        userData?.user?.role ||
        "";

      const normalizedRole = String(rawRole)
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

      if (!normalizedRole) {
        throw new Error(
          "Your account role could not be identified. Please contact the administrator."
        );
      }

      // Step 4: Save user information.
      localStorage.setItem("user_role", normalizedRole);
      localStorage.setItem("user", JSON.stringify(userData));

      // Step 5: Open the dashboard.
      navigate("/dashboard", { replace: true });
    } catch (err) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user");

      delete API.defaults.headers.common.Authorization;

      if (err.response) {
        setError(getErrorMessage(err.response.data));
      } else {
        setError(
          err.message ||
            "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-single-page">
      <EstateCarousel />

      <div className="login-split-container">
        {/* =================================
            LOGIN CARD
        ================================= */}

        <section className="login-column-card login-form-column">
          <div className="login-heading">
            <div className="login-heading-icon">
              <UserRound size={22} />
            </div>

            <p className="login-form-eyebrow">WELCOME BACK</p>

            <h1>Sign in to your account</h1>

            <p className="login-heading-description">
              Enter your username and password to continue.
            </p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <span className="login-error-mark">!</span>
              <p>{error}</p>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Username */}

            <div className="login-field">
              <label htmlFor="login-username">Username</label>

              <div className="login-input-wrap">
                <UserRound size={18} aria-hidden="true" />

                <input
                  id="login-username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}

            <div className="login-field">
              <label htmlFor="login-password">Password</label>

              <div className="login-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showPassword}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}

            <button
              type="submit"
              className="login-submit-button"
              disabled={loading}
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>

              {loading ? (
                <span className="login-spinner" aria-hidden="true" />
              ) : (
                <span className="login-submit-arrow">
                  <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          <div className="login-security-note">
            <ShieldCheck size={17} />
            <span>Your account is protected by secure sign-in.</span>
          </div>

          <div className="login-signup-prompt">
            <span>New user?</span>
            <Link to="/signup" className="login-signup-link">
              Sign up <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>

      <footer className="login-feature-strip" aria-label="Platform features">
        <div className="login-feature">
          <Sprout size={22} aria-hidden="true" />
          <span>Efficient Estate<br />Management</span>
        </div>
        <div className="login-feature">
          <Users size={22} aria-hidden="true" />
          <span>Empowered<br />Workforce</span>
        </div>
        <div className="login-feature">
          <ShoppingBasket size={22} aria-hidden="true" />
          <span>Smart Inventory<br />&amp; Orders</span>
        </div>
        <div className="login-feature">
          <ShieldCheck size={22} aria-hidden="true" />
          <span>Secure &amp; Reliable<br />Platform</span>
        </div>
      </footer>
    </section>
  );
}