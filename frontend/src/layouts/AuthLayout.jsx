import { Link, Outlet, useLocation } from "react-router-dom";
import "../styles/AuthLayout.css";

export default function AuthLayout() {
  const isLoginPage = useLocation().pathname === "/login";

  return (
    <div className={`auth-layout${isLoginPage ? " auth-layout-hero" : ""}`}>
      {isLoginPage && (
        <header className="auth-top-brand">
          <Link to="/login" className="auth-brand-link">
            <span className="auth-brand-titles">
              <strong>Rubber Estate</strong>
              <small>MANAGEMENT SYSTEM</small>
            </span>
          </Link>
          <p className="auth-brand-tagline">
            <span>Tools for managing rubber estates</span>
          </p>
        </header>
      )}

      <main className="auth-main-content">
        <Outlet />
      </main>
    </div>
  );
}