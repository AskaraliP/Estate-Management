import { Outlet } from "react-router-dom";
import "../styles/AuthLayout.css";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <main className="auth-main-content">
        <Outlet />
      </main>
    </div>
  );
}