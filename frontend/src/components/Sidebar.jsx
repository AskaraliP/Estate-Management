
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardCheck,
  Leaf,
  Package,
  ShoppingCart,
  FileText,
  Wallet,
  Receipt,
  UserRound,
  UserCog,
  Settings,
  LogOut,
  X,
  TreePine,
  CreditCard,
} from "lucide-react";

import "../styles/Sidebar.css";

const menuByRole = {
  admin: [
    { label: "Overview", path: "/dashboard", icon: LayoutDashboard, end: true },
    { label: "Estates", path: "/dashboard/estates", icon: Building2 },
    { label: "Estate Owners", path: "/dashboard/estate-owners", icon: UserCog },
    { label: "Labour", path: "/dashboard/labour", icon: Users },
    { label: "Buyers", path: "/dashboard/buyers", icon: Users },
    { label: "Attendance", path: "/dashboard/attendance", icon: ClipboardCheck },
    { label: "Harvest", path: "/dashboard/harvest", icon: Leaf },
    { label: "Inventory", path: "/dashboard/inventory", icon: Package },
    { label: "B2B Orders", path: "/dashboard/orders", icon: ShoppingCart },
    { label: "Invoices", path: "/dashboard/invoices", icon: FileText },
    { label: "Payments", path: "/dashboard/payments", icon: CreditCard },
    { label: "Payroll", path: "/dashboard/payroll", icon: Wallet },
    { label: "Expenses", path: "/dashboard/expenses", icon: Receipt },
  ],

  estate_owner: [
    { label: "Overview", path: "/dashboard", icon: LayoutDashboard, end: true },
    { label: "My Estates", path: "/dashboard/estates", icon: Building2 },
    { label: "Labour", path: "/dashboard/labour", icon: Users },
    { label: "Attendance", path: "/dashboard/attendance", icon: ClipboardCheck },
    { label: "Harvest", path: "/dashboard/harvest", icon: Leaf },
    { label: "Inventory", path: "/dashboard/inventory", icon: Package },
    { label: "B2B Orders", path: "/dashboard/orders", icon: ShoppingCart },
    { label: "Payroll", path: "/dashboard/payroll", icon: Wallet },
    { label: "Expenses", path: "/dashboard/expenses", icon: Receipt },
  ],

  labour: [
    { label: "My Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
    { label: "Find Estate", path: "/dashboard/estates", icon: Building2 },
    { label: "My Attendance", path: "/dashboard/attendance", icon: ClipboardCheck },
    { label: "My Harvest", path: "/dashboard/harvest", icon: Leaf },
    { label: "My Wages", path: "/dashboard/payroll", icon: Wallet },
  ],

  buyer: [
    { label: "Overview", path: "/dashboard", icon: LayoutDashboard, end: true },
    { label: "Live Stock", path: "/dashboard/inventory", icon: Package },
    { label: "My Orders", path: "/dashboard/orders", icon: ShoppingCart },
    { label: "Invoices", path: "/dashboard/invoices", icon: FileText },
    { label: "Payments", path: "/dashboard/payments", icon: CreditCard },
  ],
};

const roleLabels = {
  admin: "Administrator",
  estate_owner: "Estate Owner",
  labour: "Labour",
  buyer: "B2B Buyer",
};

function normalizeRole(value) {
  return String(value || "labour")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function getStoredRole() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return normalizeRole(
      localStorage.getItem("user_role") ||
        user.role ||
        user.user_role
    );
  } catch {
    return normalizeRole(localStorage.getItem("user_role"));
  }
}

function getDisplayName() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
      user.full_name ||
      user.company_name ||
      user.username ||
      "User"
    );
  } catch {
    return "User";
  }
}

export default function Sidebar({
  isOpen = false,
  onNavigate,
}) {
  const navigate = useNavigate();

  const role = getStoredRole();
  const menu = menuByRole[role] || menuByRole.labour;
  const roleLabel = roleLabels[role] || "User";
  const displayName = getDisplayName();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`app-sidebar ${
        isOpen ? "app-sidebar-open" : ""
      }`}
    >
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <TreePine size={25} />
        </div>

        <div className="sidebar-brand-text">
          <h2>Rubber Estate</h2>
          <span>Management System</span>
        </div>

        <button
          type="button"
          className="sidebar-mobile-close"
          onClick={onNavigate}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          <UserRound size={22} />
        </div>

        <div className="sidebar-profile-info">
          <strong title={displayName}>{displayName}</strong>
          <span>{roleLabel}</span>
        </div>

        <Settings
          className="sidebar-profile-settings"
          size={17}
        />
      </div>

      <nav
        className="sidebar-navigation"
        aria-label="Main navigation"
      >
        <p className="sidebar-section-label">WORKSPACE</p>

        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end || false}
              onClick={onNavigate}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive ? "sidebar-link-active" : ""
                }`
              }
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-bottom-note">
          <Leaf size={17} />
          <span>Growing a better future</span>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

        <div className="sidebar-version">
          Rubber Estate Management
        </div>
      </div>
    </aside>
  );
}
