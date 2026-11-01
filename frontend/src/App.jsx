import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./components/DashboardLayout";

// Authentication pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import SignupOptions from "./pages/SignupOptions";

// Dashboard pages
import Overview from "./pages/Overview";
import EstateOwner from "./pages/EstateOwner";
import Estates from "./pages/Estates";
import Buyer from "./pages/Buyer";
import Labour from "./pages/Labour";
import Attendance from "./pages/Attendance";
import Harvest from "./pages/Harvest";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Payroll from "./pages/Payroll";
import Expenses from "./pages/Expenses";

// Get the logged-in user's role
function getRole() {
  try {
    const savedRole = localStorage.getItem("user_role");
    const savedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    return String(
      savedRole || savedUser.role || savedUser.user_role || ""
    )
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
  } catch {
    return "";
  }
}

// Check whether the user is logged in
function isAuthenticated() {
  return Boolean(localStorage.getItem("access_token"));
}

// Protect dashboard routes
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Prevent logged-in users from opening login/register pages
function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Select the default dashboard page based on role
function DashboardHome() {
  const role = getRole();

  if (role === "estate_owner") {
    return <EstateOwner />;
  }

  if (role === "labour") {
    return <Labour />;
  }

  return <Overview />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Default page */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* Login and registration */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupOptions />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/register/:type"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
      </Route>

      {/* Protected dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />

        <Route path="overview" element={<Overview />} />

        {/* Estate management */}
        <Route path="estates" element={<Estates />} />
        <Route path="estate-owners" element={<EstateOwner />} />

        {/* Labour management */}
        <Route path="labour" element={<Labour />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="harvest" element={<Harvest />} />

        {/* Stock and B2B transactions */}
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<Orders />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="payments" element={<Payments />} />

        {/* Financial management */}
        <Route path="payroll" element={<Payroll />} />
        <Route path="expenses" element={<Expenses />} />

        {/* Buyer management */}
        <Route path="buyers" element={<Buyer />} />
      </Route>

      {/* Unknown pages */}
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}









