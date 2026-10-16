import React from "react";
import { Menu, Bell, UserCircle, ChevronDown } from "lucide-react";
import "../styles/Topbar.css";

function Topbar({ onMenuClick, title = "Dashboard" }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("user_role") || user.role || "User";

  const formatRole = (value) =>
    String(value)
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const displayName =
    user.full_name ||
    user.name ||
    user.username ||
    user.company_name ||
    "User";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={23} />
        </button>

        <div className="topbar-heading">
          <h1>{title}</h1>
          <p>Manage your rubber estate operations</p>
        </div>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="topbar-icon-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />
        </button>

        <div className="topbar-divider" />

        <div className="topbar-profile">
          <div className="topbar-avatar">
            <UserCircle size={25} />
          </div>

          <div className="topbar-user-info">
            <span className="topbar-user-name">{displayName}</span>
            <span className="topbar-user-role">{formatRole(role)}</span>
          </div>

          <ChevronDown size={16} className="topbar-chevron" />
        </div>
      </div>
    </header>
  );
}

export default Topbar;