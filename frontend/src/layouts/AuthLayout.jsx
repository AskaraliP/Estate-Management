import { Link, Outlet, useLocation } from "react-router-dom";
import { Leaf } from "lucide-react";
import "../styles/AuthLayout.css";

export default function AuthLayout() {
  const isLoginPage = useLocation().pathname === "/login";

  return (
    <div className={`auth-layout${isLoginPage ? " auth-layout-hero" : ""}`}>
      {isLoginPage && (
        <header className="auth-top-brand">
          <Link to="/login" className="auth-brand-link">
            <span className="auth-brand-icon">
              <Leaf size={20} />
            </span>

            <span className="auth-brand-titles">
              <strong>Rubber Estate</strong>
              <small>MANAGEMENT SYSTEM</small>
            </span>
          </Link>

          <p className="auth-brand-tagline">
            <Leaf size={15} aria-hidden="true" />
            <span>Better Estates</span>
            <span aria-hidden="true">·</span>
            <span>Stronger Communities</span>
            <span aria-hidden="true">·</span>
            <span>Sustainable Future</span>
          </p>
        </header>
      )}

      <main className="auth-main-content">
        <Outlet />
      </main>
    </div>
  );
}