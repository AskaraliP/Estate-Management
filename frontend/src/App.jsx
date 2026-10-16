// import React from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";

// // Layouts
// import AuthLayout from "./layouts/AuthLayout";
// import DashboardLayout from "./components/DashboardLayout";

// // Authentication pages
// import Login from "./pages/Login";
// import Register from "./pages/Register";

// // Dashboard pages
// import Overview from "./pages/Overview";
// import EstateOwner from "./pages/EstateOwner";
// import Labour from "./pages/Labour";
// import Attendance from "./pages/Attendance";
// import Harvest from "./pages/Harvest";
// import Inventory from "./pages/Inventory";
// import Invoices from "./pages/Invoices";
// import Orders from "./pages/Orders";
// import Payments from "./pages/Payments";
// import Payroll from "./pages/Payroll";

// function getRole() {
//   try {
//     const savedRole = localStorage.getItem("user_role");
//     const savedUser = JSON.parse(
//       localStorage.getItem("user") || "{}"
//     );

//     return String(savedRole || savedUser.role || "").toLowerCase();
//   } catch {
//     return "";
//   }
// }

// function isAuthenticated() {
//   return Boolean(localStorage.getItem("access_token"));
// }

// function ProtectedRoute({ children }) {
//   if (!isAuthenticated()) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// }

// function PublicRoute({ children }) {
//   if (isAuthenticated()) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// }

// function DashboardHome() {
//   const role = getRole();

//   if (role === "estate_owner") {
//     return <EstateOwner />;
//   }

//   if (role === "labour") {
//     return <Labour />;
//   }

//   return <Overview />;
// }

// function AppRoutes() {
//   return (
//     <Routes>
//       {/* Default route */}
//       <Route
//         path="/"
//         element={<Navigate to="/dashboard" replace />}
//       />

//       {/* Login and registration */}
//       <Route element={<AuthLayout />}>
//         <Route
//           path="/login"
//           element={
//             <PublicRoute>
//               <Login />
//             </PublicRoute>
//           }
//         />

//         <Route
//           path="/register"
//           element={
//             <PublicRoute>
//               <Register />
//             </PublicRoute>
//           }
//         />
//       </Route>

//       {/* Protected dashboard */}
//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <DashboardLayout />
//           </ProtectedRoute>
//         }
//       >
//         <Route index element={<DashboardHome />} />

//         <Route path="overview" element={<Overview />} />
//         <Route path="estate-owners" element={<EstateOwner />} />
//         <Route path="labour" element={<Labour />} />
//         <Route path="attendance" element={<Attendance />} />
//         <Route path="harvest" element={<Harvest />} />
//         <Route path="inventory" element={<Inventory />} />
//         <Route path="invoices" element={<Invoices />} />
//         <Route path="orders" element={<Orders />} />
//         <Route path="payments" element={<Payments />} />
//         <Route path="payroll" element={<Payroll />} />
//       </Route>

//       {/* Unknown routes */}
//       <Route
//         path="*"
//         element={<Navigate to="/dashboard" replace />}
//       />
//     </Routes>
//   );
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <AppRoutes />
//     </BrowserRouter>
//   );
// }






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



























// import React, { useEffect, useMemo, useState } from 'react';
// import { useAuth } from './context/AuthContext';
// import API from './api/client';
// import {
//   Activity,
//   BarChart3,
//   Bell,
//   Building2,
//   CalendarCheck,
//   ChevronLeft,
//   ChevronRight,
//   ClipboardCheck,
//   DollarSign,
//   FileText,
//   LayoutDashboard,
//   LogOut,
//   Menu,
//   Package,
//   Plus,
//   RefreshCw,
//   Search,
//   Settings,
//   ShoppingCart,
//   Sprout,
//   UserCircle,
//   Users,
//   XCircle,
//   CheckCircle2,
//   MapPin,
//   UserCheck,
//   UserPlus,
//   Wallet,
//   Send,
//   Check,
//   X,
//   CreditCard,
//   ArrowUpRight,
// } from 'lucide-react';
// import './App.css';

// /* ============================================================
//    RAZORPAY
//    The Razorpay secret MUST stay on the Django backend.
// ============================================================ */
// const RAZORPAY_CREATE_ORDER_ENDPOINT = 'razorpay/create-order/';
// const RAZORPAY_VERIFY_ENDPOINT = 'razorpay/verify-payment/';
// const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
// let razorpayScriptPromise = null;

// const loadRazorpayScript = () => {
//   if (typeof window === 'undefined') {
//     return Promise.reject(new Error('Razorpay is only available in a browser.'));
//   }

//   if (window.Razorpay) return Promise.resolve(true);
//   if (razorpayScriptPromise) return razorpayScriptPromise;

//   razorpayScriptPromise = new Promise((resolve, reject) => {
//     const existing = document.querySelector(
//       `script[src="${RAZORPAY_SCRIPT_URL}"]`
//     );

//     if (existing) {
//       existing.addEventListener('load', () => resolve(true), { once: true });
//       existing.addEventListener(
//         'error',
//         () => reject(new Error('Unable to load Razorpay Checkout.')),
//         { once: true }
//       );
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = RAZORPAY_SCRIPT_URL;
//     script.async = true;
//     script.onload = () => resolve(true);
//     script.onerror = () =>
//       reject(new Error('Unable to load Razorpay Checkout.'));
//     document.body.appendChild(script);
//   });

//   return razorpayScriptPromise;
// };

// const getApiErrorMessage = (error, fallback = 'Something went wrong.') => {
//   const data = error?.response?.data;

//   if (typeof data === 'string') return data;
//   if (data?.detail) return data.detail;
//   if (data?.message) return data.message;

//   if (data && typeof data === 'object') {
//     return Object.entries(data)
//       .map(([field, value]) => {
//         const message = Array.isArray(value)
//           ? value.join(' ')
//           : String(value);
//         return `${field}: ${message}`;
//       })
//       .join('\n');
//   }

//   return error?.message || fallback;
// };

// /* ============================================================
//     ROLES
// ============================================================ */
// const roles = {
//   admin: 'Administrator',
//   estate_owner: 'Estate Owner',
//   supervisor: 'Supervisor',
//   labour: 'Labour',
//   buyer: 'B2B Buyer',
// };

// const roleIcon = {
//   admin: Settings,
//   estate_owner: Building2,
//   supervisor: ClipboardCheck,
//   labour: Users,
//   buyer: ShoppingCart,
// };

// const today = () => new Date().toISOString().slice(0, 10);

// /* ============================================================
//     MAIN APP
// ============================================================ */
// export default function App() {
//   const { login, logout, isAuthenticated, user } = useAuth();

//   /* ==========================================================
//       AUTH
//   ========================================================== */
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [authError, setAuthError] = useState('');
//   const [authMode, setAuthMode] = useState('login'); 
//   const [showLogin, setShowLogin] = useState(false);

//   /* ==========================================================
//       DASHBOARD
//   ========================================================== */
//   const [role, setRole] = useState(null);
//   const [tab, setTab] = useState('overview');
//   const [collapsed, setCollapsed] = useState(false);
//   const [mobile, setMobile] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState(null);

//   /* ==========================================================
//       DATABASE DATA
//   ========================================================== */
//   const [estates, setEstates] = useState([]);
//   const [labour, setLabour] = useState([]);
//   const [supervisors, setSupervisors] = useState([]);
//   const [estateOwners, setEstateOwners] = useState([]);
//   const [inventory, setInventory] = useState([]);
//   const [tapping, setTapping] = useState([]);
//   const [attendance, setAttendance] = useState([]);
//   const [buyers, setBuyers] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [invoices, setInvoices] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [labourRequests, setLabourRequests] = useState([]);
//   const [supervisorRequests, setSupervisorRequests] = useState([]);
//   const [expenses, setExpenses] = useState([]);

//   /* ==========================================================
//       UI STATE
//   ========================================================== */
//   const [search, setSearch] = useState('');
//   const [estateOpen, setEstateOpen] = useState(false);
//   const [labourOpen, setLabourOpen] = useState(false);
//   const [supervisorOpen, setSupervisorOpen] = useState(false);
//   const [ownerOpen, setOwnerOpen] = useState(false);
//   const [tapOpen, setTapOpen] = useState(false);
//   const [attOpen, setAttOpen] = useState(false);
//   const [orderOpen, setOrderOpen] = useState(false);
//   const [paymentOpen, setPaymentOpen] = useState(false);
//   const [expenseOpen, setExpenseOpen] = useState(false);

//   /* ==========================================================
//       FORMS
//   ========================================================== */
//   const [estateForm, setEstateForm] = useState({
//     name: '',
//     location: '',
//     total_area: '',
//     description: '',
//     max_labour: 20,
//     max_supervisors: 2,
//     is_active: true,
//   });

//   const [labourForm, setLabourForm] = useState({
//     username: '',
//     password: '',
//     full_name: '',
//     phone: '',
//     address: '',
//     daily_wage: '',
//     account_holder_name: '',
//     bank_name: '',
//     account_number: '',
//     ifsc_code: '',
//     upi_id: '',
//   });

//   const [supervisorForm, setSupervisorForm] = useState({
//     username: '',
//     password: '',
//     full_name: '',
//     phone: '',
//   });

//   const [ownerForm, setOwnerForm] = useState({
//     username: '',
//     password: '',
//     full_name: '',
//     phone: '',
//     address: '',
//   });

//   const [tapForm, setTapForm] = useState({
//     estate: '',
//     labour: '',
//     category: 'LATEX',
//     quantity: '',
//     unit: 'LITRE',
//     assigned_block: '',
//     remarks: '',
//     date: today(),
//   });

//   const [attForm, setAttForm] = useState({
//     labour: '',
//     date: today(),
//     status: 'PRESENT',
//     assigned_block: '',
//     remarks: '',
//   });

//   const [orderForm, setOrderForm] = useState({
//     estate: '',
//     category: 'LATEX',
//     quantity: '',
//   });
// const [paymentForm, setPaymentForm] = useState({
//   invoice: '',
//   amount: '',
//   payment_method: 'RAZORPAY',
//   transaction_id: '',
//   remarks: '',
// });
//   const [razorpayProcessing, setRazorpayProcessing] = useState(false);
//   const [expenseSaving, setExpenseSaving] = useState(false);

//   const [expenseForm, setExpenseForm] = useState({
//     estate: '',
//     category: '',
//     amount: '',
//     description: '',
//     expense_date: today(),
//   });

//   const [requestMessage, setRequestMessage] = useState('');

//   const [reg, setReg] = useState({
//     username: '',
//     password: '',
//     full_name: '',
//     phone: '',
//     address: '',
//     company_name: '',
//     email: '',
//     gst_number: '',
//   });
//   const [regStatus, setRegStatus] = useState('');

//   /* ==========================================================
//       TOAST
//   ========================================================== */
//   const notify = (type, msg) => {
//     setToast({ type, msg });
//     clearTimeout(window.__toast);
//     window.__toast = setTimeout(() => {
//       setToast(null);
//     }, 3500);
//   };

//   /* ==========================================================
//       GET USER ROLE
//   ========================================================== */
//   useEffect(() => {
//     if (!isAuthenticated) {
//       setRole(null);
//       return;
//     }
//     API.get('user-role/')
//       .then((res) => {
//         setRole(res.data.role || null);
//       })
//       .catch(() => {
//         setRole(null);
//       });
//   }, [isAuthenticated]);

//   const isAdmin = role === 'admin';
//   const isOwner = role === 'estate_owner';
//   const isSupervisor = role === 'supervisor';
//   const isBuyer = role === 'buyer';
//   const isLabour = role === 'labour';

//   /* ==========================================================
//       ROLE BASED TABS
//   ========================================================== */
//   const tabs = isAdmin
//     ? [
//         ['overview', 'Dashboard', LayoutDashboard],
//         ['estates', 'Estates', Building2],
//         ['estate-owners', 'Estate Owners', UserPlus],
//         ['buyers', 'Buyers', UserCircle],
//         ['labour', 'Labour', Users],
//         ['supervisors', 'Supervisors', ClipboardCheck],
//         ['tapping', 'Tapping & Production', Sprout],
//         ['inventory', 'Inventory', Package],
//         ['payroll', 'Payroll & Payments', DollarSign],
//         ['orders', 'B2B Orders', ShoppingCart],
//         ['invoices', 'Invoices', FileText],
//         ['expenses', 'Expenses', Wallet],
//       ]
//     : isOwner
//     ? [
//         ['overview', 'Dashboard', LayoutDashboard],
//         ['estates', 'My Estates', Building2],
//         ['labour', 'Labour', Users],
//         ['supervisors', 'Supervisors', ClipboardCheck],
//         ['tapping', 'Production', Sprout],
//         ['inventory', 'Inventory', Package],
//         ['payroll', 'Payroll', DollarSign],
//         ['payments', 'Payments', CreditCard],
//         ['orders', 'Pending B2B Orders', ShoppingCart],
//         ['expenses', 'Expenses', Wallet],
//       ]
//     : isSupervisor
//     ? [
//         ['overview', 'Dashboard', LayoutDashboard],
//         ['estates', 'Estate', Building2],
//         ['labour', 'Worker Attendance', Users],
//         ['tapping', 'Yield Verification', ClipboardCheck],
//         ['inventory', 'Production Stock', Package],
//         ['orders', 'Orders', ShoppingCart],
//       ]
//     : isBuyer
//     ? [
//         ['overview', 'Dashboard', LayoutDashboard],
//         ['inventory', 'Live Stock', Package],
//         ['orders', 'My Orders', ShoppingCart],
//         ['invoices', 'Invoices & Payments', FileText],
//       ]
//     : [
//         ['overview', 'My Dashboard', LayoutDashboard],
//         ['estates', 'Find Estate', Building2],
//         ['labour', 'My Attendance', CalendarCheck],
//         ['tapping', 'My Harvest', Sprout],
//         ['payroll', 'My Wages', DollarSign],
//       ];

//   useEffect(() => {
//     if (!tabs.some((x) => x[0] === tab)) {
//       setTab('overview');
//     }
//   }, [role]);

//   /* ==========================================================
//       LOAD DATA
//   ========================================================== */
//   const load = async () => {
//     if (!isAuthenticated) return;
//     setLoading(true);
//     try {
//      const requests = [
//   API.get('estates/'),
//   API.get('labour-profiles/'),
//   API.get('inventory/'),
//   API.get('tapping-records/'),
//   API.get('attendance/'),
//   API.get('buyer-profiles/'),
//   API.get('purchase-orders/'),
//   API.get('invoices/'),
//   API.get('payments/'),
//   API.get('labour-estate-requests/'),
//   API.get('supervisor-estate-requests/'),
//   API.get('expenses/'),
// ];
//       if (isAdmin || isOwner) {
//         requests.push(API.get('supervisor-profiles/'));
//       }
//       if (isAdmin) {
//         requests.push(API.get('estate-owner-profiles/'));
//       }
//       const req = await Promise.allSettled(requests);
//       const setData = (result, setter) => {
//         if (result?.status !== 'fulfilled') {
//           setter([]);
//           return;
//         }
//         const data = result.value?.data;
//         if (Array.isArray(data)) {
//           setter(data);
//         } else if (Array.isArray(data?.results)) {
//           setter(data.results);
//         } else {
//           setter([]);
//         }
//       };
//   setData(req[0], setEstates);
// setData(req[1], setLabour);
// setData(req[2], setInventory);
// setData(req[3], setTapping);
// setData(req[4], setAttendance);
// setData(req[5], setBuyers);
// setData(req[6], setOrders);
// setData(req[7], setInvoices);
// setData(req[8], setPayments);
// setData(req[9], setLabourRequests);
// setData(req[10], setSupervisorRequests);
// setData(req[11], setExpenses);
//       if (isAdmin || isOwner) {
//         setData(req[12], setSupervisors);
//       } else {
//         setSupervisors([]);
//       }
//       if (isAdmin) {
//         setData(req[13], setEstateOwners);
//       } else {
//         setEstateOwners([]);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isAuthenticated && role) {
//       load();
//     }
//   }, [isAuthenticated, user?.id, role]);

//   /* ==========================================================
//       DEFAULT ESTATE
//   ========================================================== */
//   useEffect(() => {
//     if (!estates.length) return;
//     const firstEstate = estates[0].id;
//     setEstateDefaults(firstEstate);
//   }, [estates.length]);

//   const setEstateDefaults = (id) => {
//     setTapForm((prev) => ({
//       ...prev,
//       estate: prev.estate || id,
//     }));
//     setOrderForm((prev) => ({
//       ...prev,
//       estate: prev.estate || id,
//     }));
//     setExpenseForm((prev) => ({
//       ...prev,
//       estate: prev.estate || id,
//     }));
//   };

//   /* ==========================================================
//       SUBMIT HELPER
//   ========================================================== */
//   const submit = async (fn, successMessage) => {
//     try {
//       await fn();
//       notify('success', successMessage);
//       await load();
//     } catch (error) {
//       const data = error.response?.data;
//       let message = 'Something went wrong.';
//       if (typeof data === 'string') {
//         message = data;
//       } else if (data?.detail) {
//         message = data.detail;
//       } else if (data && typeof data === 'object') {
//         message = Object.entries(data)
//           .map(([field, value]) => {
//             const text = Array.isArray(value)
//               ? value.join(' ')
//               : String(value);
//             return `${field}: ${text}`;
//           })
//           .join('\n');
//       } else if (error.message) {
//         message = error.message;
//       }
//       notify('error', message);
//       throw error;
//     }
//   };

//   /* ==========================================================
//       LOGIN
//   ========================================================== */
//   const loginSubmit = async (e) => {
//     e.preventDefault();
//     setAuthError('');
//     try {
//       await login(username, password);
//     } catch (error) {
//       setAuthError(
//         error.response?.data?.detail ||
//           'Invalid username or password.'
//       );
//     }
//   };

//   /* ==========================================================
//       SELF REGISTRATION HANDLERS
//   ========================================================== */
//   const handleSelfRegister = async (e, roleType) => {
//     e.preventDefault();
//     setRegStatus('');
//     setAuthError('');

//     let endpoint = '';
//     let payload = {};

//     if (roleType === 'estate_owner') {
//       endpoint = 'register/estate-owner/';
//       payload = {
//         username: reg.username.trim(),
//         password: reg.password,
//         full_name: reg.full_name.trim(),
//         phone: reg.phone.trim(),
//         address: reg.address.trim(),
//       };
//     } else if (roleType === 'supervisor') {
//       endpoint = 'register/supervisor/';
//       payload = {
//         username: reg.username.trim(),
//         password: reg.password,
//         full_name: reg.full_name.trim(),
//         phone: reg.phone.trim(),
//       };
//     } else if (roleType === 'labour') {
//       endpoint = 'register/labour/';
//       payload = {
//         username: reg.username.trim(),
//         password: reg.password,
//         full_name: reg.full_name.trim(),
//         phone: reg.phone.trim(),
//         address: reg.address.trim(),
//         daily_wage: reg.daily_wage ? Number(reg.daily_wage) : 0,
//       };
//     } else if (roleType === 'buyer') {
//       endpoint = 'register/buyer/';
//       payload = {
//         username: reg.username.trim(),
//         password: reg.password,
//         full_name: reg.full_name ? reg.full_name.trim() : reg.company_name.trim(),
//         company_name: reg.company_name.trim(),
//         phone_number: reg.phone.trim(),
//         email: reg.email ? reg.email.trim() : '',
//         address: reg.address ? reg.address.trim() : '',
//         gst_number: reg.gst_number ? reg.gst_number.trim() : '',
//       };
//     } else {
//       setAuthError('Invalid registration role.');
//       return;
//     }

//     if (!payload.username) {
//       setAuthError('Username is required.');
//       return;
//     }
//     if (!payload.password) {
//       setAuthError('Password is required.');
//       return;
//     }

//     try {
//       await API.post(endpoint, payload);
//       setRegStatus('Account created successfully! Redirecting to login...');
//       setReg({
//         username: '',
//         password: '',
//         full_name: '',
//         phone: '',
//         address: '',
//         company_name: '',
//         email: '',
//         gst_number: '',
//         daily_wage: '',
//       });
//       setTimeout(() => {
//         setAuthMode('login');
//         setRegStatus('');
//         setAuthError('');
//       }, 2000);
//     } catch (error) {
//       const errData = error.response?.data;
//       let errMsg = 'Registration failed.';
//       if (typeof errData === 'string') {
//         errMsg = errData;
//       } else if (errData && typeof errData === 'object') {
//         errMsg = Object.entries(errData)
//           .map(([key, value]) => {
//             const message = Array.isArray(value)
//               ? value.join(' ')
//               : String(value);
//             return `${key}: ${message}`;
//           })
//           .join('\n');
//       } else if (error.message) {
//         errMsg = error.message;
//       }
//       setAuthError(errMsg);
//     }
//   };

//   /* ==========================================================
//       ADMIN CREATE ESTATE OWNER
//   ========================================================== */
//   const createEstateOwner = async (e) => {
//     e.preventDefault();
//     if (
//       !ownerForm.username.trim() ||
//       !ownerForm.password.trim() ||
//       !ownerForm.full_name.trim()
//     ) {
//       notify(
//         'error',
//         'Username, password and full name are required.'
//       );
//       return;
//     }
//     try {
//       const response = await API.post(
//         'register/estate-owner/',
//         {
//           username: ownerForm.username.trim(),
//           password: ownerForm.password,
//           full_name: ownerForm.full_name.trim(),
//           phone: ownerForm.phone.trim(),
//           address: ownerForm.address.trim(),
//         }
//       );
//       notify(
//         'success',
//         `Estate Owner ${response.data.username} registered successfully.`
//       );
//       setOwnerOpen(false);
//       setOwnerForm({
//         username: '',
//         password: '',
//         full_name: '',
//         phone: '',
//         address: '',
//       });
//       await load();
//     } catch {
//       notify('error', 'Estate Owner registration failed.');
//     }
//   };

//   /* ==========================================================
//       CREATE ESTATE
//   ========================================================== */
//   const createEstate = async (e) => {
//     e.preventDefault();
//     try {
//       await submit(
//         () =>
//           API.post('estates/', {
//             name: estateForm.name,
//             location: estateForm.location,
//             total_area: Number(estateForm.total_area),
//             description: estateForm.description,
//             max_labour: Number(estateForm.max_labour),
//             max_supervisors: Number(estateForm.max_supervisors),
//             is_active: estateForm.is_active,
//           }),
//         'Estate registered successfully.'
//       );
//       setEstateOpen(false);
//       setEstateForm({
//         name: '',
//         location: '',
//         total_area: '',
//         description: '',
//         max_labour: 20,
//         max_supervisors: 2,
//         is_active: true,
//       });
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       CREATE LABOUR PROFILE
//   ========================================================== */
//   const createLabour = async (e) => {
//     e.preventDefault();
//     try {
//       await submit(
//         () =>
//           API.post('register/labour/', {
//             username: labourForm.username,
//             password: labourForm.password,
//             full_name: labourForm.full_name,
//             phone: labourForm.phone,
//             address: labourForm.address,
//             daily_wage: labourForm.daily_wage
//               ? Number(labourForm.daily_wage)
//               : 0,
//             account_holder_name: labourForm.account_holder_name,
//             bank_name: labourForm.bank_name,
//             account_number: labourForm.account_number,
//             ifsc_code: labourForm.ifsc_code,
//             upi_id: labourForm.upi_id,
//           }),
//         'Labour registered successfully.'
//       );
//       setLabourForm({
//         username: '',
//         password: '',
//         full_name: '',
//         phone: '',
//         address: '',
//         daily_wage: '',
//         account_holder_name: '',
//         bank_name: '',
//         account_number: '',
//         ifsc_code: '',
//         upi_id: '',
//       });
//       setLabourOpen(false);
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       CREATE ATTENDANCE
//   ========================================================== */
//   const createAtt = async (e) => {
//     e.preventDefault();
//     if (!attForm.labour) {
//       notify('error', 'Please select a labour.');
//       return;
//     }
//     try {
//       await submit(
//         () =>
//           API.post('attendance/', {
//             labour: Number(attForm.labour),
//             date: attForm.date,
//             status: attForm.status,
//             assigned_block: attForm.assigned_block || '',
//             remarks: attForm.remarks || '',
//           }),
//         'Attendance saved successfully.'
//       );
//       setAttOpen(false);
//       setAttForm({
//         labour: '',
//         date: today(),
//         status: 'PRESENT',
//         assigned_block: '',
//         remarks: '',
//       });
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       CREATE SUPERVISOR
//   ========================================================== */
//   const createSupervisor = async (e) => {
//     e.preventDefault();
//     if (
//       !supervisorForm.username.trim() ||
//       !supervisorForm.password.trim() ||
//       !supervisorForm.full_name.trim()
//     ) {
//       notify(
//         'error',
//         'Please fill all required supervisor fields.'
//       );
//       return;
//     }
//     try {
//       const response = await API.post(
//         'register/supervisor/',
//         {
//           username: supervisorForm.username.trim(),
//           password: supervisorForm.password,
//           full_name: supervisorForm.full_name.trim(),
//           phone: supervisorForm.phone.trim(),
//         }
//       );
//       notify(
//         'success',
//         `Supervisor ${response.data.username} created successfully.`
//       );
//       setSupervisorOpen(false);
//       setSupervisorForm({
//         username: '',
//         password: '',
//         full_name: '',
//         phone: '',
//       });
//       await load();
//     } catch {
//       notify('error', 'Supervisor creation failed.');
//     }
//   };

//   /* ==========================================================
//       CREATE TAPPING RECORD
//   ========================================================== */
// const createTap = async (e) => {
//   e.preventDefault();
  
//   if (!isLabour && !tapForm.labour) {
//     notify("error", "Please select labour before saving.");
//     return;
//   }
//   if (!isLabour && !tapForm.estate) {
//     notify('error', 'Please select an estate before saving.');
//     return;
//   }

//   const payload = {
//     date: tapForm.date,
//     category: tapForm.category,
//     quantity: tapForm.quantity ? Number(tapForm.quantity) : 0,
//     unit: tapForm.unit,
//     assigned_block: tapForm.assigned_block || '',
//     remarks: tapForm.remarks || '',
//   };

//   // Only attach estate and labour if the user is NOT a labour worker 
//   // (Labour automatically uses their own assigned estate & profile on the backend)
//   if (!isLabour) {
//     payload.labour = tapForm.labour;
//     payload.estate = tapForm.estate;
//   }

//   try {
//     await submit(
//       () => API.post('tapping-records/', payload),
//       'Tapping record created successfully.'
//     );
//     setTapOpen(false);
//     // Reset quantity and remarks
//     setTapForm((prev) => ({ ...prev, quantity: '', remarks: '', assigned_block: '' }));
//   } catch {
//     // handled by submit
//   }
// };
//   /* =========================================================
//      VERIFY YIELD / CREDIT TO INVENTORY
//   ========================================================== */
//   const verifyTap = async (id) => {
//     if (!id) {
//       notify("error", "Invalid tapping record.");
//       return;
//     }

//     try {
//       await API.post(
//         `tapping-records/${id}/credit-to-inventory/`
//       );

//       notify(
//         "success",
//         "Yield verified and added to inventory successfully."
//       );

//       await load();
//     } catch (error) {
//       notify(
//         "error",
//         error?.response?.data?.detail ||
//           "Failed to verify yield."
//       );
//     }
//   };

//   /* ==========================================================
//       CREATE ORDER
//   ========================================================== */
//   const createOrder = async (e) => {
//     e.preventDefault();

//     if (!orderForm.estate) {
//       notify("error", "Please select an estate.");
//       return;
//     }

//     if (!orderForm.quantity || Number(orderForm.quantity) <= 0) {
//       notify("error", "Please enter a valid quantity.");
//       return;
//     }

//     try {
//       await submit(
//         () =>
//           API.post("purchase-orders/", {
//             estate: Number(orderForm.estate),
//             category: orderForm.category,
//             quantity: Number(orderForm.quantity),
//           }),
//         "Purchase order placed successfully."
//       );

//       setOrderOpen(false);

//       setOrderForm({
//         estate: estates[0]?.id || "",
//         category: "LATEX",
//         quantity: "",
//       });
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       APPROVE / REJECT PURCHASE ORDER
//   ========================================================== */
//   const createRazorpayOrder = async (invoiceId) => {
//     if (razorpayProcessing) return;
//     const numericInvoiceId = Number(invoiceId);
//     if (!Number.isInteger(numericInvoiceId) || numericInvoiceId <= 0) {
//       notify('error', 'Please select a valid invoice.');
//       return;
//     }
//     const invoice = invoices.find((item) => Number(item.id) === numericInvoiceId);
//     if (!invoice) {
//       notify('error', 'Invoice details could not be found. Please refresh the page.');
//       return;
//     }
//     if (String(invoice.payment_status || '').toUpperCase() === 'PAID') {
//       notify('error', 'This invoice is already fully paid.');
//       return;
//     }
//     setRazorpayProcessing(true);
//     try {
//       const orderResponse = await API.post(RAZORPAY_CREATE_ORDER_ENDPOINT, { invoice: numericInvoiceId });
//       const orderData = orderResponse?.data || {};
//       const keyId = orderData.razorpay_key_id || orderData.key_id || import.meta.env?.VITE_RAZORPAY_KEY_ID;
//       const razorpayOrderId = orderData.razorpay_order_id || orderData.order_id;
//       const orderAmount = Number(orderData.amount_paise);
//       const serverAmount = Number(orderData.amount);
//       const currency = orderData.currency || 'INR';
//       if (!Number.isFinite(orderAmount) || orderAmount <= 0) throw new Error('Invalid Razorpay order amount returned by the backend.');
//       if (!keyId) throw new Error('Razorpay public key was not returned by the backend.');
//       if (!razorpayOrderId) throw new Error('Razorpay order ID was not returned by the backend.');
//       await loadRazorpayScript();
//       if (!window.Razorpay) throw new Error('Razorpay Checkout could not be initialized.');
//       if (Number.isFinite(serverAmount) && serverAmount > 0) {
//         setPaymentForm((current) => ({ ...current, invoice: String(numericInvoiceId), amount: String(serverAmount), payment_method: 'RAZORPAY' }));
//       }
//       const buyerName = orderData.buyer_name || orderData?.prefill?.name || invoice.buyer_name || user?.full_name || user?.username || '';
//       const buyerEmail = orderData.buyer_email || orderData?.prefill?.email || invoice.buyer_email || user?.email || '';
//       const buyerContact = orderData.buyer_phone || orderData?.prefill?.contact || invoice.buyer_phone || user?.phone || '';
//       const checkout = new window.Razorpay({
//         key: keyId,
//         amount: orderAmount,
//         currency,
//         order_id: razorpayOrderId,
//         name: orderData.name || 'Rubber Estate Management System',
//         description: orderData.description || `Payment for invoice ${invoice.invoice_number || `#${numericInvoiceId}`}`,
//         prefill: { name: buyerName, email: buyerEmail, contact: buyerContact },
//         notes: { invoice_id: String(numericInvoiceId), invoice_number: String(invoice.invoice_number || '') },
//         theme: { color: '#176b45' },
//         handler: async (response) => {
//           if (!response?.razorpay_payment_id || !response?.razorpay_order_id || !response?.razorpay_signature) {
//             setRazorpayProcessing(false);
//             notify('error', 'Razorpay returned an incomplete payment response.');
//             return;
//           }
//           try {
//             await API.post(RAZORPAY_VERIFY_ENDPOINT, {
//               invoice: numericInvoiceId,
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//             });
//             setPaymentOpen(false);
//             setPaymentForm({ invoice: '', amount: '', payment_method: 'RAZORPAY', transaction_id: '', remarks: '' });
//             notify('success', 'Payment verified successfully. Invoice status updated.');
//             await load();
//           } catch (verifyError) {
//             notify('error', getApiErrorMessage(verifyError, 'Payment was received, but server verification failed. Please contact support.'));
//           } finally {
//             setRazorpayProcessing(false);
//           }
//         },
//         modal: { ondismiss: () => { setRazorpayProcessing(false); notify('error', 'Payment window closed. No payment was recorded.'); } },
//       });
//       checkout.on('payment.failed', (response) => {
//         setRazorpayProcessing(false);
//         notify('error', response?.error?.description || response?.error?.reason || 'Razorpay payment failed.');
//       });
//       checkout.open();
//     } catch (error) {
//       setRazorpayProcessing(false);
//       notify('error', getApiErrorMessage(error, 'Unable to create Razorpay order.'));
//     }
//   };
//   /* Keep the existing payment form working. */
//   const createPayment = async (e) => {
//     e?.preventDefault();
//     await createRazorpayOrder(paymentForm.invoice);
//   };

//   const approveOrder = async (id) => {
//     try {
//       await submit(
//         () => API.post(`purchase-orders/${id}/approve/`),
//         'Purchase order approved successfully.'
//       );
//     } catch {
//       // handled by submit
//     }
//   };

//   const rejectOrder = async (id) => {
//     try {
//       await submit(
//         () => API.post(`purchase-orders/${id}/reject/`),
//         'Purchase order rejected.'
//       );
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       CREATE EXPENSE
//   ========================================================== */
//   const createExpense = async (e) => {
//     e.preventDefault();
//     if (expenseSaving) return;
//     const estateId = Number(expenseForm.estate);
//     const amount = Number(expenseForm.amount);
//     if (!Number.isInteger(estateId) || estateId <= 0) { notify('error', 'Please select an estate.'); return; }
//     if (!expenseForm.category) { notify('error', 'Please select an expense category.'); return; }
//     if (!Number.isFinite(amount) || amount <= 0) { notify('error', 'Enter a valid expense amount.'); return; }
//     if (!expenseForm.expense_date) { notify('error', 'Please select the expense date.'); return; }
//     setExpenseSaving(true);
//     try {
//       await API.post('expenses/', { estate: estateId, category: expenseForm.category, amount: amount.toFixed(2), description: expenseForm.description?.trim() || '', expense_date: expenseForm.expense_date });
//       notify('success', 'Expense recorded successfully.');
//       setExpenseOpen(false);
//       setExpenseForm({ estate: estates[0]?.id || '', category: '', amount: '', description: '', expense_date: today() });
//       await load();
//     } catch (error) {
//       notify('error', getApiErrorMessage(error, 'Unable to save expense.'));
//     } finally {
//       setExpenseSaving(false);
//     }
//   };
//   /* ==========================================================
//       LABOUR REQUEST
//   ========================================================== */
//   const requestEstateAsLabour = async (estateId) => {
//     try {
//       await submit(
//         () =>
//           API.post('labour-estate-requests/', {
//             estate: Number(estateId),
//             message: requestMessage || '',
//           }),
//         'Estate request sent successfully.'
//       );
//       setRequestMessage('');
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       SUPERVISOR REQUEST
//   ========================================================== */
//   const requestEstateAsSupervisor = async (estateId) => {
//     try {
//       await submit(
//         () =>
//           API.post('supervisor-estate-requests/', {
//             estate: Number(estateId),
//             message: requestMessage || '',
//           }),
//         'Estate request sent successfully.'
//       );
//       setRequestMessage('');
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       APPROVE / REJECT LABOUR REQUEST
//   ========================================================== */
//   const approveLabourRequest = async (id) => {
//     try {
//       await submit(
//         () => API.post(`labour-estate-requests/${id}/approve/`),
//         'Labour request approved.'
//       );
//     } catch {
//       // handled
//     }
//   };

//   const rejectLabourRequest = async (id) => {
//     try {
//       await submit(
//         () => API.post(`labour-estate-requests/${id}/reject/`),
//         'Labour request rejected.'
//       );
//     } catch {
//       // handled
//     }
//   };

//   /* ==========================================================
//       APPROVE / REJECT SUPERVISOR REQUEST
//   ========================================================== */
//   const approveSupervisorRequest = async (id) => {
//     try {
//       await submit(
//         () => API.post(`supervisor-estate-requests/${id}/approve/`),
//         'Supervisor request approved.'
//       );
//     } catch {
//       // handled
//     }
//   };

//   const rejectSupervisorRequest = async (id) => {
//     try {
//       await submit(
//         () => API.post(`supervisor-estate-requests/${id}/reject/`),
//         'Supervisor request rejected.'
//       );
//     } catch {
//       // handled
//     }
//   };

//   /* ==========================================================
//       STATISTICS
//   ========================================================== */
//   const stats = useMemo(
//     () => ({
//       estates: estates.length,
//       workers: labour.length,
//       supervisors: supervisors.length,
//       production: tapping.reduce(
//         (sum, item) => sum + Number(item.quantity || 0),
//         0
//       ),
//       stock: inventory.reduce(
//         (sum, item) => sum + Number(item.stock_quantity || 0),
//         0
//       ),
//       orders: orders.length,
//       unpaid: invoices.filter(
//         (item) => item.payment_status !== 'PAID'
//       ).length,
//       present: attendance.filter(
//         (item) => item.status === 'PRESENT'
//       ).length,
//       pendingLabourRequests: labourRequests.filter(
//         (item) => item.status === 'PENDING'
//       ).length,
//       pendingSupervisorRequests: supervisorRequests.filter(
//         (item) => item.status === 'PENDING'
//       ).length,
//       pendingTapping: tapping.filter((item) => !item.is_verified && String(item.status || '').toUpperCase() !== 'VERIFIED').length,
//       pendingOrders: orders.filter((item) => String(item.status || '').toUpperCase() === 'PENDING').length,
//       labourWages: labour.reduce((sum, item) => sum + Number(item.daily_wage || 0), 0),
//       totalExpenses: expenses.reduce(
//         (sum, item) => sum + Number(item.amount || 0),
//         0
//       ),
//       totalPaid: payments
//         .filter((item) => String(item.status || '').toUpperCase() === 'SUCCESS')
//         .reduce((sum, item) => sum + Number(item.amount || 0), 0),
//       pendingPayments: payments.filter(
//         (item) => String(item.status || '').toUpperCase() === 'PENDING'
//       ).length,
//     }),
//     [
//       estates,
//       labour,
//       supervisors,
//       tapping,
//       inventory,
//       orders,
//       invoices,
//       attendance,
//       labourRequests,
//       supervisorRequests,
//       expenses,
//       payments,
//     ]
//   );

//   /* ==========================================================
//       PUBLIC PAGE
//   ========================================================== */
//   if (!isAuthenticated) {
//     return (
//       <Public
//         showLogin={showLogin}
//         setShowLogin={setShowLogin}
//         authMode={authMode}
//         setAuthMode={setAuthMode}
//         username={username}
//         setUsername={setUsername}
//         password={password}
//         setPassword={setPassword}
//         authError={authError}
//         loginSubmit={loginSubmit}
//         reg={reg}
//         setReg={setReg}
//         regStatus={regStatus}
//         handleSelfRegister={handleSelfRegister}
//       />
//     );
//   }

//   /* ==========================================================
//       ROLE LOADING
//   ========================================================== */
//   if (!role) {
//     return (
//       <div className="loading">
//         <Sprout size={30} />
//         <h3>Preparing your workspace</h3>
//         <p>Verifying account and role permissions...</p>
//       </div>
//     );
//   }

//   const RI = roleIcon[role] || UserCircle;

//   /* ==========================================================
//       MAIN DASHBOARD
//   ========================================================== */
//   return (
//     <div className="shell">
//       {/* SIDEBAR */}
//       <aside
//         className={
//           'sidebar ' +
//           (collapsed ? 'collapsed ' : '') +
//           (mobile ? 'mobile' : '')
//         }
//       >
//         <div className="brand">
//           <div className="logo">
//             <Sprout size={23} />
//           </div>
//           {!collapsed && (
//             <div>
//               <b>Rubber Estate</b>
//               <small>Management System</small>
//             </div>
//           )}
//         </div>
//         <div className="role">
//           <div className="role-icon">
//             <RI size={19} />
//           </div>
//           {!collapsed && (
//             <div>
//               <small>CURRENT ROLE</small>
//               <b>{roles[role]}</b>
//               <span>@{user?.username}</span>
//             </div>
//           )}
//         </div>
//         <nav>
//           <label>WORKSPACE</label>
//           {tabs.map(([id, label, Icon]) => (
//             <button
//               className={tab === id ? 'active' : ''}
//               key={id}
//               title={collapsed ? label : ''}
//               onClick={() => {
//                 setTab(id);
//                 setMobile(false);
//               }}
//             >
//               <Icon size={18} />
//               {!collapsed && label}
//             </button>
//           ))}
//         </nav>
//         {!collapsed && (
//           <div className="side-bottom">
//             <div className="online">
//               <Activity size={16} />
//               <span>
//                 <b>System online</b>
//                 <small>Django • MySQL</small>
//               </span>
//             </div>
//             <button onClick={logout}>
//               <LogOut size={17} />
//               Sign out
//             </button>
//           </div>
//         )}
//       </aside>

//       {/* MAIN */}
//       <main className="main">
//         {/* TOP BAR */}
//         <header className="top">
//           <div className="top-left">
//             <button
//               className="icon mobile-only"
//               onClick={() => setMobile(!mobile)}
//             >
//               <Menu size={19} />
//             </button>
//             <button
//               className="icon desktop-only"
//               onClick={() => setCollapsed(!collapsed)}
//             >
//               {collapsed ? (
//                 <ChevronRight size={18} />
//               ) : (
//                 <ChevronLeft size={18} />
//               )}
//             </button>
//             <div>
//               <small>
//                 RUBBER ESTATE / {roles[role].toUpperCase()}
//               </small>
//               <h1>
//                 {tabs.find((x) => x[0] === tab)?.[1]}
//               </h1>
//             </div>
//           </div>
//           <div className="top-actions">
//             <button className="icon" onClick={load}>
//               <RefreshCw
//                 size={17}
//                 className={loading ? 'spin' : ''}
//               />
//             </button>
//             <button className="icon notification">
//               <Bell size={17} />
//               <i />
//             </button>
//             <div className="user">
//               <span>
//                 {(user?.username || 'U')[0].toUpperCase()}
//               </span>
//               <b>{user?.username}</b>
//               <small>{roles[role]}</small>
//             </div>
//             <button
//               className="icon logout"
//               onClick={logout}
//             >
//               <LogOut size={17} />
//             </button>
//           </div>
//         </header>

//         {/* CONTENT */}
//         <section className="content">
//           {tab === 'overview' && (
//             <Dashboard
//               role={role}
//               user={user}
//               stats={stats}
//               estates={estates}
//               inventory={inventory}
//               orders={orders}
//               invoices={invoices}
//               payments={payments}
//               tapping={tapping}
//               expenses={expenses}
//               setTab={setTab}
//             />
//           )}
//           {tab === 'estates' && (
//             <Estates
//               estates={estates}
//               estateOpen={estateOpen}
//               setEstateOpen={setEstateOpen}
//               estateForm={estateForm}
//               setEstateForm={setEstateForm}
//               createEstate={createEstate}
//               isAdmin={isAdmin}
//               isOwner={isOwner}
//               isLabour={isLabour}
//               isSupervisor={isSupervisor}
//               labourRequests={labourRequests}
//               supervisorRequests={supervisorRequests}
//               requestEstateAsLabour={requestEstateAsLabour}
//               requestEstateAsSupervisor={requestEstateAsSupervisor}
//               approveLabourRequest={approveLabourRequest}
//               rejectLabourRequest={rejectLabourRequest}
//               approveSupervisorRequest={approveSupervisorRequest}
//               rejectSupervisorRequest={rejectSupervisorRequest}
//               requestMessage={requestMessage}
//               setRequestMessage={setRequestMessage}
//             />
//           )}
//           {tab === 'estate-owners' && isAdmin && (
//             <EstateOwners
//               estateOwners={estateOwners}
//               ownerOpen={ownerOpen}
//               setOwnerOpen={setOwnerOpen}
//               ownerForm={ownerForm}
//               setOwnerForm={setOwnerForm}
//               createEstateOwner={createEstateOwner}
//             />
//           )}

// {tab === 'buyers' && (isAdmin || isOwner) && (
//   <Buyers buyers={buyers} />
// )}
//           {tab === 'labour' && (
//             <Labours
//               labour={labour}
//               attendance={attendance}
//               search={search}
//               setSearch={setSearch}
//               labourOpen={labourOpen}
//               setLabourOpen={setLabourOpen}
//               labourForm={labourForm}
//               setLabourForm={setLabourForm}
//               createLabour={createLabour}
//               attOpen={attOpen}
//               setAttOpen={setAttOpen}
//               attForm={attForm}
//               setAttForm={setAttForm}
//               createAtt={createAtt}
//               isLabour={isLabour}
//               isAdmin={isAdmin}
//               isOwner={isOwner}
//               isSupervisor={isSupervisor}
//             />
//           )}
//           {tab === 'supervisors' && (
//             <Supervisors
//               supervisors={supervisors}
//               supervisorOpen={supervisorOpen}
//               setSupervisorOpen={setSupervisorOpen}
//               supervisorForm={supervisorForm}
//               setSupervisorForm={setSupervisorForm}
//               createSupervisor={createSupervisor}
//               isAdmin={isAdmin}
//               isOwner={isOwner}
//             />
//           )}
//           {tab === 'tapping' && (
//             <Tapping
//               tapping={tapping}
//               labour={labour}
//               estates={estates}
//               tapOpen={tapOpen}
//               setTapOpen={setTapOpen}
//               tapForm={tapForm}
//               setTapForm={setTapForm}
//               createTap={createTap}
//               verifyTap={verifyTap}
//               isLabour={isLabour}
//               isSupervisor={isSupervisor}
//               isAdmin={isAdmin}
//               isOwner={isOwner}
//               user={user}
//             />
//           )}
//           {tab === 'inventory' && (
//             <Inventory inventory={inventory} />
//           )}
//           {tab === 'payroll' && (
//             <Payroll
//               labour={labour}
//               attendance={attendance}
//               isLabour={isLabour}
//               user={user}
//             />
//           )}
//           {tab === 'payments' && isOwner && (
//             <Payments payments={payments} stats={stats} />
//           )}
//           {tab === 'orders' && (
//             <Orders
//               orders={orders}
//               estates={estates}
//               orderOpen={orderOpen}
//               setOrderOpen={setOrderOpen}
//               orderForm={orderForm}
//               setOrderForm={setOrderForm}
//               createOrder={createOrder}
//               isBuyer={isBuyer}
//               user={user}
//               role={role}
//               approveOrder={approveOrder}
//               rejectOrder={rejectOrder}
//             />
//           )}
//           {tab === 'invoices' && (
//             <Invoices
//               invoices={invoices}
//               payments={payments}
//               isBuyer={isBuyer}
//               paymentOpen={paymentOpen}
//               setPaymentOpen={setPaymentOpen}
//               paymentForm={paymentForm}
//               setPaymentForm={setPaymentForm}
//               createPayment={createPayment}
//               createRazorpayOrder={createRazorpayOrder}
//               razorpayProcessing={razorpayProcessing}
//             />
//           )}
//           {tab === 'expenses' && (
//             <Expenses
//               expenses={expenses}
//               estates={estates}
//               expenseOpen={expenseOpen}
//               setExpenseOpen={setExpenseOpen}
//               expenseForm={expenseForm}
//               setExpenseForm={setExpenseForm}
//               createExpense={createExpense}
//               expenseSaving={expenseSaving}
//             />
//           )}
//         </section>
//       </main>

//       {/* TOAST */}
//       {toast && (
//         <div className={'toast ' + toast.type}>
//           {toast.type === 'success' ? (
//             <CheckCircle2 size={18} />
//           ) : (
//             <XCircle size={18} />
//           )}
//           <span>{toast.msg}</span>
//           <button onClick={() => setToast(null)}>×</button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ============================================================
//     PUBLIC PAGE (FRONT PAGE + SELF REGISTRATION)
// ============================================================ */
// function Public(p) {
//   const features = [
//     [Sprout, 'Estate Management', 'Manage estates, ownership, capacity and daily operations digitally.'],
//     [Users, 'Labour & Attendance', 'Maintain worker profiles, attendance, daily wages and assignments.'],
//     [Sprout, 'Rubber Production', 'Record daily harvest, verify yield and move approved production into stock.'],
//     [Package, 'Live Inventory', 'Track Latex, Sheet and Scrap availability for reliable B2B procurement.'],
//     [Wallet, 'Payroll & Expenses', 'Monitor wages, operating costs, payments and financial activity.'],
//     [ShoppingCart, 'B2B Orders', 'Connect rubber estates with buyers through controlled purchase orders and invoices.'],
//   ];
//   const workflow = [
//     ['01', 'Register', 'Create the account for your role and complete the required profile details.'],
//     ['02', 'Connect', 'Estate owners manage estates while labour and supervisors request assignments.'],
//     ['03', 'Operate', 'Record attendance, harvest, verification, inventory and B2B orders in one system.'],
//     ['04', 'Transact', 'Approve orders, generate invoices and complete secure buyer payments.'],
//   ];

//   return (
//     <div className="public modern-public">
//       <header className="public-nav">
//         <div className="brand">
//           <div className="logo"><Sprout size={23} /></div>
//           <div><b>Rubber Estate</b><small>Management System</small></div>
//         </div>
//         <div className="public-nav-actions">
//           <button className="btn ghost" onClick={() => { p.setShowLogin(true); p.setAuthMode('login'); }}>Login</button>
//           <button className="btn primary" onClick={() => { p.setShowLogin(true); p.setAuthMode('register-owner'); }}>Create Account <ArrowUpRight size={15} /></button>
//         </div>
//       </header>

//       {!p.showLogin ? (
//         <>
//           <section className="modern-hero">
//             <div className="hero-copy">
//               <span className="hero-kicker"><Sprout size={14} /> SMART DIGITAL ESTATE PLATFORM</span>
//               <h1>Smart Rubber<br /><em>Estate Management</em></h1>
//               <p>One connected workspace for estate owners, supervisors, labour teams and B2B buyers — from daily harvest to inventory, orders, invoices and payments.</p>
//               <div className="hero-actions">
//                 <button className="btn primary big" onClick={() => { p.setShowLogin(true); p.setAuthMode('login'); }}>Login <ArrowUpRight size={17} /></button>
//                 <button className="btn secondary big" onClick={() => { p.setShowLogin(true); p.setAuthMode('register-owner'); }}>Register your workspace</button>
//               </div>
//               <div className="hero-trust"><span><CheckCircle2 size={15} /> Role-based access</span><span><CheckCircle2 size={15} /> Live inventory</span><span><CheckCircle2 size={15} /> B2B procurement</span></div>
//             </div>
//             <div className="hero-visual">
//               <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
//               <div className="hero-tree"><Sprout size={105} /></div>
//               <div className="hero-floating-card card-one"><Package size={18} /><span><b>Live Stock</b><small>Latex • Sheet • Scrap</small></span></div>
//               <div className="hero-floating-card card-two"><CreditCard size={18} /><span><b>Secure Payments</b><small>Invoice to settlement</small></span></div>
//               <div className="hero-floating-card card-three"><Users size={18} /><span><b>Workforce</b><small>Attendance & wages</small></span></div>
//             </div>
//           </section>

//           <section className="public-stats">
//             <div><b>5</b><span>Role-based workspaces</span></div>
//             <div><b>3</b><span>Rubber product categories</span></div>
//             <div><b>24/7</b><span>Centralized records</span></div>
//             <div><b>100%</b><span>Digital workflow</span></div>
//           </section>

//           <section className="public-section">
//             <div className="public-heading"><span>CORE CAPABILITIES</span><h2>Everything your rubber estate needs in one place.</h2><p>Built around the real workflow of estate operations, worker management, production, stock and B2B sales.</p></div>
//             <div className="feature-grid">
//               {features.map(([Icon, title, desc], index) => <div className="modern-feature" key={title}><div className="feature-icon"><Icon size={21} /></div><small>0{index + 1}</small><h3>{title}</h3><p>{desc}</p></div>)}
//             </div>
//           </section>

//           <section className="public-section workflow-section">
//             <div className="public-heading"><span>HOW IT WORKS</span><h2>From registration to rubber payment.</h2><p>A simple connected flow for every role.</p></div>
//             <div className="workflow-grid">
//               {workflow.map(([number, title, desc], index) => <div className="workflow-step" key={number}><div className="workflow-number">{number}</div><div className="workflow-line">{index < workflow.length - 1 && <i />}</div><h3>{title}</h3><p>{desc}</p></div>)}
//             </div>
//           </section>

//           <section className="role-band">
//             <div><span>BUILT FOR EVERY ROLE</span><h2>One platform. Different workspaces.</h2><p>Each user sees only the tools and information relevant to their responsibility.</p></div>
//             <div className="role-pills"><span><Building2 size={15} /> Estate Owner</span><span><ClipboardCheck size={15} /> Supervisor</span><span><Users size={15} /> Labour</span><span><ShoppingCart size={15} /> B2B Buyer</span></div>
//           </section>

//           <footer className="modern-footer"><div className="brand"><div className="logo"><Sprout size={21} /></div><div><b>Rubber Estate</b><small>Management System</small></div></div><p>Smart digital operations for modern rubber estates.</p><span>React • Django • MySQL • JWT</span></footer>
//         </>
//       ) : (
//         <div className="auth modern-auth">
//           <div className={`auth-card ${p.authMode === 'login' ? 'login-mode' : 'register-mode'}`} style={{ maxWidth: '460px' }}>
//             <div className="auth-icon"><Sprout size={23} /></div>
//             <h2>{p.authMode === 'login' ? 'Welcome back' : 'Register Workspace Account'}</h2>
//             {p.authMode !== 'login' && <div className="auth-role-switch">{[['register-owner','Estate Owner'],['register-supervisor','Supervisor'],['register-labour','Labour'],['register-buyer','Buyer']].map(([mode,label]) => <button key={mode} type="button" className={`auth-role-option ${p.authMode === mode ? 'selected' : ''}`} onClick={() => p.setAuthMode(mode)}><span className="auth-role-dot" /><span>{label}</span></button>)}</div>}
//             {p.authError && <Alert type="error" text={p.authError} />}
//             {p.regStatus && <Alert type="success" text={p.regStatus} />}
//             {p.authMode === 'login' ? (
//               <form onSubmit={p.loginSubmit}><Field l="Username"><input className="input" value={p.username} onChange={(e) => p.setUsername(e.target.value)} required /></Field><Field l="Password"><input className="input" type="password" value={p.password} onChange={(e) => p.setPassword(e.target.value)} required /></Field><button className="btn primary full">Sign in</button></form>
//             ) : p.authMode === 'register-owner' ? (
//               <form onSubmit={(e) => p.handleSelfRegister(e, 'estate_owner')}><Field l="Full Name"><input className="input" value={p.reg.full_name} onChange={(e) => p.setReg({ ...p.reg, full_name: e.target.value })} required /></Field><Field l="Phone"><input className="input" value={p.reg.phone} onChange={(e) => p.setReg({ ...p.reg, phone: e.target.value })} /></Field><Field l="Address"><textarea className="input" value={p.reg.address} onChange={(e) => p.setReg({ ...p.reg, address: e.target.value })} /></Field><Field l="Username"><input className="input" value={p.reg.username} onChange={(e) => p.setReg({ ...p.reg, username: e.target.value })} required /></Field><Field l="Password"><input className="input" type="password" value={p.reg.password} onChange={(e) => p.setReg({ ...p.reg, password: e.target.value })} required /></Field><button className="btn primary full">Create Owner Account</button></form>
//             ) : p.authMode === 'register-supervisor' ? (
//               <form onSubmit={(e) => p.handleSelfRegister(e, 'supervisor')}><Field l="Full Name"><input className="input" value={p.reg.full_name} onChange={(e) => p.setReg({ ...p.reg, full_name: e.target.value })} required /></Field><Field l="Phone"><input className="input" value={p.reg.phone} onChange={(e) => p.setReg({ ...p.reg, phone: e.target.value })} /></Field><Field l="Username"><input className="input" value={p.reg.username} onChange={(e) => p.setReg({ ...p.reg, username: e.target.value })} required /></Field><Field l="Password"><input className="input" type="password" value={p.reg.password} onChange={(e) => p.setReg({ ...p.reg, password: e.target.value })} required /></Field><button className="btn primary full">Create Supervisor Account</button></form>
//             ) : p.authMode === 'register-labour' ? (
//               <form onSubmit={(e) => p.handleSelfRegister(e, 'labour')}><Field l="Full Name"><input className="input" value={p.reg.full_name} onChange={(e) => p.setReg({ ...p.reg, full_name: e.target.value })} required /></Field><Field l="Phone"><input className="input" value={p.reg.phone} onChange={(e) => p.setReg({ ...p.reg, phone: e.target.value })} /></Field><Field l="Daily Wage (₹)"><input className="input" type="number" step="0.01" min="0" value={p.reg.daily_wage || ''} onChange={(e) => p.setReg({ ...p.reg, daily_wage: e.target.value })} required /></Field><Field l="Username"><input className="input" value={p.reg.username} onChange={(e) => p.setReg({ ...p.reg, username: e.target.value })} required /></Field><Field l="Password"><input className="input" type="password" value={p.reg.password} onChange={(e) => p.setReg({ ...p.reg, password: e.target.value })} required /></Field><button className="btn primary full">Create Labour Account</button></form>
//             ) : (
//               <form onSubmit={(e) => p.handleSelfRegister(e, 'buyer')}><Field l="Full Name"><input className="input" value={p.reg.full_name} onChange={(e) => p.setReg({ ...p.reg, full_name: e.target.value })} required /></Field><Field l="Company Name"><input className="input" value={p.reg.company_name} onChange={(e) => p.setReg({ ...p.reg, company_name: e.target.value })} required /></Field><Field l="Phone"><input className="input" value={p.reg.phone} onChange={(e) => p.setReg({ ...p.reg, phone: e.target.value })} /></Field><Field l="Email"><input className="input" type="email" value={p.reg.email} onChange={(e) => p.setReg({ ...p.reg, email: e.target.value })} /></Field><Field l="GST Number"><input className="input" value={p.reg.gst_number} onChange={(e) => p.setReg({ ...p.reg, gst_number: e.target.value })} /></Field><Field l="Address"><textarea className="input" value={p.reg.address} onChange={(e) => p.setReg({ ...p.reg, address: e.target.value })} /></Field><Field l="Username"><input className="input" value={p.reg.username} onChange={(e) => p.setReg({ ...p.reg, username: e.target.value })} required /></Field><Field l="Password"><input className="input" type="password" value={p.reg.password} onChange={(e) => p.setReg({ ...p.reg, password: e.target.value })} required /></Field><button className="btn primary full">Create Buyer Account</button></form>
//             )}
//             <button className="back" onClick={() => p.setShowLogin(false)}>← Back to home</button>
//           </div>
//         </div>
//       )}
//       <ModernStyles />
//     </div>
//   );
// }

// function Feature({ n, t, d }) {
//   return (
//     <div className="feature">
//       <small>{n}</small>
//       <b>{t}</b>
//       <span>{d}</span>
//     </div>
//   );
// }

// function Alert({ type, text }) {
//   return (
//     <div className={'alert ' + type}>
//       {type === 'success' ? (
//         <CheckCircle2 size={16} />
//       ) : (
//         <XCircle size={16} />
//       )}
//       <span style={{ whiteSpace: 'pre-line' }}>{text}</span>
//     </div>
//   );
// }

// function Field({ l, children }) {
//   return (
//     <label className="field">
//       <span>{l}</span>
//       {children}
//     </label>
//   );
// }

// function Head({ title, desc, icon: Icon = LayoutDashboard, children }) {
//   return (
//     <div className="section-head">
//       <div className="section-title">
//         <div>
//           <Icon size={20} />
//         </div>
//         <span>
//           <h2>{title}</h2>
//           <p>{desc}</p>
//         </span>
//       </div>
//       {children}
//     </div>
//   );
// }

// function Card({ children }) {
//   return <div className="card">{children}</div>;
// }

// function Button({ children, onClick, secondary = false }) {
//   return (
//     <button
//       className={'btn ' + (secondary ? 'secondary' : 'primary')}
//       onClick={onClick}
//       type="button"
//     >
//       {children}
//     </button>
//   );
// }

// function Status({ s = 'PENDING' }) {
//   return (
//     <span className={'status ' + String(s).toLowerCase()}>
//       {String(s).replaceAll('_', ' ')}
//     </span>
//   );
// }

// function Empty({ text = 'No records found.' }) {
//   return (
//     <div className="empty">
//       <Package size={20} />
//       {text}
//     </div>
//   );
// }

// function Table({ cols, rows }) {
//   return (
//     <div className="table">
//       <table>
//         <thead>
//           <tr>
//             {cols.map((column) => (
//               <th key={column}>{column}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {rows.length ? (
//             rows.map((row, i) => (
//               <tr key={i}>
//                 {row.map((cell, j) => (
//                   <td key={j}>{cell}</td>
//                 ))}
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={cols.length}>
//                 <Empty />
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// function Dashboard({
//   role,
//   user,
//   stats,
//   estates,
//   inventory,
//   orders,
//   invoices,
//   payments,
//   tapping,
//   expenses,
//   setTab,
// }) {
//   const displayName = user?.username || 'there';

//   if (role === 'buyer') {
//     const categoryTotals = {};
//     inventory.forEach((item) => {
//       const category = item.category || 'OTHER';
//       categoryTotals[category] =
//         (categoryTotals[category] || 0) + Number(item.stock_quantity || 0);
//     });
//     const stockRows = Object.entries(categoryTotals).slice(0, 4);
//     const recentOrders = orders.slice(0, 5);
//     const unpaidAmount = invoices
//       .filter((item) => String(item.payment_status || '').toUpperCase() !== 'PAID')
//       .reduce((sum, item) => sum + Number(item.amount || 0), 0);

//     return (
//       <div className="role-dashboard buyer-dashboard">
//         <div className="welcome buyer-welcome">
//           <div>
//             <small>BUYER WORKSPACE</small>
//             <h2>Hello, {displayName}</h2>
//             <p>Manage rubber procurement, orders, payments and purchase history from one place.</p>
//             <div className="quick-actions">
//               <button className="btn primary" type="button" onClick={() => setTab('inventory')}>
//                 <Package size={16} /> Browse live stock <ArrowUpRight size={15} />
//               </button>
//               <button className="btn secondary" type="button" onClick={() => setTab('orders')}>
//                 <ShoppingCart size={16} /> New purchase order
//               </button>
//             </div>
//           </div>
//           <div className="welcome-art">
//             <ShoppingCart size={42} />
//             <span>B2B</span>
//           </div>
//         </div>

//         <div className="stats buyer-stats">
//           <div className="stat"><div><Package size={20} /></div><span>Available stock</span><b>{stats.stock.toFixed(1)}</b><small>total quantity</small></div>
//           <div className="stat"><div><ShoppingCart size={20} /></div><span>My orders</span><b>{stats.orders}</b><small>purchase orders</small></div>
//           <div className="stat"><div><CreditCard size={20} /></div><span>Payments</span><b>₹{stats.totalPaid.toFixed(0)}</b><small>successful payments</small></div>
//           <div className="stat"><div><FileText size={20} /></div><span>Unpaid invoices</span><b>₹{unpaidAmount.toFixed(0)}</b><small>{stats.unpaid} invoice{stats.unpaid === 1 ? '' : 's'}</small></div>
//         </div>

//         <div className="dash-grid buyer-main-grid">
//           <Card>
//             <PanelTitle t="Live rubber stock" I={Package} action={() => setTab('inventory')} />
//             {stockRows.length ? (
//               <div className="buyer-stock-list">
//                 {stockRows.map(([category, value]) => (
//                   <div className="buyer-stock-row" key={category}>
//                     <span><i><Sprout size={15} /></i><b>{category}</b></span>
//                     <strong>{value.toFixed(1)} <small>available</small></strong>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <Empty text="No rubber stock is currently available." />
//             )}
//           </Card>
//           <Card>
//             <PanelTitle t="Purchase summary" I={Activity} />
//             <div className="summary">
//               <Row i={ShoppingCart} t="Total orders" v={stats.orders} />
//               <Row i={CreditCard} t="Successful payments" v={`₹${stats.totalPaid.toFixed(0)}`} />
//               <Row i={FileText} t="Unpaid invoices" v={stats.unpaid} />
//             </div>
//             <button className="dashboard-link" type="button" onClick={() => setTab('invoices')}>View invoices & payments <ChevronRight size={14} /></button>
//           </Card>
//         </div>

//         <Card>
//           <PanelTitle t="Recent purchase history" I={ShoppingCart} action={() => setTab('orders')} />
//           {recentOrders.length ? (
//             <Table
//               cols={['Order', 'Estate', 'Product', 'Quantity', 'Status']}
//               rows={recentOrders.map((item) => [
//                 <b key={`o-${item.id}`}>#{item.id}</b>,
//                 item.estate_name || item.estate || '—',
//                 item.category || item.product || '—',
//                 `${Number(item.quantity || 0).toFixed(1)} ${item.unit || ''}`,
//                 <Status key={`s-${item.id}`} s={item.status || 'PENDING'} />,
//               ])}
//             />
//           ) : (
//             <Empty text="No purchase history yet. Your B2B orders will appear here." />
//           )}
//         </Card>
//       </div>
//     );
//   }

//   const data =
//     role === 'labour'
//       ? [
//           ['Present days', stats.present, CalendarCheck],
//           ['Harvest', stats.production.toFixed(1), Sprout],
//           ['My wages', `₹${Number(stats.labourWages || 0).toFixed(0)}`, DollarSign],
//         ]
//       : role === 'estate_owner'
//       ? [
//           ['My estates', stats.estates, Building2],
//           ['Labour', stats.workers, Users],
//           ['Supervisors', stats.supervisors, ClipboardCheck],
//           ['Production', stats.production.toFixed(1), Sprout],
//           ['Expenses', `₹${stats.totalExpenses.toFixed(0)}`, Wallet],
//           ['Payments', `₹${stats.totalPaid.toFixed(0)}`, CreditCard],
//         ]
//       : role === 'supervisor'
//       ? [
//           ['Estate', stats.estates, Building2],
//           ['Workers', stats.workers, Users],
//           ['Pending yield', stats.pendingTapping, ClipboardCheck],
//           ['Production', stats.production.toFixed(1), Sprout],
//         ]
//       : [
//           ['Estates', stats.estates, Building2],
//           ['Labour force', stats.workers, Users],
//           ['Production', stats.production.toFixed(1), Sprout],
//           ['B2B orders', stats.orders, ShoppingCart],
//         ];

//   return (
//     <div className="role-dashboard">
//       <div className="welcome">
//         <div>
//           <small>{role === 'estate_owner' ? 'ESTATE OWNER WORKSPACE' : role === 'supervisor' ? 'SUPERVISOR WORKSPACE' : role === 'labour' ? 'LABOUR WORKSPACE' : 'ADMINISTRATOR WORKSPACE'}</small>
//           <h2>Hello, {displayName}</h2>
//           <p>{role === 'estate_owner' ? 'Manage estates, people, production, payments and operating costs from one place.' : roles[role] + ' workspace — monitor your operations from one place.'}</p>
//           {role === 'estate_owner' && (
//             <div className="quick-actions">
//               <button className="btn primary" type="button" onClick={() => setTab('payments')}><CreditCard size={16} /> View payments</button>
//               <button className="btn secondary" type="button" onClick={() => setTab('expenses')}><Wallet size={16} /> Manage expenses</button>
//               <button className="btn secondary" type="button" onClick={() => setTab('orders')}><ShoppingCart size={16} /> Review orders</button>
//             </div>
//           )}
//         </div>
//         <div className="welcome-art"><Sprout size={44} /><span>{roles[role]}</span></div>
//       </div>

//       <div className="stats">
//         {data.map(([title, value, Icon]) => (
//           <div className="stat" key={title}>
//             <div><Icon size={20} /></div>
//             <span>{title}</span>
//             <b>{value}</b>
//           </div>
//         ))}
//       </div>

//       <div className="dash-grid">
//         <Card>
//           <PanelTitle t={role === 'estate_owner' ? 'Production overview' : 'Production & activity'} I={BarChart3} action={() => setTab('tapping')} />
//           <Bars data={tapping} />
//         </Card>
//         <Card>
//           <PanelTitle t={role === 'estate_owner' ? 'Operations summary' : 'Quick summary'} I={Activity} />
//           <div className="summary">
//             <Row i={ShoppingCart} t="B2B orders" v={stats.orders} />
//             <Row i={FileText} t="Unpaid invoices" v={stats.unpaid} />
//             {role === 'estate_owner' ? (
//               <>
//                 <Row i={CreditCard} t="Payments received" v={`₹${stats.totalPaid.toFixed(0)}`} />
//                 <Row i={Wallet} t="Total expenses" v={`₹${stats.totalExpenses.toFixed(0)}`} />
//               </>
//             ) : (
//               <Row i={Users} t="Present today" v={stats.present} />
//             )}
//           </div>
//         </Card>
//       </div>

//       {role === 'estate_owner' && (
//         <div className="dash-grid">
//           <Card>
//             <PanelTitle t="Pending approvals" I={ClipboardCheck} />
//             <div className="approval-grid">
//               <button className="approval-card" type="button" onClick={() => setTab('labour')}><Users size={20} /><b>{stats.pendingLabourRequests}</b><span>Labour requests</span></button>
//               <button className="approval-card" type="button" onClick={() => setTab('supervisors')}><UserCheck size={20} /><b>{stats.pendingSupervisorRequests}</b><span>Supervisor requests</span></button>
//               <button className="approval-card" type="button" onClick={() => setTab('orders')}><ShoppingCart size={20} /><b>{stats.pendingOrders}</b><span>Orders awaiting action</span></button>
//             </div>
//           </Card>
//           <Card>
//             <PanelTitle t="Payment snapshot" I={CreditCard} action={() => setTab('payments')} />
//             <div className="finance-highlight">
//               <div><small>RECEIVED</small><strong>₹{stats.totalPaid.toFixed(0)}</strong></div>
//               <div><small>PENDING</small><strong>{stats.pendingPayments}</strong></div>
//               <div><small>EXPENSES</small><strong>₹{stats.totalExpenses.toFixed(0)}</strong></div>
//             </div>
//           </Card>
//         </div>
//       )}

//       {role !== 'labour' && role !== 'supervisor' && (
//         <Card>
//           <PanelTitle t="Recent orders" I={ShoppingCart} action={() => setTab('orders')} />
//           {orders.length ? (
//             <Table cols={['Order', 'Estate', 'Product', 'Quantity', 'Status']} rows={orders.slice(0, 5).map((item) => [<b key={item.id}>#{item.id}</b>, item.estate_name || item.estate || '—', item.category || item.product || '—', `${Number(item.quantity || 0).toFixed(1)} ${item.unit || ''}`, <Status key={`status-${item.id}`} s={item.status || 'PENDING'} />])} />
//           ) : <Empty text="No B2B orders yet." />}
//         </Card>
//       )}
//     </div>
//   );
// }

// function PanelTitle({ t, I, action }) {
//   return (
//     <div className="panel-title">
//       <span>
//         <I size={17} />
//         <b>{t}</b>
//       </span>
//       {action && (
//         <button onClick={action}>
//           View <ChevronRight size={13} />
//         </button>
//       )}
//     </div>
//   );
// }

// function Row({ i: I, t, v }) {
//   return (
//     <div className="sumrow">
//       <span>
//         <I size={16} />
//         {t}
//       </span>
//       <b>{v}</b>
//     </div>
//   );
// }

// function Bars({ data }) {
//   const grouped = {};
//   data.forEach((item) => {
//     const category = item.category || 'OTHER';
//     grouped[category] =
//       (grouped[category] || 0) + Number(item.quantity || 0);
//   });
//   const values = Object.entries(grouped);
//   if (!values.length) {
//     return <Empty text="Add tapping records to see production." />;
//   }
//   const max = Math.max(...values.map((x) => x[1]), 1);
//   return (
//     <div className="bars">
//       {values.slice(0, 6).map(([category, value]) => (
//         <div key={category}>
//           <small>{value.toFixed(1)}</small>
//           <span>
//             <i
//               style={{
//                 height: `${Math.max(8, (value / max) * 100)}%`,
//               }}
//             />
//           </span>
//           <label>{category}</label>
//         </div>
//       ))}
//     </div>
//   );
// }

// function EstateOwners({
//   estateOwners,
//   ownerOpen,
//   setOwnerOpen,
//   ownerForm,
//   setOwnerForm,
//   createEstateOwner,
// }) {
//   return (
//     <div>
//       <Head
//         title="Estate owners"
//         desc="Register and manage estate owner accounts."
//         icon={UserPlus}
//       >
//         <Button onClick={() => setOwnerOpen(!ownerOpen)}>
//           <Plus size={16} />
//           {ownerOpen ? 'Close' : 'Register owner'}
//         </Button>
//       </Head>

//       {ownerOpen && (
//         <FormCard>
//           <form onSubmit={createEstateOwner} className="form-grid">
//             <Field l="Username">
//               <input
//                 className="input"
//                 value={ownerForm.username}
//                 onChange={(e) =>
//                   setOwnerForm({ ...ownerForm, username: e.target.value })
//                 }
//                 required
//               />
//             </Field>
//             <Field l="Password">
//               <input
//                 className="input"
//                 type="password"
//                 value={ownerForm.password}
//                 onChange={(e) =>
//                   setOwnerForm({ ...ownerForm, password: e.target.value })
//                 }
//                 required
//               />
//             </Field>
//             <Field l="Full name">
//               <input
//                 className="input"
//                 value={ownerForm.full_name}
//                 onChange={(e) =>
//                   setOwnerForm({ ...ownerForm, full_name: e.target.value })
//                 }
//                 required
//               />
//             </Field>
//             <Field l="Phone">
//               <input
//                 className="input"
//                 type="tel"
//                 value={ownerForm.phone}
//                 onChange={(e) =>
//                   setOwnerForm({ ...ownerForm, phone: e.target.value })
//                 }
//               />
//             </Field>
//             <Field l="Address">
//               <textarea
//                 className="input"
//                 value={ownerForm.address}
//                 onChange={(e) =>
//                   setOwnerForm({ ...ownerForm, address: e.target.value })
//                 }
//               />
//             </Field>
//             <div className="form-actions">
//               <button type="submit" className="btn primary">
//                 <UserPlus size={16} />
//                 Register Estate Owner
//               </button>
//             </div>
//           </form>
//         </FormCard>
//       )}

//       <Table
//         cols={['Owner', 'Username', 'Phone', 'Address', 'Created']}
//         rows={estateOwners.map((item) => [
//           item.full_name || item.username || '—',
//           item.username || '—',
//           item.phone || '—',
//           item.address || '—',
//           item.created_at
//             ? new Date(item.created_at).toLocaleDateString()
//             : '—',
//         ])}
//       />
//     </div>
//   );
// }
// /* ============================================================
//     BUYERS MANAGEMENT
// ============================================================ */
// function Buyers({ buyers }) {
//   return (
//     <div>
//       <Head
//         title="Registered Buyers"
//         desc="View and manage wholesale buyer profiles and approval status."
//         icon={UserCircle}
//       />
//       <Table
//         cols={['Company Name', 'Username', 'Email', 'Phone', 'GST Number', 'Approved']}
//         rows={buyers.map((item) => [
//           <b key={item.id}>{item.company_name || '—'}</b>,
//           item.username || '—',
//           item.email || '—',
//           item.phone_number || '—',
//           item.gst_number || '—',
//           <Status key={`buyer-status-${item.id}`} s={item.is_approved ? 'APPROVED' : 'PENDING'} />,
//         ])}
//       />
//       {!buyers.length && <Empty text="No registered buyers found." />}
//     </div>
//   );
// }

// function Estates({
//   estates,
//   estateOpen,
//   setEstateOpen,
//   estateForm,
//   setEstateForm,
//   createEstate,
//   isAdmin,
//   isOwner,
//   isLabour,
//   isSupervisor,
//   labourRequests,
//   supervisorRequests,
//   requestEstateAsLabour,
//   requestEstateAsSupervisor,
//   approveLabourRequest,
//   rejectLabourRequest,
//   approveSupervisorRequest,
//   rejectSupervisorRequest,
//   requestMessage,
//   setRequestMessage,
// }) {
//   return (
//     <div>
//       <Head
//         title={isLabour || isSupervisor ? 'Find an estate' : isOwner ? 'My estates' : 'Estate management'}
//         desc="Manage estate locations, capacities and memberships."
//         icon={Building2}
//       >
//         {(isAdmin || isOwner) && (
//           <Button onClick={() => setEstateOpen(!estateOpen)}>
//             <Plus size={16} />
//             {estateOpen ? 'Close' : 'Add estate'}
//           </Button>
//         )}
//       </Head>

//       {estateOpen && (isAdmin || isOwner) && (
//         <FormCard>
//           <form onSubmit={createEstate} className="form-grid">
//             <Field l="Estate name">
//               <input className="input" value={estateForm.name} onChange={(e) => setEstateForm({ ...estateForm, name: e.target.value })} required />
//             </Field>
//             <Field l="Location">
//               <input className="input" value={estateForm.location} onChange={(e) => setEstateForm({ ...estateForm, location: e.target.value })} required />
//             </Field>
//             <Field l="Total area (acres)">
//               <input className="input" type="number" step="0.01" value={estateForm.total_area} onChange={(e) => setEstateForm({ ...estateForm, total_area: e.target.value })} required />
//             </Field>
//             <Field l="Maximum labour">
//               <input className="input" type="number" value={estateForm.max_labour} onChange={(e) => setEstateForm({ ...estateForm, max_labour: e.target.value })} required />
//             </Field>
//             <Field l="Maximum supervisors">
//               <input className="input" type="number" value={estateForm.max_supervisors} onChange={(e) => setEstateForm({ ...estateForm, max_supervisors: e.target.value })} required />
//             </Field>
//             <Field l="Description">
//               <textarea className="input" value={estateForm.description} onChange={(e) => setEstateForm({ ...estateForm, description: e.target.value })} />
//             </Field>
//             <button type="submit" className="btn primary">Save estate</button>
//           </form>
//         </FormCard>
//       )}

//       {(isLabour || isSupervisor) && (
//         <Card>
//           <Field l="Request message (optional)">
//             <textarea className="input" value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} placeholder="Tell the estate owner why you want to join..." rows="3" />
//           </Field>
//         </Card>
//       )}

//       <div className="estate-grid">
//         {estates.map((estate) => {
//           const labourCount = Number(estate.labour_count ?? 0);
//           const supervisorCount = Number(estate.supervisor_count ?? 0);
//           const maxLabour = Number(estate.max_labour ?? 0);
//           const maxSupervisors = Number(estate.max_supervisors ?? 0);
//           const labourSlots = Math.max(maxLabour - labourCount, 0);
//           const supervisorSlots = Math.max(maxSupervisors - supervisorCount, 0);

//           const labourRequest = labourRequests.find((item) => String(item.estate) === String(estate.id));
//           const supervisorRequest = supervisorRequests.find((item) => String(item.estate) === String(estate.id));

//           return (
//             <Card key={estate.id}>
//               <div className="estate-icon"><Sprout size={21} /></div>
//               <h3>{estate.name}</h3>
//               <p><MapPin size={13} />{estate.location || 'Location not specified'}</p>
//               <div className="metrics">
//                 <span>AREA <b>{estate.total_area || 0} ac</b></span>
//                 <span>LABOUR <b>{labourCount}/{maxLabour}</b></span>
//                 <span>SUPERVISORS <b>{supervisorCount}/{maxSupervisors}</b></span>
//               </div>
//               <div className="estate-capacity"><small>Labour slots: {labourSlots}</small><small>Supervisor slots: {supervisorSlots}</small></div>

//               {isLabour && (
//                 <div className="request-action">
//                   {labourRequest ? <Status s={labourRequest.status} /> : (
//                     <Button secondary={labourSlots <= 0} onClick={() => labourSlots > 0 && requestEstateAsLabour(estate.id)}>
//                       <Send size={15} /> {labourSlots <= 0 ? 'Full' : 'Request to join'}
//                     </Button>
//                   )}
//                 </div>
//               )}

//               {isSupervisor && (
//                 <div className="request-action">
//                   {supervisorRequest ? <Status s={supervisorRequest.status} /> : (
//                     <Button secondary={supervisorSlots <= 0} onClick={() => supervisorSlots > 0 && requestEstateAsSupervisor(estate.id)}>
//                       <Send size={15} /> {supervisorSlots <= 0 ? 'Full' : 'Request to join'}
//                     </Button>
//                   )}
//                 </div>
//               )}
//             </Card>
//           );
//         })}
//       </div>

//       {(isOwner || isAdmin) && (
//         <div className="dash-grid">
//           <Card>
//             <PanelTitle t="Labour requests" I={UserPlus} />
//             {labourRequests.length ? (
//               <Table cols={['Labour', 'Estate', 'Status', 'Action']} rows={labourRequests.map((item) => [item.labour_name || '—', item.estate_name || '—', <Status key={item.id} s={item.status} />, item.status === 'PENDING' ? (<div className="actions" key={item.id}><button className="btn primary" onClick={() => approveLabourRequest(item.id)}><Check size={14} /> Approve</button><button className="btn secondary" onClick={() => rejectLabourRequest(item.id)}><X size={14} /> Reject</button></div>) : '—'])} />
//             ) : <Empty text="No labour requests." />}
//           </Card>
//           <Card>
//             <PanelTitle t="Supervisor requests" I={UserCheck} />
//             {supervisorRequests.length ? (
//               <Table cols={['Supervisor', 'Estate', 'Status', 'Action']} rows={supervisorRequests.map((item) => [item.supervisor_name || '—', item.estate_name || '—', <Status key={item.id} s={item.status} />, item.status === 'PENDING' ? (<div className="actions" key={item.id}><button className="btn primary" onClick={() => approveSupervisorRequest(item.id)}><Check size={14} /> Approve</button><button className="btn secondary" onClick={() => rejectSupervisorRequest(item.id)}><X size={14} /> Reject</button></div>) : '—'])} />
//             ) : <Empty text="No supervisor requests." />}
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// }

// function Labours({ labour, attendance, search, setSearch, labourOpen, setLabourOpen, labourForm, setLabourForm, createLabour, attOpen, setAttOpen, attForm, setAttForm, createAtt, isLabour, isSupervisor }) {
//   const rows = labour.filter((item) => `${item.full_name || ''} ${item.phone || ''}`.toLowerCase().includes(search.toLowerCase()));
//   return (
//     <div>
//       <Head title={isLabour ? 'My attendance' : 'Labour management'} desc="Manage worker profiles and attendance tracking." icon={Users}>
//         {!isLabour && <Button onClick={() => setLabourOpen(!labourOpen)}><Plus size={16} />{labourOpen ? 'Close' : 'Add worker'}</Button>}
//       </Head>
//       {!isLabour && (
//         <>
//           <div className="toolbar"><div className="search"><Search size={16} /><input type="text" placeholder="Search workers..." value={search} onChange={(e) => setSearch(e.target.value)} /></div></div>
//           {labourOpen && (
//             <FormCard>
//               <form onSubmit={createLabour} className="form-grid">
//                 <Field l="Username"><input className="input" value={labourForm.username || ''} onChange={(e) => setLabourForm({ ...labourForm, username: e.target.value })} required /></Field>
//                 <Field l="Password"><input className="input" type="password" value={labourForm.password || ''} onChange={(e) => setLabourForm({ ...labourForm, password: e.target.value })} required /></Field>
//                 <Field l="Full name"><input className="input" value={labourForm.full_name || ''} onChange={(e) => setLabourForm({ ...labourForm, full_name: e.target.value })} required /></Field>
//                 <Field l="Phone"><input className="input" value={labourForm.phone || ''} onChange={(e) => setLabourForm({ ...labourForm, phone: e.target.value })} /></Field>
//                 <Field l="Address"><textarea className="input" value={labourForm.address || ''} onChange={(e) => setLabourForm({ ...labourForm, address: e.target.value })} /></Field>
//                 <Field l="Daily wage"><input className="input" type="number" step="0.01" value={labourForm.daily_wage || ''} onChange={(e) => setLabourForm({ ...labourForm, daily_wage: e.target.value })} /></Field>
//                 <button type="submit" className="btn primary">Save worker</button>
//               </form>
//             </FormCard>
//           )}
//           <Table cols={['Worker', 'Phone', 'Estate', 'Daily wage', 'Status']} rows={rows.map((item) => [<b>{item.full_name || item.username}</b>, item.phone || '—', item.estate_name || 'Not assigned', `₹${Number(item.daily_wage || 0).toFixed(2)}`, <Status key={item.id} s={item.estate ? 'ACTIVE' : 'PENDING'} />])} />
//         </>
//       )}
//       {isLabour && <Table cols={['Date', 'Status', 'Block', 'Remarks']} rows={attendance.map((item) => [item.date, <Status key={item.id} s={item.status} />, item.assigned_block || '—', item.remarks || '—'])} />}
//       {!isLabour && isSupervisor && <div className="toolbar"><Button secondary onClick={() => setAttOpen(!attOpen)}><CalendarCheck size={16} />{attOpen ? 'Close' : 'Record attendance'}</Button></div>}
//       {!isLabour && attOpen && (
//         <FormCard>
//           <form onSubmit={createAtt} className="form-grid">
//             <Field l="Labour"><select className="input" value={attForm.labour} onChange={(e) => setAttForm({ ...attForm, labour: e.target.value })} required><option value="">Select labour</option>{labour.map((item) => <option key={item.user || item.id} value={item.user || item.id}>{item.full_name || item.username}</option>)}</select></Field>
//             <Field l="Date"><input className="input" type="date" value={attForm.date} onChange={(e) => setAttForm({ ...attForm, date: e.target.value })} required /></Field>
//             <Field l="Status"><select className="input" value={attForm.status} onChange={(e) => setAttForm({ ...attForm, status: e.target.value })}><option value="PRESENT">PRESENT</option><option value="ABSENT">ABSENT</option><option value="HALF_DAY">HALF DAY</option></select></Field>
//             <Field l="Block"><input className="input" value={attForm.assigned_block} onChange={(e) => setAttForm({ ...attForm, assigned_block: e.target.value })} /></Field>
//             <Field l="Remarks"><textarea className="input" value={attForm.remarks} onChange={(e) => setAttForm({ ...attForm, remarks: e.target.value })} /></Field>
//             <button type="submit" className="btn primary">Save attendance</button>
//           </form>
//         </FormCard>
//       )}
//     </div>
//   );
// }

// /* ============================================================
//     SUPERVISORS
// ============================================================ */
// function Supervisors({
//   supervisors,
//   supervisorOpen,
//   setSupervisorOpen,
//   supervisorForm,
//   setSupervisorForm,
//   createSupervisor,
//   isAdmin,
//   isOwner,
// }) {
//   return (
//     <div>
//       <Head
//         title="Supervisor management"
//         desc={
//           isAdmin
//             ? 'Create supervisor accounts. Supervisors can request an estate after registration.'
//             : 'View supervisors assigned to your estates.'
//         }
//         icon={ClipboardCheck}
//       >
//         {isAdmin && (
//           <Button onClick={() => setSupervisorOpen(!supervisorOpen)}>
//             <Plus size={16} />
//             {supervisorOpen ? 'Close' : 'Add supervisor'}
//           </Button>
//         )}
//       </Head>

//       {isAdmin && supervisorOpen && (
//         <FormCard>
//           <form onSubmit={createSupervisor} className="form-grid">
//             <Field l="Full name">
//               <input
//                 className="input"
//                 value={supervisorForm.full_name}
//                 onChange={(e) =>
//                   setSupervisorForm({
//                     ...supervisorForm,
//                     full_name: e.target.value,
//                   })
//                 }
//                 required
//               />
//             </Field>
//             <Field l="Username">
//               <input
//                 className="input"
//                 value={supervisorForm.username}
//                 onChange={(e) =>
//                   setSupervisorForm({
//                     ...supervisorForm,
//                     username: e.target.value,
//                   })
//                 }
//                 required
//               />
//             </Field>
//             <Field l="Password">
//               <input
//                 className="input"
//                 type="password"
//                 value={supervisorForm.password}
//                 onChange={(e) =>
//                   setSupervisorForm({
//                     ...supervisorForm,
//                     password: e.target.value,
//                   })
//                 }
//                 required
//               />
//             </Field>
//             <Field l="Phone">
//               <input
//                 className="input"
//                 value={supervisorForm.phone}
//                 onChange={(e) =>
//                   setSupervisorForm({
//                     ...supervisorForm,
//                     phone: e.target.value,
//                   })
//                 }
//               />
//             </Field>
//             <button type="submit" className="btn primary">
//               Create supervisor
//             </button>
//           </form>
//         </FormCard>
//       )}

//       {/* ALLOW BOTH ADMIN AND ESTATE OWNER TO SEE THE TABLE */}
//       {(isAdmin || isOwner) && (
//         <Table
//           cols={['Supervisor', 'Username', 'Phone', 'Estate', 'Status']}
//           rows={supervisors.map((item) => [
//             <b key={item.id}>{item.full_name || 'Supervisor'}</b>,
//             item.username || '—',
//             item.phone || '—',
//             item.estate_name || item.estate || 'Not assigned',
//             <Status
//               key={`status-${item.id}`}
//               s={item.estate ? 'ACTIVE' : 'PENDING'}
//             />,
//           ])}
//         />
//       )}
//     </div>
//   );
// }function Tapping({ tapping, labour, estates, tapOpen, setTapOpen, tapForm, setTapForm, createTap, verifyTap, isLabour, user }) {
//   const rows = isLabour ? tapping.filter((item) => String(item.labour) === String(user?.id)) : tapping;

//   return (
//     <div>
//       <Head title="Tapping & production" desc="Verify and track rubber output." icon={Sprout}>
//         <Button onClick={() => setTapOpen(!tapOpen)}>
//           <Plus size={16} />
//           {tapOpen ? 'Close' : 'New record'}
//         </Button>
//       </Head>

//       {tapOpen && (
//         <FormCard>
//           <form onSubmit={createTap} className="form-grid">
//             {/* Estate selection is only required for Admins, Owners, and Supervisors */}
//             {!isLabour && (
//               <Field l="Estate">
//                 <select className="input" value={tapForm.estate} onChange={(e) => setTapForm({ ...tapForm, estate: e.target.value })} required>
//                   <option value="">Select estate</option>
//                   {estates.map((e) => (
//                     <option key={e.id} value={e.id}>{e.name}</option>
//                   ))}
//                 </select>
//               </Field>
//             )}

//             {/* Labour selection is only required for Admins, Owners, and Supervisors */}
//             {!isLabour && (
//               <Field l="Labour">
//                 <select className="input" value={tapForm.labour} onChange={(e) => setTapForm({ ...tapForm, labour: e.target.value })} required>
//                   <option value="">Select labour</option>
//                   {labour.map((l) => (
//                     <option key={l.user || l.id} value={l.user || l.id}>{l.full_name || l.username}</option>
//                   ))}
//                 </select>
//               </Field>
//             )}

//             <Field l="Category">
//               <select className="input" value={tapForm.category} onChange={(e) => setTapForm({ ...tapForm, category: e.target.value })}>
//                 <option value="LATEX">LATEX</option>
//                 <option value="SHEET">SHEET</option>
//                 <option value="SCRAP">SCRAP</option>
//               </select>
//             </Field>

//             <Field l="Quantity">
//               <input className="input" type="number" step="0.01" value={tapForm.quantity} onChange={(e) => setTapForm({ ...tapForm, quantity: e.target.value })} required />
//             </Field>

//             <Field l="Unit">
//               <select className="input" value={tapForm.unit} onChange={(e) => setTapForm({ ...tapForm, unit: e.target.value })}>
//                 <option value="LITRE">LITRE</option>
//                 <option value="KG">KG</option>
//               </select>
//             </Field>

//             <Field l="Date">
//               <input className="input" type="date" value={tapForm.date} onChange={(e) => setTapForm({ ...tapForm, date: e.target.value })} required />
//             </Field>

//             <Field l="Block">
//               <input className="input" value={tapForm.assigned_block} onChange={(e) => setTapForm({ ...tapForm, assigned_block: e.target.value })} />
//             </Field>

//             <Field l="Remarks">
//               <textarea className="input" value={tapForm.remarks} onChange={(e) => setTapForm({ ...tapForm, remarks: e.target.value })} />
//             </Field>

//             <button type="submit" className="btn primary">Save record</button>
//           </form>
//         </FormCard>
//       )}

//       <Table 
//         cols={['Date', 'Worker', 'Category', 'Quantity', 'Status', 'Action']} 
//         rows={rows.map((item) => [
//           item.date, 
//           item.labour_name || '—', 
//           item.category, 
//           `${item.quantity} ${item.unit}`, 
//           <Status key={item.id} s={item.is_verified ? 'VERIFIED' : 'PENDING'} />, 
//           !item.is_verified && !isLabour ? (
//             <button key={item.id} className="btn primary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => verifyTap(item.id)}>
//               Verify
//             </button>
//           ) : '—'
//         ])} 
//       />
//     </div>
//   );
// }

// function Inventory({ inventory }) {
//   return (
//     <div>
//       <Head
//         title="Live Stock"
//         desc="View current stock available across all estates."
//         icon={Package}
//       />

//       <Table
//         cols={['Estate', 'Product', 'Available Stock', 'Unit', 'Unit Price']}
//         rows={inventory.map((item) => [
//           item.estate_name || item.estate?.name || '—',
//           item.category || '—',
//           item.stock_quantity ?? 0,
//           item.unit || 'KG',
//           `₹${item.unit_price ?? 0}`,
//         ])}
//       />

//       {!inventory.length && (
//         <Empty text="No live stock available." />
//       )}
//     </div>
//   );
// }

// function Payroll({ labour, attendance, isLabour, user }) {
//   const visibleLabour = isLabour ? labour.filter((w) => String(w.user) === String(user?.id)) : labour;
//   const rows = visibleLabour.map((worker) => {
//     const workerAtt = attendance.filter((i) => String(i.labour) === String(worker.user));
//     const present = workerAtt.filter((i) => i.status === 'PRESENT').length;
//     const half = workerAtt.filter((i) => i.status === 'HALF_DAY').length;
//     const wages = present * Number(worker.daily_wage || 0) + half * Number(worker.daily_wage || 0) * 0.5;
//     return [worker.full_name || worker.username, present, half, `₹${wages.toFixed(2)}`, <Status key={worker.id} s={present || half ? 'READY' : 'PENDING'} />];
//   });
//   return <div><Head title="Payroll" desc="Wage oversight." icon={DollarSign} /><Table cols={['Worker', 'Present', 'Half-day', 'Wages', 'Status']} rows={rows} /></div>;
// }

// function Orders({ orders, estates, orderOpen, setOrderOpen, orderForm, setOrderForm, createOrder, isBuyer, role, approveOrder, rejectOrder }) {
//   const canApprove = role === 'admin' || role === 'estate_owner';
//   const visible = isBuyer
//     ? orders
//     : orders;

//   return (
//     <div>
//       <Head
//         title={isBuyer ? 'My Orders' : 'B2B Orders'}
//         desc={isBuyer ? 'Create and track wholesale orders.' : 'Review and manage wholesale orders.'}
//         icon={ShoppingCart}
//       >
//         {isBuyer && (
//           <Button onClick={() => setOrderOpen(!orderOpen)}>
//             <Plus size={16} />
//             {orderOpen ? 'Close' : 'New order'}
//           </Button>
//         )}
//       </Head>

//       {isBuyer && orderOpen && (
//         <FormCard>
//           <form onSubmit={createOrder} className="form-grid">
//             <Field l="Estate">
//               <select
//                 className="input"
//                 value={orderForm.estate}
//                 onChange={(e) => setOrderForm({ ...orderForm, estate: e.target.value })}
//                 required
//               >
//                 <option value="">Select estate</option>
//                 {estates.map((e) => (
//                   <option key={e.id} value={e.id}>{e.name}</option>
//                 ))}
//               </select>
//             </Field>

//             <Field l="Product">
//               <select
//                 className="input"
//                 value={orderForm.category}
//                 onChange={(e) => setOrderForm({ ...orderForm, category: e.target.value })}
//               >
//                 <option value="LATEX">LATEX</option>
//                 <option value="SHEET">SHEET</option>
//                 <option value="SCRAP">SCRAP</option>
//               </select>
//             </Field>

//             <Field l="Quantity">
//               <input
//                 className="input"
//                 type="number"
//                 step="0.01"
//                 min="0.01"
//                 value={orderForm.quantity}
//                 onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
//                 required
//               />
//             </Field>

//             <button type="submit" className="btn primary">
//               <Send size={15} /> Place order
//             </button>
//           </form>
//         </FormCard>
//       )}

//       <Table
//         cols={['Order', 'Buyer', 'Estate', 'Product', 'Qty', 'Total', 'Status', 'Action']}
//         rows={visible.map((item) => [
//           `#${item.id}`,
//           item.buyer_company || item.buyer_name || item.buyer_username || '—',
//           item.estate_name || '—',
//           item.category || '—',
//           `${item.quantity || 0}`,
//           `₹${Number(item.total_price || 0).toFixed(2)}`,
//           <Status key={`status-${item.id}`} s={item.status} />,
//           canApprove && String(item.status).toUpperCase() === 'PENDING' ? (
//             <div className="actions" key={`actions-${item.id}`}>
//               <button
//                 type="button"
//                 className="btn primary"
//                 style={{ padding: '4px 10px', fontSize: '12px' }}
//                 onClick={() => approveOrder(item.id)}
//               >
//                 <Check size={14} /> Approve
//               </button>
//               <button
//                 type="button"
//                 className="btn secondary"
//                 style={{ padding: '4px 10px', fontSize: '12px', marginLeft: '6px' }}
//                 onClick={() => rejectOrder(item.id)}
//               >
//                 <X size={14} /> Reject
//               </button>
//             </div>
//           ) : '—',
//         ])}
//       />
//     </div>
//   );
// }

// function Invoices({ invoices, payments, isBuyer, paymentOpen, setPaymentOpen, paymentForm, setPaymentForm, createPayment, createRazorpayOrder, razorpayProcessing }) {
//   const payableInvoices = invoices.filter(
//     (invoice) => String(invoice.payment_status).toUpperCase() !== 'PAID'
//   );

//   return (
//     <div>
//       <RazorpayPaymentStyles />
//       <Head title="Invoices & Payments" desc="Track invoices and record payments." icon={FileText}>
//         {isBuyer && payableInvoices.length > 0 && (
//           <Button
//             onClick={() => setPaymentOpen(!paymentOpen)}
//             disabled={razorpayProcessing}
//           >
//             <DollarSign size={16} />
//             {paymentOpen ? 'Close' : 'Pay with Razorpay'}
//           </Button>
//         )}
//       </Head>

//       {isBuyer && paymentOpen && payableInvoices.length > 0 && (
//         <FormCard>
//           <form onSubmit={createPayment} className="form-grid">
//             <Field l="Invoice">
//               <select
//                 className="input"
//                 value={paymentForm.invoice}
//                 onChange={(e) => {
//                   const selected = payableInvoices.find(
//                     (i) => String(i.id) === String(e.target.value)
//                   );

//                   setPaymentForm({
//                     ...paymentForm,
//                     invoice: e.target.value,
//                     amount: selected
//                       ? String(selected.amount || '')
//                       : '',
//                   });
//                 }}
//                 required
//                 disabled={razorpayProcessing}
//               >
//                 <option value="">Select invoice</option>
//                 {payableInvoices.map((invoice) => (
//                   <option key={invoice.id} value={invoice.id}>
//                     {invoice.invoice_number} — ₹
//                     {Number(invoice.amount || 0).toFixed(2)} —{' '}
//                     {invoice.payment_status}
//                   </option>
//                 ))}
//               </select>
//             </Field>

//             <Field l="Amount to pay">
//               <input
//                 className="input"
//                 type="text"
//                 value={paymentForm.amount ? `₹${Number(paymentForm.amount).toFixed(2)}` : ''}
//                 readOnly
//                 placeholder="Select an invoice"
//                 disabled={razorpayProcessing}
//               />
//             </Field>

//             <div className="payment-secure-note">
//               <div className="payment-secure-icon">
//                 <Check size={16} />
//               </div>
//               <div>
//                 <strong>Secure payment with Razorpay</strong>
//                 <span>
//                   The backend calculates the remaining invoice balance.
//                   Razorpay Checkout will open for that exact amount.
//                 </span>
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="btn primary"
//               disabled={
//                 razorpayProcessing ||
//                 !paymentForm.invoice ||
//                 !paymentForm.amount
//               }
//             >
//               <DollarSign size={15} />
//               {razorpayProcessing
//                 ? 'Opening secure checkout...'
//                 : 'Pay securely with Razorpay'}
//             </button>
//           </form>
//         </FormCard>
//       )}

//       <Table
//         cols={['Invoice', 'Order', 'Buyer', 'Amount', 'Status', 'Issued', ...(isBuyer ? ['Action'] : [])]}
//         rows={invoices.map((invoice) => [
//           invoice.invoice_number || '—',
//           `#${invoice.order_number || invoice.order || '—'}`,
//           invoice.buyer_name || '—',
//           `₹${Number(invoice.amount || 0).toFixed(2)}`,
//           <Status key={`invoice-status-${invoice.id}`} s={invoice.payment_status} />,
//           invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString() : '—',
//           ...(isBuyer
//             ? [
//                 String(invoice.payment_status).toUpperCase() !== 'PAID' ? (
//                   <button
//                     key={`pay-${invoice.id}`}
//                     type="button"
//                     className="btn primary"
//                     onClick={() => createRazorpayOrder(invoice.id)}
//                     disabled={razorpayProcessing}
//                     style={{ padding: '7px 11px', fontSize: '11px' }}
//                   >
//                     <DollarSign size={14} />
//                     {razorpayProcessing
//                       ? 'Processing...'
//                       : 'Pay with Razorpay'}
//                   </button>
//                 ) : (
//                   '—'
//                 ),
//               ]
//             : []),
//         ])}
//       />

//       {payments.length > 0 && (
//         <div style={{ marginTop: '24px' }}>
//           <Head title="Payment History" desc="Recorded invoice payments." icon={DollarSign} />
//           <Table
//             cols={['Invoice', 'Buyer', 'Amount', 'Method', 'Transaction', 'Status', 'Date']}
//             rows={payments.map((payment) => [
//               payment.invoice_number || `#${payment.invoice || '—'}`,
//               payment.buyer_name || '—',
//               `₹${Number(payment.amount || 0).toFixed(2)}`,
//               payment.payment_method || '—',
//               payment.transaction_id || '—',
//               <Status key={`payment-status-${payment.id}`} s={payment.status} />,
//               payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '—',
//             ])}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// function Payments({ payments, stats }) {
//   return (
//     <div>
//       <Head title="Payments" desc="Monitor successful and pending buyer payments for your estates." icon={CreditCard} />
//       <div className="finance-cards">
//         <div className="finance-card"><span><CreditCard size={18} /> Received</span><b>₹{stats.totalPaid.toFixed(2)}</b><small>Successful payments</small></div>
//         <div className="finance-card"><span><Activity size={18} /> Pending</span><b>{stats.pendingPayments}</b><small>Payments awaiting completion</small></div>
//         <div className="finance-card"><span><FileText size={18} /> Transactions</span><b>{payments.length}</b><small>Total payment records</small></div>
//       </div>
//       {payments.length ? (
//         <Table
//           cols={['Payment', 'Invoice', 'Buyer', 'Amount', 'Method', 'Transaction', 'Status', 'Date']}
//           rows={payments.map((item) => [
//             <b key={item.id}>#{item.id}</b>,
//             item.invoice_number || item.invoice || '—',
//             item.buyer_name || item.buyer || '—',
//             `₹${Number(item.amount || 0).toFixed(2)}`,
//             item.payment_method || '—',
//             item.transaction_id || '—',
//             <Status key={`payment-${item.id}`} s={item.status || 'PENDING'} />,
//             item.payment_date ? new Date(item.payment_date).toLocaleDateString() : '—',
//           ])}
//         />
//       ) : <Empty text="No payment records are available for your estates yet." />}
//     </div>
//   );
// }

// function Expenses({ expenses, estates, expenseOpen, setExpenseOpen, expenseForm, setExpenseForm, createExpense, expenseSaving }) {
//   const categories = ['Labour','Fertilizer','Pesticides / Chemicals','Planting Materials','Tools & Equipment','Machinery','Fuel','Transportation','Maintenance & Repairs','Electricity','Water / Irrigation','Estate Development','Office / Administration','Rent / Lease','Licenses & Permits','Insurance','Packaging','Processing','Other'];
//   return (
//     <div>
//       <Head title="Expenses" desc="Monitor operating costs." icon={Wallet}>
//         <Button onClick={() => setExpenseOpen(!expenseOpen)} disabled={expenseSaving}>
//           <Plus size={16} /> {expenseOpen ? 'Close' : 'Add expense'}
//         </Button>
//       </Head>
//       {expenseOpen && (
//         <FormCard>
//           <form onSubmit={createExpense} className="form-grid">
//             <Field l="Estate"><select className="input" value={expenseForm.estate} onChange={(e) => setExpenseForm({ ...expenseForm, estate: e.target.value })} required disabled={expenseSaving}><option value="">Select estate</option>{estates.map((estate) => <option key={estate.id} value={estate.id}>{estate.name}</option>)}</select></Field>
//             <Field l="Category"><select className="input" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} required disabled={expenseSaving}><option value="">Select category</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></Field>
//             <Field l="Amount"><input className="input" type="number" min="0.01" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required disabled={expenseSaving} /></Field>
//             <Field l="Date"><input className="input" type="date" value={expenseForm.expense_date} onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} required disabled={expenseSaving} /></Field>
//             <Field l="Description"><textarea className="input" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} disabled={expenseSaving} /></Field>
//             <button type="submit" className="btn primary" disabled={expenseSaving}>{expenseSaving ? 'Saving expense...' : 'Save expense'}</button>
//           </form>
//         </FormCard>
//       )}
//       <Table cols={['Estate','Category','Amount','Date','Description']} rows={expenses.map((item) => [item.estate_name || item.estate || '—', item.category || '—', `₹${Number(item.amount || 0).toFixed(2)}`, item.expense_date || '—', item.description || '—'])} />
//     </div>
//   );
// }

// function RazorpayPaymentStyles() {
//   return (
//     <style>{`
//       .payment-secure-note {
//         grid-column: 1 / -1;
//         display: flex;
//         align-items: flex-start;
//         gap: 12px;
//         padding: 14px 16px;
//         border: 1px solid rgba(15, 118, 110, 0.16);
//         border-radius: 12px;
//         background: rgba(15, 118, 110, 0.04);
//       }

//       .payment-secure-icon {
//         width: 30px;
//         height: 30px;
//         flex: 0 0 30px;
//         display: grid;
//         place-items: center;
//         border-radius: 50%;
//         background: rgba(15, 118, 110, 0.12);
//         color: #0f766e;
//       }

//       .payment-secure-note strong,
//       .payment-secure-note span {
//         display: block;
//       }

//       .payment-secure-note strong {
//         margin-bottom: 3px;
//         font-size: 13px;
//       }

//       .payment-secure-note span {
//         color: #64748b;
//         font-size: 12px;
//         line-height: 1.5;
//       }

//       .btn:disabled,
//       button:disabled {
//         opacity: 0.6;
//         cursor: not-allowed;
//       }
//     `}</style>
//   );
// }

// function ModernStyles() {
//   return (
//     <style>{`
//       .modern-public {
//         --forest: #0f5b3f;
//         --forest-dark: #093d2b;
//         --leaf: #1f8a5b;
//         --mint: #e8f5ee;
//         --cream: #f7fbf8;
//         --ink: #10231b;
//         --muted: #64756d;
//         min-height: 100vh;
//         color: var(--ink);
//         background: #f7faf8;
//         overflow-x: hidden;
//       }

//       .modern-public .public-nav {
//         max-width: 1240px;
//         margin: 0 auto;
//         padding: 20px 28px;
//         display: flex;
//         align-items: center;
//         justify-content: space-between;
//         gap: 20px;
//         background: transparent;
//       }
//       .modern-public .public-nav-actions { display: flex; gap: 10px; align-items: center; }
//       .modern-public .brand { display: flex; align-items: center; gap: 11px; }
//       .modern-public .brand .logo { box-shadow: 0 10px 25px rgba(15,91,63,.16); }
//       .modern-public .brand b { color: var(--ink); }
//       .modern-public .brand small { color: #708079; }

//       .modern-hero {
//         max-width: 1240px;
//         margin: 0 auto;
//         min-height: 590px;
//         padding: 70px 28px 80px;
//         display: grid;
//         grid-template-columns: 1.02fr .98fr;
//         gap: 45px;
//         align-items: center;
//       }
//       .hero-copy { position: relative; z-index: 2; }
//       .hero-kicker, .public-heading > span, .role-band > div:first-child > span {
//         display: inline-flex;
//         align-items: center;
//         gap: 7px;
//         font-size: 11px;
//         font-weight: 800;
//         letter-spacing: .16em;
//         color: var(--leaf);
//       }
//       .modern-hero h1 {
//         margin: 18px 0 18px;
//         font-size: clamp(48px, 6vw, 82px);
//         line-height: .98;
//         letter-spacing: -.055em;
//         color: var(--forest-dark);
//       }
//       .modern-hero h1 em { color: var(--leaf); font-style: normal; }
//       .modern-hero p { max-width: 680px; color: #617169; font-size: 17px; line-height: 1.75; margin: 0; }
//       .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 28px; }
//       .hero-trust { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 20px; color: #597067; font-size: 12px; }
//       .hero-trust span { display: inline-flex; align-items: center; gap: 6px; }
//       .hero-trust svg { color: var(--leaf); }

//       .hero-visual {
//         min-height: 470px;
//         position: relative;
//         display: grid;
//         place-items: center;
//         border-radius: 42px;
//         background: radial-gradient(circle at 50% 42%, #d9f0e2 0 13%, transparent 14%), linear-gradient(145deg, #dff1e6, #f4faf6 60%, #d4eadc);
//         overflow: hidden;
//         box-shadow: inset 0 0 0 1px rgba(15,91,63,.08), 0 30px 80px rgba(15,91,63,.10);
//       }
//       .hero-tree { width: 235px; height: 235px; border-radius: 50%; display: grid; place-items: center; color: var(--forest); background: rgba(255,255,255,.65); box-shadow: 0 30px 80px rgba(15,91,63,.15), inset 0 0 0 1px rgba(255,255,255,.8); z-index: 2; }
//       .hero-tree svg { filter: drop-shadow(0 14px 12px rgba(15,91,63,.13)); }
//       .hero-orbit { position: absolute; border: 1px solid rgba(15,91,63,.12); border-radius: 50%; }
//       .orbit-one { width: 390px; height: 390px; }
//       .orbit-two { width: 560px; height: 560px; }
//       .hero-floating-card { position: absolute; z-index: 3; display: flex; align-items: center; gap: 10px; padding: 13px 15px; background: rgba(255,255,255,.9); border: 1px solid rgba(15,91,63,.08); border-radius: 16px; box-shadow: 0 18px 45px rgba(15,91,63,.13); backdrop-filter: blur(10px); }
//       .hero-floating-card > svg { color: var(--leaf); }
//       .hero-floating-card span { display: grid; gap: 2px; }
//       .hero-floating-card b { font-size: 12px; }
//       .hero-floating-card small { color: #728078; font-size: 10px; }
//       .card-one { top: 70px; left: 24px; }
//       .card-two { right: 22px; top: 185px; }
//       .card-three { left: 55px; bottom: 60px; }

//       .public-stats { max-width: 1160px; margin: -15px auto 0; padding: 0 28px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; position: relative; z-index: 4; }
//       .public-stats > div { background: #fff; border: 1px solid #e2ece6; border-radius: 18px; padding: 22px; box-shadow: 0 15px 40px rgba(15,91,63,.06); }
//       .public-stats b { display: block; font-size: 27px; color: var(--forest); margin-bottom: 5px; }
//       .public-stats span { color: #6d7b75; font-size: 12px; }

//       .public-section { max-width: 1240px; margin: 0 auto; padding: 110px 28px; }
//       .public-heading { max-width: 720px; margin-bottom: 40px; }
//       .public-heading h2 { margin: 12px 0 12px; font-size: clamp(32px, 4vw, 48px); line-height: 1.05; letter-spacing: -.035em; color: var(--forest-dark); }
//       .public-heading p { color: #687871; line-height: 1.7; margin: 0; }
//       .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
//       .modern-feature { min-height: 205px; padding: 25px; background: #fff; border: 1px solid #e3ebe6; border-radius: 20px; box-shadow: 0 16px 45px rgba(15,91,63,.05); transition: transform .2s ease, box-shadow .2s ease; }
//       .modern-feature:hover { transform: translateY(-4px); box-shadow: 0 24px 55px rgba(15,91,63,.10); }
//       .feature-icon { width: 43px; height: 43px; display: grid; place-items: center; border-radius: 13px; color: var(--forest); background: var(--mint); margin-bottom: 20px; }
//       .modern-feature > small { color: #9aa8a2; font-weight: 800; letter-spacing: .1em; }
//       .modern-feature h3 { margin: 6px 0 8px; font-size: 18px; }
//       .modern-feature p { color: #718078; line-height: 1.65; font-size: 13px; margin: 0; }

//       .workflow-section { padding-top: 30px; }
//       .workflow-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
//       .workflow-step { position: relative; padding-right: 25px; }
//       .workflow-number { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: var(--forest); color: #fff; font-size: 12px; font-weight: 800; position: relative; z-index: 2; }
//       .workflow-line { position: absolute; left: 44px; right: 0; top: 21px; height: 1px; background: #cfe0d5; }
//       .workflow-line i { display: block; }
//       .workflow-step h3 { margin: 22px 0 8px; font-size: 18px; }
//       .workflow-step p { color: #718078; font-size: 13px; line-height: 1.65; margin: 0; max-width: 240px; }

//       .role-band { max-width: 1184px; margin: 10px auto 80px; padding: 45px; border-radius: 28px; background: linear-gradient(135deg, #0c4b34, #14704d); color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 30px; box-shadow: 0 25px 60px rgba(15,91,63,.17); }
//       .role-band h2 { margin: 8px 0; font-size: 31px; letter-spacing: -.025em; }
//       .role-band p { margin: 0; color: #c7e4d3; max-width: 580px; line-height: 1.6; }
//       .role-pills { display: grid; grid-template-columns: repeat(2, 1fr); gap: 9px; min-width: 330px; }
//       .role-pills span { display: flex; align-items: center; gap: 7px; padding: 12px 14px; border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.08); border-radius: 12px; font-size: 12px; }

//       .modern-footer { max-width: 1184px; margin: 0 auto; padding: 28px 0 45px; border-top: 1px solid #e2ebe5; display: flex; align-items: center; justify-content: space-between; gap: 20px; color: #748079; font-size: 12px; }
//       .modern-footer p { margin: 0; }
//       .modern-footer > span { color: #98a49f; }

//       .modern-auth { min-height: calc(100vh - 85px); padding: 35px 20px 70px; background: linear-gradient(145deg, #eff8f2, #f8fbf9); }

//       .role-dashboard { display: grid; gap: 18px; }
//       .role-dashboard .welcome { min-height: 190px; }
//       .role-dashboard .welcome-art { min-width: 145px; height: 145px; border-radius: 28px; background: rgba(255,255,255,.1); display: grid; place-items: center; align-content: center; gap: 5px; color: rgba(255,255,255,.78); }
//       .welcome-art span { font-size: 10px; font-weight: 800; letter-spacing: .08em; }
//       .quick-actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 18px; }
//       .quick-actions .btn { min-height: 37px; }
//       .buyer-welcome { background: linear-gradient(135deg, #0d5a3d, #15734f 65%, #1b8058); }
//       .buyer-stats .stat small { grid-column: 2 / -1; color: #83918b; font-size: 10px; margin-top: -4px; }
//       .buyer-main-grid { grid-template-columns: 1.25fr .75fr; }
//       .buyer-stock-list { display: grid; gap: 7px; }
//       .buyer-stock-row { display: flex; align-items: center; justify-content: space-between; padding: 13px 4px; border-bottom: 1px solid #edf2ef; }
//       .buyer-stock-row:last-child { border-bottom: 0; }
//       .buyer-stock-row > span { display: flex; align-items: center; gap: 10px; }
//       .buyer-stock-row i { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; background: #edf7f0; color: #16714e; font-style: normal; }
//       .buyer-stock-row strong { font-size: 14px; color: #17372a; }
//       .buyer-stock-row strong small { color: #8a9892; font-weight: 500; }
//       .dashboard-link { border: 0; background: transparent; color: #0d704b; font-size: 12px; font-weight: 700; padding: 15px 0 0; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
//       .approval-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
//       .approval-card { text-align: left; border: 1px solid #e6eee9; background: #f8fbf9; border-radius: 15px; padding: 15px; display: grid; gap: 5px; color: #0d6a48; cursor: pointer; }
//       .approval-card:hover { border-color: #b9d7c6; background: #f0f8f3; }
//       .approval-card b { color: #143b2b; font-size: 22px; }
//       .approval-card span { color: #7a8882; font-size: 11px; }
//       .finance-highlight { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
//       .finance-highlight > div { background: #f7faf8; border: 1px solid #e5eee9; border-radius: 14px; padding: 14px; }
//       .finance-highlight small { display: block; color: #87958f; font-size: 9px; font-weight: 800; letter-spacing: .1em; }
//       .finance-highlight strong { display: block; margin-top: 7px; color: #124b35; font-size: 17px; }
//       .finance-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 13px; margin-bottom: 18px; }
//       .finance-card { background: #fff; border: 1px solid #e3ebe6; border-radius: 17px; padding: 20px; box-shadow: 0 12px 35px rgba(15,91,63,.04); }
//       .finance-card span { display: flex; align-items: center; gap: 7px; color: #6e7d76; font-size: 11px; font-weight: 700; }
//       .finance-card span svg { color: #0e7650; }
//       .finance-card b { display: block; color: #123b2b; font-size: 25px; margin: 9px 0 3px; }
//       .finance-card small { color: #89958f; }

//       @media (max-width: 900px) {
//         .modern-hero { grid-template-columns: 1fr; padding-top: 45px; }
//         .hero-visual { min-height: 390px; }
//         .feature-grid { grid-template-columns: repeat(2, 1fr); }
//         .workflow-grid { grid-template-columns: repeat(2, 1fr); gap: 35px 0; }
//         .workflow-line { display: none; }
//         .role-band { margin-left: 20px; margin-right: 20px; flex-direction: column; align-items: flex-start; }
//         .buyer-main-grid { grid-template-columns: 1fr; }
//       }
//       @media (max-width: 640px) {
//         .modern-public .public-nav { padding: 15px 17px; }
//         .modern-public .public-nav .brand small { display: none; }
//         .public-nav-actions .ghost { display: none; }
//         .modern-hero { padding: 35px 18px 55px; min-height: auto; }
//         .modern-hero h1 { font-size: 50px; }
//         .modern-hero p { font-size: 15px; }
//         .hero-visual { min-height: 320px; border-radius: 28px; }
//         .hero-tree { width: 165px; height: 165px; }
//         .hero-tree svg { width: 78px; }
//         .orbit-one { width: 270px; height: 270px; }
//         .orbit-two { width: 370px; height: 370px; }
//         .hero-floating-card { transform: scale(.84); }
//         .card-one { top: 25px; left: 0; }
//         .card-two { right: -2px; top: 130px; }
//         .card-three { left: 10px; bottom: 18px; }
//         .public-stats { grid-template-columns: repeat(2, 1fr); padding: 0 18px; }
//         .public-section { padding: 75px 18px; }
//         .feature-grid { grid-template-columns: 1fr; }
//         .workflow-grid { grid-template-columns: 1fr; }
//         .role-band { margin: 0 18px 55px; padding: 28px 22px; }
//         .role-pills { min-width: 0; width: 100%; grid-template-columns: 1fr; }
//         .modern-footer { margin: 0 18px; flex-direction: column; align-items: flex-start; padding-bottom: 30px; }
//         .finance-cards { grid-template-columns: 1fr; }
//         .approval-grid { grid-template-columns: 1fr; }
//         .finance-highlight { grid-template-columns: 1fr; }
//         .quick-actions { flex-direction: column; align-items: stretch; }
//         .quick-actions .btn { justify-content: center; }
//       }
//     `}</style>
//   );
// }

// function FormCard({ children }) { return <div className="form-card">{children}</div>; }





// import React, { useEffect, useMemo, useState } from 'react';
// import { useAuth } from './context/AuthContext';
// import API from './api/client';
// import {
//   Activity,
//   BarChart3,
//   Bell,
//   Building2,
//   CalendarCheck,
//   ChevronLeft,
//   ChevronRight,
//   ClipboardCheck,
//   DollarSign,
//   FileText,
//   LayoutDashboard,
//   LogOut,
//   Menu,
//   Package,
//   Plus,
//   RefreshCw,
//   Search,
//   Settings,
//   ShoppingCart,
//   Sprout,
//   UserCircle,
//   Users,
//   XCircle,
//   CheckCircle2,
//   MapPin,
//   UserCheck,
//   UserPlus,
//   Wallet,
//   Send,
//   Check,
//   X,
// } from 'lucide-react';
// import './App.css';

// /* ============================================================
//    RAZORPAY
//    The Razorpay secret MUST stay on the Django backend.
// ============================================================ */
// const RAZORPAY_CREATE_ORDER_ENDPOINT = 'payments/razorpay/create-order/';
// const RAZORPAY_VERIFY_ENDPOINT = 'payments/razorpay/verify/';
// const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

// /* ============================================================
//    EXPENSE CATEGORY OPTIONS
//    These values MUST match Expense.EXPENSE_CATEGORY_CHOICES
//    in Django models.py.
// ============================================================ */
// const EXPENSE_CATEGORIES = [
//   { value: 'LABOUR_WAGE', label: 'Labour Wage' },
//   { value: 'SUPERVISOR_WAGE', label: 'Supervisor Wage' },
//   { value: 'PRODUCTION', label: 'Production' },
//   { value: 'MAINTENANCE', label: 'Maintenance' },
//   { value: 'FERTILIZER', label: 'Fertilizer / Materials' },
//   { value: 'TRANSPORT', label: 'Transport' },
//   { value: 'OTHER', label: 'Other' },
// ];

// const EXPENSE_CATEGORY_LABELS = Object.fromEntries(
//   EXPENSE_CATEGORIES.map((item) => [item.value, item.label])
// );

// let razorpayScriptPromise = null;

// const loadRazorpayScript = () => {
//   if (typeof window === 'undefined') {
//     return Promise.reject(new Error('Razorpay is only available in a browser.'));
//   }

//   if (window.Razorpay) return Promise.resolve(true);
//   if (razorpayScriptPromise) return razorpayScriptPromise;

//   razorpayScriptPromise = new Promise((resolve, reject) => {
//     const existing = document.querySelector(
//       `script[src="${RAZORPAY_SCRIPT_URL}"]`
//     );

//     if (existing) {
//       existing.addEventListener('load', () => resolve(true), { once: true });
//       existing.addEventListener(
//         'error',
//         () => reject(new Error('Unable to load Razorpay Checkout.')),
//         { once: true }
//       );
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = RAZORPAY_SCRIPT_URL;
//     script.async = true;
//     script.onload = () => resolve(true);
//     script.onerror = () =>
//       reject(new Error('Unable to load Razorpay Checkout.'));
//     document.body.appendChild(script);
//   });

//   return razorpayScriptPromise;
// };

// const getApiErrorMessage = (error, fallback = 'Something went wrong.') => {
//   const data = error?.response?.data;

//   if (typeof data === 'string') return data;
//   if (data?.detail) return data.detail;
//   if (data?.message) return data.message;

//   if (data && typeof data === 'object') {
//     return Object.entries(data)
//       .map(([field, value]) => {
//         const message = Array.isArray(value)
//           ? value.join(' ')
//           : String(value);
//         return `${field}: ${message}`;
//       })
//       .join('\n');
//   }

//   return error?.message || fallback;
// };

// /* ============================================================
//     ROLES
// ============================================================ */
// const roles = {
//   admin: 'Administrator',
//   estate_owner: 'Estate Owner',
//   supervisor: 'Supervisor',
//   labour: 'Labour',
//   buyer: 'B2B Buyer',
// };

// const roleIcon = {
//   admin: Settings,
//   estate_owner: Building2,
//   supervisor: ClipboardCheck,
//   labour: Users,
//   buyer: ShoppingCart,
// };

// const today = () => new Date().toISOString().slice(0, 10);

// /* ============================================================
//     MAIN APP
// ============================================================ */
// export default function App() {
//   const { login, logout, isAuthenticated, user } = useAuth();

//   /* ==========================================================
//       AUTH
//   ========================================================== */
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [authError, setAuthError] = useState('');
//   const [authMode, setAuthMode] = useState('login'); 
//   const [showLogin, setShowLogin] = useState(false);

//   /* ==========================================================
//       DASHBOARD
//   ========================================================== */
//   const [role, setRole] = useState(null);
//   const [tab, setTab] = useState('overview');
//   const [collapsed, setCollapsed] = useState(false);
//   const [mobile, setMobile] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState(null);

//   /* ==========================================================
//       DATABASE DATA
//   ========================================================== */
//   const [estates, setEstates] = useState([]);
//   const [labour, setLabour] = useState([]);
//   const [supervisors, setSupervisors] = useState([]);
//   const [estateOwners, setEstateOwners] = useState([]);
//   const [inventory, setInventory] = useState([]);
//   const [tapping, setTapping] = useState([]);
//   const [attendance, setAttendance] = useState([]);
//   const [buyers, setBuyers] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [invoices, setInvoices] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [labourRequests, setLabourRequests] = useState([]);
//   const [supervisorRequests, setSupervisorRequests] = useState([]);
//   const [expenses, setExpenses] = useState([]);

//   /* ==========================================================
//       UI STATE
//   ========================================================== */
//   const [search, setSearch] = useState('');
//   const [estateOpen, setEstateOpen] = useState(false);
//   const [labourOpen, setLabourOpen] = useState(false);
//   const [supervisorOpen, setSupervisorOpen] = useState(false);
//   const [ownerOpen, setOwnerOpen] = useState(false);
//   const [tapOpen, setTapOpen] = useState(false);
//   const [attOpen, setAttOpen] = useState(false);
//   const [orderOpen, setOrderOpen] = useState(false);
//   const [paymentOpen, setPaymentOpen] = useState(false);
//   const [expenseOpen, setExpenseOpen] = useState(false);

//   /* ==========================================================
//       FORMS
//   ========================================================== */
//   const [estateForm, setEstateForm] = useState({
//     name: '',
//     location: '',
//     total_area: '',
//     description: '',
//     max_labour: 20,
//     max_supervisors: 2,
//     is_active: true,
//   });

//   const [labourForm, setLabourForm] = useState({
//     username: '',
//     password: '',
//     full_name: '',
//     phone: '',
//     address: '',
//     daily_wage: '',
//     account_holder_name: '',
//     bank_name: '',
//     account_number: '',
//     ifsc_code: '',
//     upi_id: '',
//   });

//   const [supervisorForm, setSupervisorForm] = useState({
//     username: '',
//     password: '',
//     full_name: '',
//     phone: '',
//   });

//   const [ownerForm, setOwnerForm] = useState({
//     username: '',
//     password: '',
//     full_name: '',
//     phone: '',
//     address: '',
//   });

//   const [tapForm, setTapForm] = useState({
//     estate: '',
//     labour: '',
//     category: 'LATEX',
//     quantity: '',
//     unit: 'LITRE',
//     assigned_block: '',
//     remarks: '',
//     date: today(),
//   });

//   const [attForm, setAttForm] = useState({
//     labour: '',
//     date: today(),
//     status: 'PRESENT',
//     assigned_block: '',
//     remarks: '',
//   });

//   const [orderForm, setOrderForm] = useState({
//     estate: '',
//     category: 'LATEX',
//     quantity: '',
//   });
// const [paymentForm, setPaymentForm] = useState({
//   invoice: '',
//   amount: '',
//   payment_method: 'RAZORPAY',
//   transaction_id: '',
//   remarks: '',
// });
//   const [razorpayProcessing, setRazorpayProcessing] = useState(false);

//   const [expenseForm, setExpenseForm] = useState({
//     estate: '',
//     category: '',
//     amount: '',
//     description: '',
//     expense_date: today(),
//   });

//   const [requestMessage, setRequestMessage] = useState('');

//   const [reg, setReg] = useState({
//     username: '',
//     password: '',
//     full_name: '',
//     phone: '',
//     address: '',
//     company_name: '',
//     email: '',
//     gst_number: '',
//   });
//   const [regStatus, setRegStatus] = useState('');

//   /* ==========================================================
//       TOAST
//   ========================================================== */
//   const notify = (type, msg) => {
//     setToast({ type, msg });
//     clearTimeout(window.__toast);
//     window.__toast = setTimeout(() => {
//       setToast(null);
//     }, 3500);
//   };

//   /* ==========================================================
//       GET USER ROLE
//   ========================================================== */
//   useEffect(() => {
//     if (!isAuthenticated) {
//       setRole(null);
//       return;
//     }
//     API.get('user-role/')
//       .then((res) => {
//         setRole(res.data.role || null);
//       })
//       .catch(() => {
//         setRole(null);
//       });
//   }, [isAuthenticated]);

//   const isAdmin = role === 'admin';
//   const isOwner = role === 'estate_owner';
//   const isSupervisor = role === 'supervisor';
//   const isBuyer = role === 'buyer';
//   const isLabour = role === 'labour';

//   /* ==========================================================
//       ROLE BASED TABS
//   ========================================================== */
//   const tabs = isAdmin
//     ? [
//         ['overview', 'Dashboard', LayoutDashboard],
//         ['estates', 'Estates', Building2],
//         ['estate-owners', 'Estate Owners', UserPlus],
//         ['buyers', 'Buyers', UserCircle],
//         ['labour', 'Labour', Users],
//         ['supervisors', 'Supervisors', ClipboardCheck],
//         ['tapping', 'Tapping & Production', Sprout],
//         ['inventory', 'Inventory', Package],
//         ['payroll', 'Payroll & Payments', DollarSign],
//         ['orders', 'B2B Orders', ShoppingCart],
//         ['invoices', 'Invoices', FileText],
//         ['expenses', 'Expenses', Wallet],
//       ]
//     : isOwner
//     ? [
//         ['overview', 'Dashboard', LayoutDashboard],
//         ['estates', 'My Estates', Building2],
//         ['labour', 'Labour', Users],
//         ['supervisors', 'Supervisors', ClipboardCheck],
//         ['tapping', 'Production', Sprout],
//         ['inventory', 'Inventory', Package],
//         ['payroll', 'Payroll', DollarSign],
//         ['orders', 'Pending B2B Orders', ShoppingCart],
//         ['invoices', 'Invoices', FileText],
//         ['payments', 'Payments', DollarSign],
//         ['expenses', 'Expenses', Wallet],
//       ]
//     : isSupervisor
//     ? [
//         ['overview', 'Dashboard', LayoutDashboard],
//         ['estates', 'Estate', Building2],
//         ['labour', 'Worker Attendance', Users],
//         ['tapping', 'Yield Verification', ClipboardCheck],
//         ['inventory', 'Production Stock', Package],
//         ['orders', 'Orders', ShoppingCart],
//       ]
//     : isBuyer
//     ? [
//         ['overview', 'Dashboard', LayoutDashboard],
//         ['inventory', 'Live Stock', Package],
//         ['orders', 'My Orders', ShoppingCart],
//         ['invoices', 'Invoices & Payments', FileText],
//       ]
//     : [
//         ['overview', 'My Dashboard', LayoutDashboard],
//         ['estates', 'Find Estate', Building2],
//         ['labour', 'My Attendance', CalendarCheck],
//         ['tapping', 'My Harvest', Sprout],
//         ['payroll', 'My Wages', DollarSign],
//       ];

//   useEffect(() => {
//     if (!tabs.some((x) => x[0] === tab)) {
//       setTab('overview');
//     }
//   }, [role]);

//   /* ==========================================================
//       LOAD DATA
//   ========================================================== */
//   const load = async () => {
//     if (!isAuthenticated) return;
//     setLoading(true);
//     try {
//      const requests = [
//   API.get('estates/'),
//   API.get('labour-profiles/'),
//   API.get('inventory/'),
//   API.get('tapping-records/'),
//   API.get('attendance/'),
//   API.get('buyer-profiles/'),
//   API.get('purchase-orders/'),
//   API.get('invoices/'),
//   API.get('payments/'),
//   API.get('labour-estate-requests/'),
//   API.get('supervisor-estate-requests/'),
//   API.get('expenses/'),
// ];
//       if (isAdmin || isOwner) {
//         requests.push(API.get('supervisor-profiles/'));
//       }
//       if (isAdmin) {
//         requests.push(API.get('estate-owner-profiles/'));
//       }
//       const req = await Promise.allSettled(requests);
//       const setData = (result, setter) => {
//         if (result?.status !== 'fulfilled') {
//           setter([]);
//           return;
//         }
//         const data = result.value?.data;
//         if (Array.isArray(data)) {
//           setter(data);
//         } else if (Array.isArray(data?.results)) {
//           setter(data.results);
//         } else {
//           setter([]);
//         }
//       };
//   setData(req[0], setEstates);
// setData(req[1], setLabour);
// setData(req[2], setInventory);
// setData(req[3], setTapping);
// setData(req[4], setAttendance);
// setData(req[5], setBuyers);
// setData(req[6], setOrders);
// setData(req[7], setInvoices);
// setData(req[8], setPayments);
// setData(req[9], setLabourRequests);
// setData(req[10], setSupervisorRequests);
// setData(req[11], setExpenses);
//       if (isAdmin || isOwner) {
//         setData(req[12], setSupervisors);
//       } else {
//         setSupervisors([]);
//       }
//       if (isAdmin) {
//         setData(req[13], setEstateOwners);
//       } else {
//         setEstateOwners([]);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isAuthenticated && role) {
//       load();
//     }
//   }, [isAuthenticated, user?.id, role]);

//   /* ==========================================================
//       DEFAULT ESTATE
//   ========================================================== */
//   useEffect(() => {
//     if (!estates.length) return;
//     const firstEstate = estates[0].id;
//     setEstateDefaults(firstEstate);
//   }, [estates.length]);

//   const setEstateDefaults = (id) => {
//     setTapForm((prev) => ({
//       ...prev,
//       estate: prev.estate || id,
//     }));
//     setOrderForm((prev) => ({
//       ...prev,
//       estate: prev.estate || id,
//     }));
//     setExpenseForm((prev) => ({
//       ...prev,
//       estate: prev.estate || id,
//     }));
//   };

//   /* ==========================================================
//       SUBMIT HELPER
//   ========================================================== */
//   const submit = async (fn, successMessage) => {
//     try {
//       await fn();
//       notify('success', successMessage);
//       await load();
//     } catch (error) {
//       const data = error.response?.data;
//       let message = 'Something went wrong.';
//       if (typeof data === 'string') {
//         message = data;
//       } else if (data?.detail) {
//         message = data.detail;
//       } else if (data && typeof data === 'object') {
//         message = Object.entries(data)
//           .map(([field, value]) => {
//             const text = Array.isArray(value)
//               ? value.join(' ')
//               : String(value);
//             return `${field}: ${text}`;
//           })
//           .join('\n');
//       } else if (error.message) {
//         message = error.message;
//       }
//       notify('error', message);
//       throw error;
//     }
//   };

//   /* ==========================================================
//       LOGIN
//   ========================================================== */
//   const loginSubmit = async (e) => {
//     e.preventDefault();
//     setAuthError('');
//     try {
//       await login(username, password);
//     } catch (error) {
//       setAuthError(
//         error.response?.data?.detail ||
//           'Invalid username or password.'
//       );
//     }
//   };

//   /* ==========================================================
//       SELF REGISTRATION HANDLERS
//   ========================================================== */
//   const handleSelfRegister = async (e, roleType) => {
//     e.preventDefault();
//     setRegStatus('');
//     setAuthError('');

//     let endpoint = '';
//     let payload = {};

//     if (roleType === 'estate_owner') {
//       endpoint = 'register/estate-owner/';
//       payload = {
//         username: reg.username.trim(),
//         password: reg.password,
//         full_name: reg.full_name.trim(),
//         phone: reg.phone.trim(),
//         address: reg.address.trim(),
//       };
//     } else if (roleType === 'supervisor') {
//       endpoint = 'register/supervisor/';
//       payload = {
//         username: reg.username.trim(),
//         password: reg.password,
//         full_name: reg.full_name.trim(),
//         phone: reg.phone.trim(),
//       };
//     } else if (roleType === 'labour') {
//       endpoint = 'register/labour/';
//       payload = {
//         username: reg.username.trim(),
//         password: reg.password,
//         full_name: reg.full_name.trim(),
//         phone: reg.phone.trim(),
//         address: reg.address.trim(),
//         daily_wage: reg.daily_wage ? Number(reg.daily_wage) : 0,
//       };
//     } else if (roleType === 'buyer') {
//       endpoint = 'register/buyer/';
//       payload = {
//         username: reg.username.trim(),
//         password: reg.password,
//         full_name: reg.full_name ? reg.full_name.trim() : reg.company_name.trim(),
//         company_name: reg.company_name.trim(),
//         phone_number: reg.phone.trim(),
//         email: reg.email ? reg.email.trim() : '',
//         address: reg.address ? reg.address.trim() : '',
//         gst_number: reg.gst_number ? reg.gst_number.trim() : '',
//       };
//     } else {
//       setAuthError('Invalid registration role.');
//       return;
//     }

//     if (!payload.username) {
//       setAuthError('Username is required.');
//       return;
//     }
//     if (!payload.password) {
//       setAuthError('Password is required.');
//       return;
//     }

//     try {
//       await API.post(endpoint, payload);
//       setRegStatus('Account created successfully! Redirecting to login...');
//       setReg({
//         username: '',
//         password: '',
//         full_name: '',
//         phone: '',
//         address: '',
//         company_name: '',
//         email: '',
//         gst_number: '',
//         daily_wage: '',
//       });
//       setTimeout(() => {
//         setAuthMode('login');
//         setRegStatus('');
//         setAuthError('');
//       }, 2000);
//     } catch (error) {
//       const errData = error.response?.data;
//       let errMsg = 'Registration failed.';
//       if (typeof errData === 'string') {
//         errMsg = errData;
//       } else if (errData && typeof errData === 'object') {
//         errMsg = Object.entries(errData)
//           .map(([key, value]) => {
//             const message = Array.isArray(value)
//               ? value.join(' ')
//               : String(value);
//             return `${key}: ${message}`;
//           })
//           .join('\n');
//       } else if (error.message) {
//         errMsg = error.message;
//       }
//       setAuthError(errMsg);
//     }
//   };

//   /* ==========================================================
//       ADMIN CREATE ESTATE OWNER
//   ========================================================== */
//   const createEstateOwner = async (e) => {
//     e.preventDefault();
//     if (
//       !ownerForm.username.trim() ||
//       !ownerForm.password.trim() ||
//       !ownerForm.full_name.trim()
//     ) {
//       notify(
//         'error',
//         'Username, password and full name are required.'
//       );
//       return;
//     }
//     try {
//       const response = await API.post(
//         'register/estate-owner/',
//         {
//           username: ownerForm.username.trim(),
//           password: ownerForm.password,
//           full_name: ownerForm.full_name.trim(),
//           phone: ownerForm.phone.trim(),
//           address: ownerForm.address.trim(),
//         }
//       );
//       notify(
//         'success',
//         `Estate Owner ${response.data.username} registered successfully.`
//       );
//       setOwnerOpen(false);
//       setOwnerForm({
//         username: '',
//         password: '',
//         full_name: '',
//         phone: '',
//         address: '',
//       });
//       await load();
//     } catch {
//       notify('error', 'Estate Owner registration failed.');
//     }
//   };

//   /* ==========================================================
//       CREATE ESTATE
//   ========================================================== */
//   const createEstate = async (e) => {
//     e.preventDefault();
//     try {
//       await submit(
//         () =>
//           API.post('estates/', {
//             name: estateForm.name,
//             location: estateForm.location,
//             total_area: Number(estateForm.total_area),
//             description: estateForm.description,
//             max_labour: Number(estateForm.max_labour),
//             max_supervisors: Number(estateForm.max_supervisors),
//             is_active: estateForm.is_active,
//           }),
//         'Estate registered successfully.'
//       );
//       setEstateOpen(false);
//       setEstateForm({
//         name: '',
//         location: '',
//         total_area: '',
//         description: '',
//         max_labour: 20,
//         max_supervisors: 2,
//         is_active: true,
//       });
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       CREATE LABOUR PROFILE
//   ========================================================== */
//   const createLabour = async (e) => {
//     e.preventDefault();
//     try {
//       await submit(
//         () =>
//           API.post('register/labour/', {
//             username: labourForm.username,
//             password: labourForm.password,
//             full_name: labourForm.full_name,
//             phone: labourForm.phone,
//             address: labourForm.address,
//             daily_wage: labourForm.daily_wage
//               ? Number(labourForm.daily_wage)
//               : 0,
//             account_holder_name: labourForm.account_holder_name,
//             bank_name: labourForm.bank_name,
//             account_number: labourForm.account_number,
//             ifsc_code: labourForm.ifsc_code,
//             upi_id: labourForm.upi_id,
//           }),
//         'Labour registered successfully.'
//       );
//       setLabourForm({
//         username: '',
//         password: '',
//         full_name: '',
//         phone: '',
//         address: '',
//         daily_wage: '',
//         account_holder_name: '',
//         bank_name: '',
//         account_number: '',
//         ifsc_code: '',
//         upi_id: '',
//       });
//       setLabourOpen(false);
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       CREATE ATTENDANCE
//   ========================================================== */
//   const createAtt = async (e) => {
//     e.preventDefault();
//     if (!attForm.labour) {
//       notify('error', 'Please select a labour.');
//       return;
//     }
//     try {
//       await submit(
//         () =>
//           API.post('attendance/', {
//             labour: Number(attForm.labour),
//             date: attForm.date,
//             status: attForm.status,
//             assigned_block: attForm.assigned_block || '',
//             remarks: attForm.remarks || '',
//           }),
//         'Attendance saved successfully.'
//       );
//       setAttOpen(false);
//       setAttForm({
//         labour: '',
//         date: today(),
//         status: 'PRESENT',
//         assigned_block: '',
//         remarks: '',
//       });
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       CREATE SUPERVISOR
//   ========================================================== */
//   const createSupervisor = async (e) => {
//     e.preventDefault();
//     if (
//       !supervisorForm.username.trim() ||
//       !supervisorForm.password.trim() ||
//       !supervisorForm.full_name.trim()
//     ) {
//       notify(
//         'error',
//         'Please fill all required supervisor fields.'
//       );
//       return;
//     }
//     try {
//       const response = await API.post(
//         'register/supervisor/',
//         {
//           username: supervisorForm.username.trim(),
//           password: supervisorForm.password,
//           full_name: supervisorForm.full_name.trim(),
//           phone: supervisorForm.phone.trim(),
//         }
//       );
//       notify(
//         'success',
//         `Supervisor ${response.data.username} created successfully.`
//       );
//       setSupervisorOpen(false);
//       setSupervisorForm({
//         username: '',
//         password: '',
//         full_name: '',
//         phone: '',
//       });
//       await load();
//     } catch {
//       notify('error', 'Supervisor creation failed.');
//     }
//   };

//   /* ==========================================================
//       CREATE TAPPING RECORD
//   ========================================================== */
// const createTap = async (e) => {
//   e.preventDefault();
  
//   if (!isLabour && !tapForm.labour) {
//     notify("error", "Please select labour before saving.");
//     return;
//   }
//   if (!isLabour && !tapForm.estate) {
//     notify('error', 'Please select an estate before saving.');
//     return;
//   }

//   const payload = {
//     date: tapForm.date,
//     category: tapForm.category,
//     quantity: tapForm.quantity ? Number(tapForm.quantity) : 0,
//     unit: tapForm.unit,
//     assigned_block: tapForm.assigned_block || '',
//     remarks: tapForm.remarks || '',
//   };

//   // Only attach estate and labour if the user is NOT a labour worker 
//   // (Labour automatically uses their own assigned estate & profile on the backend)
//   if (!isLabour) {
//     payload.labour = tapForm.labour;
//     payload.estate = tapForm.estate;
//   }

//   try {
//     await submit(
//       () => API.post('tapping-records/', payload),
//       'Tapping record created successfully.'
//     );
//     setTapOpen(false);
//     // Reset quantity and remarks
//     setTapForm((prev) => ({ ...prev, quantity: '', remarks: '', assigned_block: '' }));
//   } catch {
//     // handled by submit
//   }
// };
//   /* =========================================================
//      VERIFY YIELD / CREDIT TO INVENTORY
//   ========================================================== */
//   const verifyTap = async (id) => {
//     if (!id) {
//       notify("error", "Invalid tapping record.");
//       return;
//     }

//     try {
//       await API.post(
//         `tapping-records/${id}/credit-to-inventory/`
//       );

//       notify(
//         "success",
//         "Yield verified and added to inventory successfully."
//       );

//       await load();
//     } catch (error) {
//       notify(
//         "error",
//         error?.response?.data?.detail ||
//           "Failed to verify yield."
//       );
//     }
//   };

//   /* ==========================================================
//       CREATE ORDER
//   ========================================================== */
//   const createOrder = async (e) => {
//     e.preventDefault();

//     if (!orderForm.estate) {
//       notify("error", "Please select an estate.");
//       return;
//     }

//     if (!orderForm.quantity || Number(orderForm.quantity) <= 0) {
//       notify("error", "Please enter a valid quantity.");
//       return;
//     }

//     try {
//       await submit(
//         () =>
//           API.post("purchase-orders/", {
//             estate: Number(orderForm.estate),
//             category: orderForm.category,
//             quantity: Number(orderForm.quantity),
//           }),
//         "Purchase order placed successfully."
//       );

//       setOrderOpen(false);

//       setOrderForm({
//         estate: estates[0]?.id || "",
//         category: "LATEX",
//         quantity: "",
//       });
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       APPROVE / REJECT PURCHASE ORDER
//   ========================================================== */
//   const createPayment = async (e) => {
//     e?.preventDefault();

//     if (razorpayProcessing) return;

//     const invoiceId = Number(paymentForm.invoice);
//     const amount = Number(paymentForm.amount);

//     if (!invoiceId) {
//       notify('error', 'Please select an invoice.');
//       return;
//     }

//     if (!Number.isFinite(amount) || amount <= 0) {
//       notify('error', 'Please enter a valid payment amount.');
//       return;
//     }

//     const invoice = invoices.find(
//       (item) => Number(item.id) === invoiceId
//     );

//     if (!invoice) {
//       notify('error', 'Invoice details could not be found.');
//       return;
//     }

//     const invoiceAmount = Number(invoice.amount || 0);

//     if (
//       invoiceAmount > 0 &&
//       Math.round(amount * 100) > Math.round(invoiceAmount * 100)
//     ) {
//       notify('error', 'Payment cannot be greater than the invoice amount.');
//       return;
//     }

//     setRazorpayProcessing(true);

//     try {
//       await loadRazorpayScript();

//       if (!window.Razorpay) {
//         throw new Error('Razorpay Checkout could not be initialized.');
//       }

//       const orderResponse = await API.post(
//         RAZORPAY_CREATE_ORDER_ENDPOINT,
//         {
//           invoice: invoiceId,
//           amount,
//           currency: 'INR',
//         }
//       );

//       const orderData = orderResponse?.data || {};
//       const keyId =
//         orderData.key_id ||
//         orderData.razorpay_key_id ||
//         import.meta.env?.VITE_RAZORPAY_KEY_ID;

//       const razorpayOrderId =
//         orderData.order_id || orderData.razorpay_order_id;

//       const orderAmount = Number(
//         orderData.amount || Math.round(amount * 100)
//       );

//       const currency = orderData.currency || 'INR';

//       if (!keyId) {
//         throw new Error(
//           'Razorpay public key was not returned by the backend.'
//         );
//       }

//       if (!razorpayOrderId) {
//         throw new Error(
//           'Razorpay order ID was not returned by the backend.'
//         );
//       }

//       const buyerName =
//         orderData?.prefill?.name ||
//         invoice.buyer_name ||
//         user?.full_name ||
//         user?.username ||
//         '';

//       const buyerEmail =
//         orderData?.prefill?.email ||
//         invoice.buyer_email ||
//         user?.email ||
//         '';

//       const buyerContact =
//         orderData?.prefill?.contact ||
//         invoice.buyer_phone ||
//         user?.phone ||
//         '';

//       const checkoutOptions = {
//         key: keyId,
//         amount: orderAmount,
//         currency,
//         name:
//           orderData.name ||
//           'Rubber Estate Management System',
//         description:
//           orderData.description ||
//           `Payment for invoice ${invoice.invoice_number || `#${invoiceId}`}`,
//         order_id: razorpayOrderId,

//         prefill: {
//           name: buyerName,
//           email: buyerEmail,
//           contact: buyerContact,
//         },

//         notes: {
//           invoice_id: String(invoiceId),
//           invoice_number: String(invoice.invoice_number || ''),
//         },

//         theme: {
//           color: '#0f766e',
//         },

//         handler: async (response) => {
//           try {
//             await API.post(RAZORPAY_VERIFY_ENDPOINT, {
//               invoice: invoiceId,
//               amount,
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//             });

//             setPaymentOpen(false);
//             setPaymentForm({
//               invoice: '',
//               amount: '',
//               payment_method: 'RAZORPAY',
//               transaction_id: '',
//               remarks: '',
//             });

//             notify(
//               'success',
//               'Payment verified successfully. Invoice status updated.'
//             );

//             await load();
//           } catch (verifyError) {
//             notify(
//               'error',
//               getApiErrorMessage(
//                 verifyError,
//                 'Payment was received, but server verification failed. Please contact support.'
//               )
//             );
//           } finally {
//             setRazorpayProcessing(false);
//           }
//         },

//         modal: {
//           ondismiss: () => {
//             setRazorpayProcessing(false);
//             notify('error', 'Payment window closed. No payment was recorded.');
//           },
//         },
//       };

//       const checkout = new window.Razorpay(checkoutOptions);

//       checkout.on('payment.failed', (response) => {
//         setRazorpayProcessing(false);

//         const reason =
//           response?.error?.description ||
//           response?.error?.reason ||
//           'Razorpay payment failed.';

//         notify('error', reason);
//       });

//       checkout.open();
//     } catch (error) {
//       setRazorpayProcessing(false);
//       notify(
//         'error',
//         getApiErrorMessage(
//           error,
//           'Unable to start Razorpay payment.'
//         )
//       );
//     }
//   };

//   const approveOrder = async (id) => {
//     try {
//       await submit(
//         () => API.post(`purchase-orders/${id}/approve/`),
//         'Purchase order approved successfully.'
//       );
//     } catch {
//       // handled by submit
//     }
//   };

//   const rejectOrder = async (id) => {
//     try {
//       await submit(
//         () => API.post(`purchase-orders/${id}/reject/`),
//         'Purchase order rejected.'
//       );
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       CREATE EXPENSE
//   ========================================================== */
//   const createExpense = async (e) => {
//     e.preventDefault();
//     if (!expenseForm.estate) {
//       notify('error', 'Please select an estate.');
//       return;
//     }
//     if (!expenseForm.category) {
//       notify('error', 'Please select an expense category.');
//       return;
//     }
//     if (!EXPENSE_CATEGORY_LABELS[expenseForm.category]) {
//       notify('error', 'Please select a valid expense category.');
//       return;
//     }
//     if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
//       notify('error', 'Enter a valid expense amount.');
//       return;
//     }
//     try {
//       await submit(
//         () =>
//           API.post('expenses/', {
//             estate: Number(expenseForm.estate),
//             category: expenseForm.category,
//             amount: Number(expenseForm.amount),
//             description: expenseForm.description || '',
//             expense_date: expenseForm.expense_date,
//           }),
//         'Expense recorded successfully.'
//       );
//       setExpenseOpen(false);
//       setExpenseForm({
//         estate: estates[0]?.id || '',
//         category: '',
//         amount: '',
//         description: '',
//         expense_date: today(),
//       });
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       LABOUR REQUEST
//   ========================================================== */
//   const requestEstateAsLabour = async (estateId) => {
//     try {
//       await submit(
//         () =>
//           API.post('labour-estate-requests/', {
//             estate: Number(estateId),
//             message: requestMessage || '',
//           }),
//         'Estate request sent successfully.'
//       );
//       setRequestMessage('');
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       SUPERVISOR REQUEST
//   ========================================================== */
//   const requestEstateAsSupervisor = async (estateId) => {
//     try {
//       await submit(
//         () =>
//           API.post('supervisor-estate-requests/', {
//             estate: Number(estateId),
//             message: requestMessage || '',
//           }),
//         'Estate request sent successfully.'
//       );
//       setRequestMessage('');
//     } catch {
//       // handled by submit
//     }
//   };

//   /* ==========================================================
//       APPROVE / REJECT LABOUR REQUEST
//   ========================================================== */
//   const approveLabourRequest = async (id) => {
//     try {
//       await submit(
//         () => API.post(`labour-estate-requests/${id}/approve/`),
//         'Labour request approved.'
//       );
//     } catch {
//       // handled
//     }
//   };

//   const rejectLabourRequest = async (id) => {
//     try {
//       await submit(
//         () => API.post(`labour-estate-requests/${id}/reject/`),
//         'Labour request rejected.'
//       );
//     } catch {
//       // handled
//     }
//   };

//   /* ==========================================================
//       APPROVE / REJECT SUPERVISOR REQUEST
//   ========================================================== */
//   const approveSupervisorRequest = async (id) => {
//     try {
//       await submit(
//         () => API.post(`supervisor-estate-requests/${id}/approve/`),
//         'Supervisor request approved.'
//       );
//     } catch {
//       // handled
//     }
//   };

//   const rejectSupervisorRequest = async (id) => {
//     try {
//       await submit(
//         () => API.post(`supervisor-estate-requests/${id}/reject/`),
//         'Supervisor request rejected.'
//       );
//     } catch {
//       // handled
//     }
//   };

//   /* ==========================================================
//       STATISTICS
//   ========================================================== */
//   const stats = useMemo(
//     () => ({
//       estates: estates.length,
//       workers: labour.length,
//       supervisors: supervisors.length,
//       production: tapping.reduce(
//         (sum, item) => sum + Number(item.quantity || 0),
//         0
//       ),
//       stock: inventory.reduce(
//         (sum, item) => sum + Number(item.stock_quantity || 0),
//         0
//       ),
//       orders: orders.length,
//       unpaid: invoices.filter(
//         (item) => item.payment_status !== 'PAID'
//       ).length,
//       present: attendance.filter(
//         (item) => item.status === 'PRESENT'
//       ).length,
//       pendingLabourRequests: labourRequests.filter(
//         (item) => item.status === 'PENDING'
//       ).length,
//       pendingSupervisorRequests: supervisorRequests.filter(
//         (item) => item.status === 'PENDING'
//       ).length,
//       totalExpenses: expenses.reduce(
//         (sum, item) => sum + Number(item.amount || 0),
//         0
//       ),
//     }),
//     [
//       estates,
//       labour,
//       supervisors,
//       tapping,
//       inventory,
//       orders,
//       invoices,
//       attendance,
//       labourRequests,
//       supervisorRequests,
//       expenses,
//     ]
//   );

//   /* ==========================================================
//       PUBLIC PAGE
//   ========================================================== */
//   if (!isAuthenticated) {
//     return (
//       <Public
//         showLogin={showLogin}
//         setShowLogin={setShowLogin}
//         authMode={authMode}
//         setAuthMode={setAuthMode}
//         username={username}
//         setUsername={setUsername}
//         password={password}
//         setPassword={setPassword}
//         authError={authError}
//         loginSubmit={loginSubmit}
//         reg={reg}
//         setReg={setReg}
//         regStatus={regStatus}
//         handleSelfRegister={handleSelfRegister}
//       />
//     );
//   }

//   /* ==========================================================
//       ROLE LOADING
//   ========================================================== */
//   if (!role) {
//     return (
//       <div className="loading">
//         <Sprout size={30} />
//         <h3>Preparing your workspace</h3>
//         <p>Verifying account and role permissions...</p>
//       </div>
//     );
//   }

//   const RI = roleIcon[role] || UserCircle;

//   /* ==========================================================
//       MAIN DASHBOARD
//   ========================================================== */
//   return (
//     <div className="shell">
//       {/* SIDEBAR */}
//       <aside
//         className={
//           'sidebar ' +
//           (collapsed ? 'collapsed ' : '') +
//           (mobile ? 'mobile' : '')
//         }
//       >
//         <div className="brand">
//           <div className="logo">
//             <Sprout size={23} />
//           </div>
//           {!collapsed && (
//             <div>
//               <b>Rubber Estate</b>
//               <small>Management System</small>
//             </div>
//           )}
//         </div>
//         <div className="role">
//           <div className="role-icon">
//             <RI size={19} />
//           </div>
//           {!collapsed && (
//             <div>
//               <small>CURRENT ROLE</small>
//               <b>{roles[role]}</b>
//               <span>@{user?.username}</span>
//             </div>
//           )}
//         </div>
//         <nav>
//           <label>WORKSPACE</label>
//           {tabs.map(([id, label, Icon]) => (
//             <button
//               className={tab === id ? 'active' : ''}
//               key={id}
//               title={collapsed ? label : ''}
//               onClick={() => {
//                 setTab(id);
//                 setMobile(false);
//               }}
//             >
//               <Icon size={18} />
//               {!collapsed && label}
//             </button>
//           ))}
//         </nav>
//         {!collapsed && (
//           <div className="side-bottom">
//             <div className="online">
//               <Activity size={16} />
//               <span>
//                 <b>System online</b>
//                 <small>Django • MySQL</small>
//               </span>
//             </div>
//             <button onClick={logout}>
//               <LogOut size={17} />
//               Sign out
//             </button>
//           </div>
//         )}
//       </aside>

//       {/* MAIN */}
//       <main className="main">
//         {/* TOP BAR */}
//         <header className="top">
//           <div className="top-left">
//             <button
//               className="icon mobile-only"
//               onClick={() => setMobile(!mobile)}
//             >
//               <Menu size={19} />
//             </button>
//             <button
//               className="icon desktop-only"
//               onClick={() => setCollapsed(!collapsed)}
//             >
//               {collapsed ? (
//                 <ChevronRight size={18} />
//               ) : (
//                 <ChevronLeft size={18} />
//               )}
//             </button>
//             <div>
//               <small>
//                 RUBBER ESTATE / {roles[role].toUpperCase()}
//               </small>
//               <h1>
//                 {tabs.find((x) => x[0] === tab)?.[1]}
//               </h1>
//             </div>
//           </div>
//           <div className="top-actions">
//             <button className="icon" onClick={load}>
//               <RefreshCw
//                 size={17}
//                 className={loading ? 'spin' : ''}
//               />
//             </button>
//             <button className="icon notification">
//               <Bell size={17} />
//               <i />
//             </button>
//             <div className="user">
//               <span>
//                 {(user?.username || 'U')[0].toUpperCase()}
//               </span>
//               <b>{user?.username}</b>
//               <small>{roles[role]}</small>
//             </div>
//             <button
//               className="icon logout"
//               onClick={logout}
//             >
//               <LogOut size={17} />
//             </button>
//           </div>
//         </header>

//         {/* CONTENT */}
//         <section className="content">
//           {tab === 'overview' && (
//             <Dashboard
//               role={role}
//               user={user}
//               stats={stats}
//               estates={estates}
//               inventory={inventory}
//               orders={orders}
//               invoices={invoices}
//               tapping={tapping}
//               expenses={expenses}
//               setTab={setTab}
//             />
//           )}
//           {tab === 'estates' && (
//             <Estates
//               estates={estates}
//               estateOpen={estateOpen}
//               setEstateOpen={setEstateOpen}
//               estateForm={estateForm}
//               setEstateForm={setEstateForm}
//               createEstate={createEstate}
//               isAdmin={isAdmin}
//               isOwner={isOwner}
//               isLabour={isLabour}
//               isSupervisor={isSupervisor}
//               labourRequests={labourRequests}
//               supervisorRequests={supervisorRequests}
//               requestEstateAsLabour={requestEstateAsLabour}
//               requestEstateAsSupervisor={requestEstateAsSupervisor}
//               approveLabourRequest={approveLabourRequest}
//               rejectLabourRequest={rejectLabourRequest}
//               approveSupervisorRequest={approveSupervisorRequest}
//               rejectSupervisorRequest={rejectSupervisorRequest}
//               requestMessage={requestMessage}
//               setRequestMessage={setRequestMessage}
//             />
//           )}
//           {tab === 'estate-owners' && isAdmin && (
//             <EstateOwners
//               estateOwners={estateOwners}
//               ownerOpen={ownerOpen}
//               setOwnerOpen={setOwnerOpen}
//               ownerForm={ownerForm}
//               setOwnerForm={setOwnerForm}
//               createEstateOwner={createEstateOwner}
//             />
//           )}

// {tab === 'buyers' && (isAdmin || isOwner) && (
//   <Buyers buyers={buyers} />
// )}
//           {tab === 'labour' && (
//             <Labours
//               labour={labour}
//               attendance={attendance}
//               search={search}
//               setSearch={setSearch}
//               labourOpen={labourOpen}
//               setLabourOpen={setLabourOpen}
//               labourForm={labourForm}
//               setLabourForm={setLabourForm}
//               createLabour={createLabour}
//               attOpen={attOpen}
//               setAttOpen={setAttOpen}
//               attForm={attForm}
//               setAttForm={setAttForm}
//               createAtt={createAtt}
//               isLabour={isLabour}
//               isAdmin={isAdmin}
//               isOwner={isOwner}
//               isSupervisor={isSupervisor}
//             />
//           )}
//           {tab === 'supervisors' && (
//             <Supervisors
//               supervisors={supervisors}
//               supervisorOpen={supervisorOpen}
//               setSupervisorOpen={setSupervisorOpen}
//               supervisorForm={supervisorForm}
//               setSupervisorForm={setSupervisorForm}
//               createSupervisor={createSupervisor}
//               isAdmin={isAdmin}
//               isOwner={isOwner}
//             />
//           )}
//           {tab === 'tapping' && (
//             <Tapping
//               tapping={tapping}
//               labour={labour}
//               estates={estates}
//               tapOpen={tapOpen}
//               setTapOpen={setTapOpen}
//               tapForm={tapForm}
//               setTapForm={setTapForm}
//               createTap={createTap}
//               verifyTap={verifyTap}
//               isLabour={isLabour}
//               isSupervisor={isSupervisor}
//               isAdmin={isAdmin}
//               isOwner={isOwner}
//               user={user}
//             />
//           )}
//           {tab === 'inventory' && (
//             <Inventory inventory={inventory} />
//           )}
//           {tab === 'payroll' && (
//             <Payroll
//               labour={labour}
//               attendance={attendance}
//               isLabour={isLabour}
//               user={user}
//             />
//           )}
//           {tab === 'orders' && (
//             <Orders
//               orders={orders}
//               estates={estates}
//               orderOpen={orderOpen}
//               setOrderOpen={setOrderOpen}
//               orderForm={orderForm}
//               setOrderForm={setOrderForm}
//               createOrder={createOrder}
//               isBuyer={isBuyer}
//               user={user}
//               role={role}
//               approveOrder={approveOrder}
//               rejectOrder={rejectOrder}
//             />
//           )}
//           {tab === 'invoices' && (
//             <Invoices
//               invoices={invoices}
//               payments={payments}
//               isBuyer={isBuyer}
//               isOwner={isOwner}
//               paymentOpen={paymentOpen}
//               setPaymentOpen={setPaymentOpen}
//               paymentForm={paymentForm}
//               setPaymentForm={setPaymentForm}
//               createPayment={createPayment}
//               razorpayProcessing={razorpayProcessing}
//             />
//           )}
//           {tab === 'payments' && isOwner && (
//             <OwnerPayments payments={payments} />
//           )}
//           {tab === 'expenses' && (
//             <Expenses
//               expenses={expenses}
//               estates={estates}
//               expenseOpen={expenseOpen}
//               setExpenseOpen={setExpenseOpen}
//               expenseForm={expenseForm}
//               setExpenseForm={setExpenseForm}
//               createExpense={createExpense}
//             />
//           )}
//         </section>
//       </main>

//       {/* TOAST */}
//       {toast && (
//         <div className={'toast ' + toast.type}>
//           {toast.type === 'success' ? (
//             <CheckCircle2 size={18} />
//           ) : (
//             <XCircle size={18} />
//           )}
//           <span>{toast.msg}</span>
//           <button onClick={() => setToast(null)}>×</button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ============================================================
//     PUBLIC PAGE (FRONT PAGE + SELF REGISTRATION)
// ============================================================ */
// function Public(p) {
//   return (
//     <div className="public" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f7f9f7 0%, #eef6f0 45%, #f4eff8 100%)' }}>
//       <header>
//         <div className="brand">
//           <div className="logo">
//             <Sprout size={23} />
//           </div>
//           <div>
//             <b>Rubber Estate</b>
//             <small>Management System</small>
//           </div>
//         </div>
//         <div>
//           <button
//             className="btn ghost"
//             onClick={() => {
//               p.setShowLogin(true);
//               p.setAuthMode('login');
//             }}
//           >
//             Login
//           </button>
//           <button
//             className="btn primary"
//             onClick={() => {
//               p.setShowLogin(true);
//               p.setAuthMode('register-owner');
//             }}
//           >
//             Create Account
//           </button>
//         </div>
//       </header>

//       {!p.showLogin ? (
//         <div className="hero">
//           <span className="badge">
//             <Sprout size={14} />
//             DIGITAL ESTATE OPERATIONS
//           </span>
//           <h1>
//             Rubber Estate Management
//             <br />
//             <em>Smart management for modern rubber estates, workers, production and sales.</em>
//           </h1>
//           <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
//             <button
//               className="btn primary big"
//               onClick={() => {
//                 p.setShowLogin(true);
//                 p.setAuthMode('login');
//               }}
//             >
//               Login
//               <ChevronRight size={17} />
//             </button>
//             <button
//               className="btn secondary big"
//               onClick={() => {
//                 p.setShowLogin(true);
//                 p.setAuthMode('register-owner');
//               }}
//             >
//               Create Account
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="auth">
//           <div className={`auth-card ${p.authMode === 'login' ? 'login-mode' : 'register-mode'}`} style={{ maxWidth: '440px' }}>
//             <div className="auth-icon">
//               <Sprout size={23} />
//             </div>
//             <h2>
//               {p.authMode === 'login'
//                 ? 'Welcome back'
//                 : 'Register Workspace Account'}
//             </h2>
//             {p.authMode !== 'login' && (
//               <div className="auth-role-switch">
//                 {[
//                   ['register-owner', 'Estate Owner'],
//                   ['register-supervisor', 'Supervisor'],
//                   ['register-labour', 'Labour'],
//                   ['register-buyer', 'Buyer'],
//                 ].map(([mode, label]) => {
//                   const selected = p.authMode === mode;
//                   return (
//                     <button
//                       key={mode}
//                       type="button"
//                       className={`auth-role-option ${selected ? 'selected' : ''}`}
//                       onClick={() => p.setAuthMode(mode)}
//                     >
//                       <span className="auth-role-dot" aria-hidden="true" />
//                       <span>{label}</span>
//                     </button>
//                   );
//                 })}
//               </div>
//             )}

//             {p.authError && <Alert type="error" text={p.authError} />}
//             {p.regStatus && <Alert type="success" text={p.regStatus} />}

//             {p.authMode === 'login' ? (
//               <form onSubmit={p.loginSubmit}>
//                 <Field l="Username">
//                   <input
//                     className="input"
//                     value={p.username}
//                     onChange={(e) => p.setUsername(e.target.value)}
//                     required
//                   />
//                 </Field>
//                 <Field l="Password">
//                   <input
//                     className="input"
//                     type="password"
//                     value={p.password}
//                     onChange={(e) => p.setPassword(e.target.value)}
//                     required
//                   />
//                 </Field>
//                 <button className="btn primary full">Sign in</button>
//               </form>
//             ) : p.authMode === 'register-owner' ? (
//               <form onSubmit={(e) => p.handleSelfRegister(e, 'estate_owner')}>
//                 <Field l="Full Name">
//                   <input
//                     className="input"
//                     value={p.reg.full_name}
//                     onChange={(e) => p.setReg({ ...p.reg, full_name: e.target.value })}
//                     required
//                   />
//                 </Field>
//                 <Field l="Phone">
//                   <input
//                     className="input"
//                     value={p.reg.phone}
//                     onChange={(e) => p.setReg({ ...p.reg, phone: e.target.value })}
//                   />
//                 </Field>
//                 <Field l="Address">
//                   <textarea
//                     className="input"
//                     value={p.reg.address}
//                     onChange={(e) => p.setReg({ ...p.reg, address: e.target.value })}
//                   />
//                 </Field>
//                 <Field l="Username">
//                   <input
//                     className="input"
//                     value={p.reg.username}
//                     onChange={(e) => p.setReg({ ...p.reg, username: e.target.value })}
//                     required
//                   />
//                 </Field>
//                 <Field l="Password">
//                   <input
//                     className="input"
//                     type="password"
//                     value={p.reg.password}
//                     onChange={(e) => p.setReg({ ...p.reg, password: e.target.value })}
//                     required
//                   />
//                 </Field>
//                 <button className="btn primary full">Create Owner Account</button>
//               </form>
//             ) : p.authMode === 'register-supervisor' ? (
//               <form onSubmit={(e) => p.handleSelfRegister(e, 'supervisor')}>
//                 <Field l="Full Name">
//                   <input
//                     className="input"
//                     value={p.reg.full_name}
//                     onChange={(e) => p.setReg({ ...p.reg, full_name: e.target.value })}
//                     required
//                   />
//                 </Field>
//                 <Field l="Phone">
//                   <input
//                     className="input"
//                     value={p.reg.phone}
//                     onChange={(e) => p.setReg({ ...p.reg, phone: e.target.value })}
//                   />
//                 </Field>
//                 <Field l="Username">
//                   <input
//                     className="input"
//                     value={p.reg.username}
//                     onChange={(e) => p.setReg({ ...p.reg, username: e.target.value })}
//                     required
//                   />
//                 </Field>
//                 <Field l="Password">
//                   <input
//                     className="input"
//                     type="password"
//                     value={p.reg.password}
//                     onChange={(e) => p.setReg({ ...p.reg, password: e.target.value })}
//                     required
//                   />
//                 </Field>
//                 <button className="btn primary full">Create Supervisor Account</button>
//               </form>
//             ) : p.authMode === 'register-labour' ? (
//               <form onSubmit={(e) => p.handleSelfRegister(e, 'labour')}>
//                 <Field l="Full Name">
//                   <input
//                     className="input"
//                     value={p.reg.full_name}
//                     onChange={(e) => p.setReg({ ...p.reg, full_name: e.target.value })}
//                     required
//                   />
//                 </Field>
//                 <Field l="Phone">
//                   <input
//                     className="input"
//                     value={p.reg.phone}
//                     onChange={(e) => p.setReg({ ...p.reg, phone: e.target.value })}
//                   />
//                 </Field>
//                 <Field l="Daily Wage (₹)">
//                   <input
//                     className="input"
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={p.reg.daily_wage || ''}
//                     onChange={(e) => p.setReg({ ...p.reg, daily_wage: e.target.value })}
//                     placeholder="Enter daily wage rate"
//                     required
//                   />
//                 </Field>
//                 <Field l="Username">
//                   <input
//                     className="input"
//                     value={p.reg.username}
//                     onChange={(e) => p.setReg({ ...p.reg, username: e.target.value })}
//                     required
//                   />
//                 </Field>
//                 <Field l="Password">
//                   <input
//                     className="input"
//                     type="password"
//                     value={p.reg.password}
//                     onChange={(e) => p.setReg({ ...p.reg, password: e.target.value })}
//                     required
//                   />
//                 </Field>
//                 <button className="btn primary full">Create Labour Account</button>
//               </form>
//             ) : (
//               <form onSubmit={(e) => p.handleSelfRegister(e, 'buyer')}>
//                 <Field l="Full Name">
//                   <input
//                     className="input"
//                     value={p.reg.full_name}
//                     onChange={(e) => p.setReg({ ...p.reg, full_name: e.target.value })}
//                     required
//                   />
//                 </Field>
//                 <Field l="Company Name">
//                   <input
//                     className="input"
//                     value={p.reg.company_name}
//                     onChange={(e) => p.setReg({ ...p.reg, company_name: e.target.value })}
//                     required
//                   />
//                 </Field>
//                 <Field l="Phone">
//                   <input
//                     className="input"
//                     value={p.reg.phone}
//                     onChange={(e) => p.setReg({ ...p.reg, phone: e.target.value })}
//                   />
//                 </Field>
//                 <Field l="Email">
//                   <input
//                     className="input"
//                     type="email"
//                     value={p.reg.email}
//                     onChange={(e) => p.setReg({ ...p.reg, email: e.target.value })}
//                   />
//                 </Field>
//                 <Field l="GST Number">
//                   <input
//                     className="input"
//                     value={p.reg.gst_number}
//                     onChange={(e) => p.setReg({ ...p.reg, gst_number: e.target.value })}
//                   />
//                 </Field>
//                 <Field l="Address">
//                   <textarea
//                     className="input"
//                     value={p.reg.address}
//                     onChange={(e) => p.setReg({ ...p.reg, address: e.target.value })}
//                   />
//                 </Field>
//                 <Field l="Username">
//                   <input
//                     className="input"
//                     value={p.reg.username}
//                     onChange={(e) => p.setReg({ ...p.reg, username: e.target.value })}
//                     required
//                   />
//                 </Field>
//                 <Field l="Password">
//                   <input
//                     className="input"
//                     type="password"
//                     value={p.reg.password}
//                     onChange={(e) => p.setReg({ ...p.reg, password: e.target.value })}
//                     required
//                   />
//                 </Field>
//                 <button className="btn primary full">Create Buyer Account</button>
//               </form>
//             )}

//             <button
//               className="back"
//               onClick={() => p.setShowLogin(false)}
//             >
//               ← Back to home
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function Feature({ n, t, d }) {
//   return (
//     <div className="feature">
//       <small>{n}</small>
//       <b>{t}</b>
//       <span>{d}</span>
//     </div>
//   );
// }

// function Alert({ type, text }) {
//   return (
//     <div className={'alert ' + type}>
//       {type === 'success' ? (
//         <CheckCircle2 size={16} />
//       ) : (
//         <XCircle size={16} />
//       )}
//       <span style={{ whiteSpace: 'pre-line' }}>{text}</span>
//     </div>
//   );
// }

// function Field({ l, children }) {
//   return (
//     <label className="field">
//       <span>{l}</span>
//       {children}
//     </label>
//   );
// }

// function Head({ title, desc, icon: Icon = LayoutDashboard, children }) {
//   return (
//     <div className="section-head">
//       <div className="section-title">
//         <div>
//           <Icon size={20} />
//         </div>
//         <span>
//           <h2>{title}</h2>
//           <p>{desc}</p>
//         </span>
//       </div>
//       {children}
//     </div>
//   );
// }

// function Card({ children }) {
//   return <div className="card">{children}</div>;
// }

// function Button({ children, onClick, secondary = false }) {
//   return (
//     <button
//       className={'btn ' + (secondary ? 'secondary' : 'primary')}
//       onClick={onClick}
//       type="button"
//     >
//       {children}
//     </button>
//   );
// }

// function Status({ s = 'PENDING' }) {
//   return (
//     <span className={'status ' + String(s).toLowerCase()}>
//       {String(s).replaceAll('_', ' ')}
//     </span>
//   );
// }

// function Empty({ text = 'No records found.' }) {
//   return (
//     <div className="empty">
//       <Package size={20} />
//       {text}
//     </div>
//   );
// }

// function Table({ cols, rows }) {
//   return (
//     <div className="table">
//       <table>
//         <thead>
//           <tr>
//             {cols.map((column) => (
//               <th key={column}>{column}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {rows.length ? (
//             rows.map((row, i) => (
//               <tr key={i}>
//                 {row.map((cell, j) => (
//                   <td key={j}>{cell}</td>
//                 ))}
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={cols.length}>
//                 <Empty />
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// function Dashboard({
//   role,
//   user,
//   stats,
//   estates,
//   inventory,
//   orders,
//   invoices,
//   tapping,
//   expenses,
//   setTab,
// }) {
//   const data =
//     role === 'labour'
//       ? [
//           ['Present days', stats.present, CalendarCheck],
//           ['Harvest', stats.production.toFixed(1), Sprout],
//         ]
//       : role === 'estate_owner'
//       ? [
//           ['My estates', stats.estates, Building2],
//           ['Labour', stats.workers, Users],
//           ['Supervisors', stats.supervisors, ClipboardCheck],
//           ['Production', stats.production.toFixed(1), Sprout],
//           ['Expenses', `₹${stats.totalExpenses.toFixed(0)}`, Wallet],
//         ]
//       : [
//           ['Estates', stats.estates, Building2],
//           ['Labour force', stats.workers, Users],
//           ['Production', stats.production.toFixed(1), Sprout],
//         ];

//   return (
//     <>
//       <div className="welcome">
//         <div>
//           <small>GOOD TO SEE YOU</small>
//           <h2>Hello, {user?.username} </h2>
//           <p>
//             {roles[role]} workspace — monitor operations from one place.
//           </p>
//         </div>
//         <Sprout size={70} />
//       </div>
//       <div className="stats">
//         {data.map(([title, value, Icon]) => (
//           <div className="stat" key={title}>
//             <div>
//               <Icon size={20} />
//             </div>
//             <span>{title}</span>
//             <b>{value}</b>
//           </div>
//         ))}
//       </div>
//       <div className="dash-grid">
//         <Card>
//           <PanelTitle
//             t="Production overview"
//             I={BarChart3}
//             action={() => setTab('tapping')}
//           />
//           <Bars data={tapping} />
//         </Card>
//         <Card>
//           <PanelTitle t="Operations summary" I={Activity} />
//           <div className="summary">
//             <Row i={ShoppingCart} t="B2B orders" v={stats.orders} />
//             <Row i={FileText} t="Unpaid invoices" v={stats.unpaid} />
//             <Row i={Users} t="Present today" v={stats.present} />
//           </div>
//         </Card>
//       </div>
//     </>
//   );
// }

// function PanelTitle({ t, I, action }) {
//   return (
//     <div className="panel-title">
//       <span>
//         <I size={17} />
//         <b>{t}</b>
//       </span>
//       {action && (
//         <button onClick={action}>
//           View <ChevronRight size={13} />
//         </button>
//       )}
//     </div>
//   );
// }

// function Row({ i: I, t, v }) {
//   return (
//     <div className="sumrow">
//       <span>
//         <I size={16} />
//         {t}
//       </span>
//       <b>{v}</b>
//     </div>
//   );
// }

// function Bars({ data }) {
//   const grouped = {};
//   data.forEach((item) => {
//     const category = item.category || 'OTHER';
//     grouped[category] =
//       (grouped[category] || 0) + Number(item.quantity || 0);
//   });
//   const values = Object.entries(grouped);
//   if (!values.length) {
//     return <Empty text="Add tapping records to see production." />;
//   }
//   const max = Math.max(...values.map((x) => x[1]), 1);
//   return (
//     <div className="bars">
//       {values.slice(0, 6).map(([category, value]) => (
//         <div key={category}>
//           <small>{value.toFixed(1)}</small>
//           <span>
//             <i
//               style={{
//                 height: `${Math.max(8, (value / max) * 100)}%`,
//               }}
//             />
//           </span>
//           <label>{category}</label>
//         </div>
//       ))}
//     </div>
//   );
// }

// function EstateOwners({
//   estateOwners,
//   ownerOpen,
//   setOwnerOpen,
//   ownerForm,
//   setOwnerForm,
//   createEstateOwner,
// }) {
//   return (
//     <div>
//       <Head
//         title="Estate owners"
//         desc="Register and manage estate owner accounts."
//         icon={UserPlus}
//       >
//         <Button onClick={() => setOwnerOpen(!ownerOpen)}>
//           <Plus size={16} />
//           {ownerOpen ? 'Close' : 'Register owner'}
//         </Button>
//       </Head>

//       {ownerOpen && (
//         <FormCard>
//           <form onSubmit={createEstateOwner} className="form-grid">
//             <Field l="Username">
//               <input
//                 className="input"
//                 value={ownerForm.username}
//                 onChange={(e) =>
//                   setOwnerForm({ ...ownerForm, username: e.target.value })
//                 }
//                 required
//               />
//             </Field>
//             <Field l="Password">
//               <input
//                 className="input"
//                 type="password"
//                 value={ownerForm.password}
//                 onChange={(e) =>
//                   setOwnerForm({ ...ownerForm, password: e.target.value })
//                 }
//                 required
//               />
//             </Field>
//             <Field l="Full name">
//               <input
//                 className="input"
//                 value={ownerForm.full_name}
//                 onChange={(e) =>
//                   setOwnerForm({ ...ownerForm, full_name: e.target.value })
//                 }
//                 required
//               />
//             </Field>
//             <Field l="Phone">
//               <input
//                 className="input"
//                 type="tel"
//                 value={ownerForm.phone}
//                 onChange={(e) =>
//                   setOwnerForm({ ...ownerForm, phone: e.target.value })
//                 }
//               />
//             </Field>
//             <Field l="Address">
//               <textarea
//                 className="input"
//                 value={ownerForm.address}
//                 onChange={(e) =>
//                   setOwnerForm({ ...ownerForm, address: e.target.value })
//                 }
//               />
//             </Field>
//             <div className="form-actions">
//               <button type="submit" className="btn primary">
//                 <UserPlus size={16} />
//                 Register Estate Owner
//               </button>
//             </div>
//           </form>
//         </FormCard>
//       )}

//       <Table
//         cols={['Owner', 'Username', 'Phone', 'Address', 'Created']}
//         rows={estateOwners.map((item) => [
//           item.full_name || item.username || '—',
//           item.username || '—',
//           item.phone || '—',
//           item.address || '—',
//           item.created_at
//             ? new Date(item.created_at).toLocaleDateString()
//             : '—',
//         ])}
//       />
//     </div>
//   );
// }
// /* ============================================================
//     BUYERS MANAGEMENT
// ============================================================ */
// function Buyers({ buyers }) {
//   return (
//     <div>
//       <Head
//         title="Registered Buyers"
//         desc="View and manage wholesale buyer profiles and approval status."
//         icon={UserCircle}
//       />
//       <Table
//         cols={['Company Name', 'Username', 'Email', 'Phone', 'GST Number', 'Approved']}
//         rows={buyers.map((item) => [
//           <b key={item.id}>{item.company_name || '—'}</b>,
//           item.username || '—',
//           item.email || '—',
//           item.phone_number || '—',
//           item.gst_number || '—',
//           <Status key={`buyer-status-${item.id}`} s={item.is_approved ? 'APPROVED' : 'PENDING'} />,
//         ])}
//       />
//       {!buyers.length && <Empty text="No registered buyers found." />}
//     </div>
//   );
// }

// function Estates({
//   estates,
//   estateOpen,
//   setEstateOpen,
//   estateForm,
//   setEstateForm,
//   createEstate,
//   isAdmin,
//   isOwner,
//   isLabour,
//   isSupervisor,
//   labourRequests,
//   supervisorRequests,
//   requestEstateAsLabour,
//   requestEstateAsSupervisor,
//   approveLabourRequest,
//   rejectLabourRequest,
//   approveSupervisorRequest,
//   rejectSupervisorRequest,
//   requestMessage,
//   setRequestMessage,
// }) {
//   return (
//     <div>
//       <Head
//         title={isLabour || isSupervisor ? 'Find an estate' : isOwner ? 'My estates' : 'Estate management'}
//         desc="Manage estate locations, capacities and memberships."
//         icon={Building2}
//       >
//         {(isAdmin || isOwner) && (
//           <Button onClick={() => setEstateOpen(!estateOpen)}>
//             <Plus size={16} />
//             {estateOpen ? 'Close' : 'Add estate'}
//           </Button>
//         )}
//       </Head>

//       {estateOpen && (isAdmin || isOwner) && (
//         <FormCard>
//           <form onSubmit={createEstate} className="form-grid">
//             <Field l="Estate name">
//               <input className="input" value={estateForm.name} onChange={(e) => setEstateForm({ ...estateForm, name: e.target.value })} required />
//             </Field>
//             <Field l="Location">
//               <input className="input" value={estateForm.location} onChange={(e) => setEstateForm({ ...estateForm, location: e.target.value })} required />
//             </Field>
//             <Field l="Total area (acres)">
//               <input className="input" type="number" step="0.01" value={estateForm.total_area} onChange={(e) => setEstateForm({ ...estateForm, total_area: e.target.value })} required />
//             </Field>
//             <Field l="Maximum labour">
//               <input className="input" type="number" value={estateForm.max_labour} onChange={(e) => setEstateForm({ ...estateForm, max_labour: e.target.value })} required />
//             </Field>
//             <Field l="Maximum supervisors">
//               <input className="input" type="number" value={estateForm.max_supervisors} onChange={(e) => setEstateForm({ ...estateForm, max_supervisors: e.target.value })} required />
//             </Field>
//             <Field l="Description">
//               <textarea className="input" value={estateForm.description} onChange={(e) => setEstateForm({ ...estateForm, description: e.target.value })} />
//             </Field>
//             <button type="submit" className="btn primary">Save estate</button>
//           </form>
//         </FormCard>
//       )}

//       {(isLabour || isSupervisor) && (
//         <Card>
//           <Field l="Request message (optional)">
//             <textarea className="input" value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} placeholder="Tell the estate owner why you want to join..." rows="3" />
//           </Field>
//         </Card>
//       )}

//       <div className="estate-grid">
//         {estates.map((estate) => {
//           const labourCount = Number(estate.labour_count ?? 0);
//           const supervisorCount = Number(estate.supervisor_count ?? 0);
//           const maxLabour = Number(estate.max_labour ?? 0);
//           const maxSupervisors = Number(estate.max_supervisors ?? 0);
//           const labourSlots = Math.max(maxLabour - labourCount, 0);
//           const supervisorSlots = Math.max(maxSupervisors - supervisorCount, 0);

//           const labourRequest = labourRequests.find((item) => String(item.estate) === String(estate.id));
//           const supervisorRequest = supervisorRequests.find((item) => String(item.estate) === String(estate.id));

//           return (
//             <Card key={estate.id}>
//               <div className="estate-icon"><Sprout size={21} /></div>
//               <h3>{estate.name}</h3>
//               <p><MapPin size={13} />{estate.location || 'Location not specified'}</p>
//               <div className="metrics">
//                 <span>AREA <b>{estate.total_area || 0} ac</b></span>
//                 <span>LABOUR <b>{labourCount}/{maxLabour}</b></span>
//                 <span>SUPERVISORS <b>{supervisorCount}/{maxSupervisors}</b></span>
//               </div>
//               <div className="estate-capacity"><small>Labour slots: {labourSlots}</small><small>Supervisor slots: {supervisorSlots}</small></div>

//               {isLabour && (
//                 <div className="request-action">
//                   {labourRequest ? <Status s={labourRequest.status} /> : (
//                     <Button secondary={labourSlots <= 0} onClick={() => labourSlots > 0 && requestEstateAsLabour(estate.id)}>
//                       <Send size={15} /> {labourSlots <= 0 ? 'Full' : 'Request to join'}
//                     </Button>
//                   )}
//                 </div>
//               )}

//               {isSupervisor && (
//                 <div className="request-action">
//                   {supervisorRequest ? <Status s={supervisorRequest.status} /> : (
//                     <Button secondary={supervisorSlots <= 0} onClick={() => supervisorSlots > 0 && requestEstateAsSupervisor(estate.id)}>
//                       <Send size={15} /> {supervisorSlots <= 0 ? 'Full' : 'Request to join'}
//                     </Button>
//                   )}
//                 </div>
//               )}
//             </Card>
//           );
//         })}
//       </div>

//       {(isOwner || isAdmin) && (
//         <div className="dash-grid">
//           <Card>
//             <PanelTitle t="Labour requests" I={UserPlus} />
//             {labourRequests.length ? (
//               <Table cols={['Labour', 'Estate', 'Status', 'Action']} rows={labourRequests.map((item) => [item.labour_name || '—', item.estate_name || '—', <Status key={item.id} s={item.status} />, item.status === 'PENDING' ? (<div className="actions" key={item.id}><button className="btn primary" onClick={() => approveLabourRequest(item.id)}><Check size={14} /> Approve</button><button className="btn secondary" onClick={() => rejectLabourRequest(item.id)}><X size={14} /> Reject</button></div>) : '—'])} />
//             ) : <Empty text="No labour requests." />}
//           </Card>
//           <Card>
//             <PanelTitle t="Supervisor requests" I={UserCheck} />
//             {supervisorRequests.length ? (
//               <Table cols={['Supervisor', 'Estate', 'Status', 'Action']} rows={supervisorRequests.map((item) => [item.supervisor_name || '—', item.estate_name || '—', <Status key={item.id} s={item.status} />, item.status === 'PENDING' ? (<div className="actions" key={item.id}><button className="btn primary" onClick={() => approveSupervisorRequest(item.id)}><Check size={14} /> Approve</button><button className="btn secondary" onClick={() => rejectSupervisorRequest(item.id)}><X size={14} /> Reject</button></div>) : '—'])} />
//             ) : <Empty text="No supervisor requests." />}
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// }

// function Labours({ labour, attendance, search, setSearch, labourOpen, setLabourOpen, labourForm, setLabourForm, createLabour, attOpen, setAttOpen, attForm, setAttForm, createAtt, isLabour, isSupervisor }) {
//   const rows = labour.filter((item) => `${item.full_name || ''} ${item.phone || ''}`.toLowerCase().includes(search.toLowerCase()));
//   return (
//     <div>
//       <Head title={isLabour ? 'My attendance' : 'Labour management'} desc="Manage worker profiles and attendance tracking." icon={Users}>
//         {!isLabour && <Button onClick={() => setLabourOpen(!labourOpen)}><Plus size={16} />{labourOpen ? 'Close' : 'Add worker'}</Button>}
//       </Head>
//       {!isLabour && (
//         <>
//           <div className="toolbar"><div className="search"><Search size={16} /><input type="text" placeholder="Search workers..." value={search} onChange={(e) => setSearch(e.target.value)} /></div></div>
//           {labourOpen && (
//             <FormCard>
//               <form onSubmit={createLabour} className="form-grid">
//                 <Field l="Username"><input className="input" value={labourForm.username || ''} onChange={(e) => setLabourForm({ ...labourForm, username: e.target.value })} required /></Field>
//                 <Field l="Password"><input className="input" type="password" value={labourForm.password || ''} onChange={(e) => setLabourForm({ ...labourForm, password: e.target.value })} required /></Field>
//                 <Field l="Full name"><input className="input" value={labourForm.full_name || ''} onChange={(e) => setLabourForm({ ...labourForm, full_name: e.target.value })} required /></Field>
//                 <Field l="Phone"><input className="input" value={labourForm.phone || ''} onChange={(e) => setLabourForm({ ...labourForm, phone: e.target.value })} /></Field>
//                 <Field l="Address"><textarea className="input" value={labourForm.address || ''} onChange={(e) => setLabourForm({ ...labourForm, address: e.target.value })} /></Field>
//                 <Field l="Daily wage"><input className="input" type="number" step="0.01" value={labourForm.daily_wage || ''} onChange={(e) => setLabourForm({ ...labourForm, daily_wage: e.target.value })} /></Field>
//                 <button type="submit" className="btn primary">Save worker</button>
//               </form>
//             </FormCard>
//           )}
//           <Table cols={['Worker', 'Phone', 'Estate', 'Daily wage', 'Status']} rows={rows.map((item) => [<b>{item.full_name || item.username}</b>, item.phone || '—', item.estate_name || 'Not assigned', `₹${Number(item.daily_wage || 0).toFixed(2)}`, <Status key={item.id} s={item.estate ? 'ACTIVE' : 'PENDING'} />])} />
//         </>
//       )}
//       {isLabour && <Table cols={['Date', 'Status', 'Block', 'Remarks']} rows={attendance.map((item) => [item.date, <Status key={item.id} s={item.status} />, item.assigned_block || '—', item.remarks || '—'])} />}
//       {!isLabour && isSupervisor && <div className="toolbar"><Button secondary onClick={() => setAttOpen(!attOpen)}><CalendarCheck size={16} />{attOpen ? 'Close' : 'Record attendance'}</Button></div>}
//       {!isLabour && attOpen && (
//         <FormCard>
//           <form onSubmit={createAtt} className="form-grid">
//             <Field l="Labour"><select className="input" value={attForm.labour} onChange={(e) => setAttForm({ ...attForm, labour: e.target.value })} required><option value="">Select labour</option>{labour.map((item) => <option key={item.user || item.id} value={item.user || item.id}>{item.full_name || item.username}</option>)}</select></Field>
//             <Field l="Date"><input className="input" type="date" value={attForm.date} onChange={(e) => setAttForm({ ...attForm, date: e.target.value })} required /></Field>
//             <Field l="Status"><select className="input" value={attForm.status} onChange={(e) => setAttForm({ ...attForm, status: e.target.value })}><option value="PRESENT">PRESENT</option><option value="ABSENT">ABSENT</option><option value="HALF_DAY">HALF DAY</option></select></Field>
//             <Field l="Block"><input className="input" value={attForm.assigned_block} onChange={(e) => setAttForm({ ...attForm, assigned_block: e.target.value })} /></Field>
//             <Field l="Remarks"><textarea className="input" value={attForm.remarks} onChange={(e) => setAttForm({ ...attForm, remarks: e.target.value })} /></Field>
//             <button type="submit" className="btn primary">Save attendance</button>
//           </form>
//         </FormCard>
//       )}
//     </div>
//   );
// }

// /* ============================================================
//     SUPERVISORS
// ============================================================ */
// function Supervisors({
//   supervisors,
//   supervisorOpen,
//   setSupervisorOpen,
//   supervisorForm,
//   setSupervisorForm,
//   createSupervisor,
//   isAdmin,
//   isOwner,
// }) {
//   return (
//     <div>
//       <Head
//         title="Supervisor management"
//         desc={
//           isAdmin
//             ? 'Create supervisor accounts. Supervisors can request an estate after registration.'
//             : 'View supervisors assigned to your estates.'
//         }
//         icon={ClipboardCheck}
//       >
//         {isAdmin && (
//           <Button onClick={() => setSupervisorOpen(!supervisorOpen)}>
//             <Plus size={16} />
//             {supervisorOpen ? 'Close' : 'Add supervisor'}
//           </Button>
//         )}
//       </Head>

//       {isAdmin && supervisorOpen && (
//         <FormCard>
//           <form onSubmit={createSupervisor} className="form-grid">
//             <Field l="Full name">
//               <input
//                 className="input"
//                 value={supervisorForm.full_name}
//                 onChange={(e) =>
//                   setSupervisorForm({
//                     ...supervisorForm,
//                     full_name: e.target.value,
//                   })
//                 }
//                 required
//               />
//             </Field>
//             <Field l="Username">
//               <input
//                 className="input"
//                 value={supervisorForm.username}
//                 onChange={(e) =>
//                   setSupervisorForm({
//                     ...supervisorForm,
//                     username: e.target.value,
//                   })
//                 }
//                 required
//               />
//             </Field>
//             <Field l="Password">
//               <input
//                 className="input"
//                 type="password"
//                 value={supervisorForm.password}
//                 onChange={(e) =>
//                   setSupervisorForm({
//                     ...supervisorForm,
//                     password: e.target.value,
//                   })
//                 }
//                 required
//               />
//             </Field>
//             <Field l="Phone">
//               <input
//                 className="input"
//                 value={supervisorForm.phone}
//                 onChange={(e) =>
//                   setSupervisorForm({
//                     ...supervisorForm,
//                     phone: e.target.value,
//                   })
//                 }
//               />
//             </Field>
//             <button type="submit" className="btn primary">
//               Create supervisor
//             </button>
//           </form>
//         </FormCard>
//       )}

//       {/* ALLOW BOTH ADMIN AND ESTATE OWNER TO SEE THE TABLE */}
//       {(isAdmin || isOwner) && (
//         <Table
//           cols={['Supervisor', 'Username', 'Phone', 'Estate', 'Status']}
//           rows={supervisors.map((item) => [
//             <b key={item.id}>{item.full_name || 'Supervisor'}</b>,
//             item.username || '—',
//             item.phone || '—',
//             item.estate_name || item.estate || 'Not assigned',
//             <Status
//               key={`status-${item.id}`}
//               s={item.estate ? 'ACTIVE' : 'PENDING'}
//             />,
//           ])}
//         />
//       )}
//     </div>
//   );
// }function Tapping({ tapping, labour, estates, tapOpen, setTapOpen, tapForm, setTapForm, createTap, verifyTap, isLabour, user }) {
//   const rows = isLabour ? tapping.filter((item) => String(item.labour) === String(user?.id)) : tapping;

//   return (
//     <div>
//       <Head title="Tapping & production" desc="Verify and track rubber output." icon={Sprout}>
//         <Button onClick={() => setTapOpen(!tapOpen)}>
//           <Plus size={16} />
//           {tapOpen ? 'Close' : 'New record'}
//         </Button>
//       </Head>

//       {tapOpen && (
//         <FormCard>
//           <form onSubmit={createTap} className="form-grid">
//             {/* Estate selection is only required for Admins, Owners, and Supervisors */}
//             {!isLabour && (
//               <Field l="Estate">
//                 <select className="input" value={tapForm.estate} onChange={(e) => setTapForm({ ...tapForm, estate: e.target.value })} required>
//                   <option value="">Select estate</option>
//                   {estates.map((e) => (
//                     <option key={e.id} value={e.id}>{e.name}</option>
//                   ))}
//                 </select>
//               </Field>
//             )}

//             {/* Labour selection is only required for Admins, Owners, and Supervisors */}
//             {!isLabour && (
//               <Field l="Labour">
//                 <select className="input" value={tapForm.labour} onChange={(e) => setTapForm({ ...tapForm, labour: e.target.value })} required>
//                   <option value="">Select labour</option>
//                   {labour.map((l) => (
//                     <option key={l.user || l.id} value={l.user || l.id}>{l.full_name || l.username}</option>
//                   ))}
//                 </select>
//               </Field>
//             )}

//             <Field l="Category">
//               <select className="input" value={tapForm.category} onChange={(e) => setTapForm({ ...tapForm, category: e.target.value })}>
//                 <option value="LATEX">LATEX</option>
//                 <option value="SHEET">SHEET</option>
//                 <option value="SCRAP">SCRAP</option>
//               </select>
//             </Field>

//             <Field l="Quantity">
//               <input className="input" type="number" step="0.01" value={tapForm.quantity} onChange={(e) => setTapForm({ ...tapForm, quantity: e.target.value })} required />
//             </Field>

//             <Field l="Unit">
//               <select className="input" value={tapForm.unit} onChange={(e) => setTapForm({ ...tapForm, unit: e.target.value })}>
//                 <option value="LITRE">LITRE</option>
//                 <option value="KG">KG</option>
//               </select>
//             </Field>

//             <Field l="Date">
//               <input className="input" type="date" value={tapForm.date} onChange={(e) => setTapForm({ ...tapForm, date: e.target.value })} required />
//             </Field>

//             <Field l="Block">
//               <input className="input" value={tapForm.assigned_block} onChange={(e) => setTapForm({ ...tapForm, assigned_block: e.target.value })} />
//             </Field>

//             <Field l="Remarks">
//               <textarea className="input" value={tapForm.remarks} onChange={(e) => setTapForm({ ...tapForm, remarks: e.target.value })} />
//             </Field>

//             <button type="submit" className="btn primary">Save record</button>
//           </form>
//         </FormCard>
//       )}

//       <Table 
//         cols={['Date', 'Worker', 'Category', 'Quantity', 'Status', 'Action']} 
//         rows={rows.map((item) => [
//           item.date, 
//           item.labour_name || '—', 
//           item.category, 
//           `${item.quantity} ${item.unit}`, 
//           <Status key={item.id} s={item.is_verified ? 'VERIFIED' : 'PENDING'} />, 
//           !item.is_verified && !isLabour ? (
//             <button key={item.id} className="btn primary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => verifyTap(item.id)}>
//               Verify
//             </button>
//           ) : '—'
//         ])} 
//       />
//     </div>
//   );
// }

// function Inventory({ inventory }) {
//   return (
//     <div>
//       <Head
//         title="Live Stock"
//         desc="View current stock available across all estates."
//         icon={Package}
//       />

//       <Table
//         cols={['Estate', 'Product', 'Available Stock', 'Unit', 'Unit Price']}
//         rows={inventory.map((item) => [
//           item.estate_name || item.estate?.name || '—',
//           item.category || '—',
//           item.stock_quantity ?? 0,
//           item.unit || 'KG',
//           `₹${item.unit_price ?? 0}`,
//         ])}
//       />

//       {!inventory.length && (
//         <Empty text="No live stock available." />
//       )}
//     </div>
//   );
// }

// function Payroll({ labour, attendance, isLabour, user }) {
//   const visibleLabour = isLabour ? labour.filter((w) => String(w.user) === String(user?.id)) : labour;
//   const rows = visibleLabour.map((worker) => {
//     const workerAtt = attendance.filter((i) => String(i.labour) === String(worker.user));
//     const present = workerAtt.filter((i) => i.status === 'PRESENT').length;
//     const half = workerAtt.filter((i) => i.status === 'HALF_DAY').length;
//     const wages = present * Number(worker.daily_wage || 0) + half * Number(worker.daily_wage || 0) * 0.5;
//     return [worker.full_name || worker.username, present, half, `₹${wages.toFixed(2)}`, <Status key={worker.id} s={present || half ? 'READY' : 'PENDING'} />];
//   });
//   return <div><Head title="Payroll" desc="Wage oversight." icon={DollarSign} /><Table cols={['Worker', 'Present', 'Half-day', 'Wages', 'Status']} rows={rows} /></div>;
// }

// function Orders({ orders, estates, orderOpen, setOrderOpen, orderForm, setOrderForm, createOrder, isBuyer, role, approveOrder, rejectOrder }) {
//   const canApprove = role === 'admin' || role === 'estate_owner';
//   const visible = isBuyer
//     ? orders
//     : orders;

//   return (
//     <div>
//       <Head
//         title={isBuyer ? 'My Orders' : 'B2B Orders'}
//         desc={isBuyer ? 'Create and track wholesale orders.' : 'Review and manage wholesale orders.'}
//         icon={ShoppingCart}
//       >
//         {isBuyer && (
//           <Button onClick={() => setOrderOpen(!orderOpen)}>
//             <Plus size={16} />
//             {orderOpen ? 'Close' : 'New order'}
//           </Button>
//         )}
//       </Head>

//       {isBuyer && orderOpen && (
//         <FormCard>
//           <form onSubmit={createOrder} className="form-grid">
//             <Field l="Estate">
//               <select
//                 className="input"
//                 value={orderForm.estate}
//                 onChange={(e) => setOrderForm({ ...orderForm, estate: e.target.value })}
//                 required
//               >
//                 <option value="">Select estate</option>
//                 {estates.map((e) => (
//                   <option key={e.id} value={e.id}>{e.name}</option>
//                 ))}
//               </select>
//             </Field>

//             <Field l="Product">
//               <select
//                 className="input"
//                 value={orderForm.category}
//                 onChange={(e) => setOrderForm({ ...orderForm, category: e.target.value })}
//               >
//                 <option value="LATEX">LATEX</option>
//                 <option value="SHEET">SHEET</option>
//                 <option value="SCRAP">SCRAP</option>
//               </select>
//             </Field>

//             <Field l="Quantity">
//               <input
//                 className="input"
//                 type="number"
//                 step="0.01"
//                 min="0.01"
//                 value={orderForm.quantity}
//                 onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
//                 required
//               />
//             </Field>

//             <button type="submit" className="btn primary">
//               <Send size={15} /> Place order
//             </button>
//           </form>
//         </FormCard>
//       )}

//       <Table
//         cols={['Order', 'Buyer', 'Estate', 'Product', 'Qty', 'Total', 'Status', 'Action']}
//         rows={visible.map((item) => [
//           `#${item.id}`,
//           item.buyer_company || item.buyer_name || item.buyer_username || '—',
//           item.estate_name || '—',
//           item.category || '—',
//           `${item.quantity || 0}`,
//           `₹${Number(item.total_price || 0).toFixed(2)}`,
//           <Status key={`status-${item.id}`} s={item.status} />,
//           canApprove && String(item.status).toUpperCase() === 'PENDING' ? (
//             <div className="actions" key={`actions-${item.id}`}>
//               <button
//                 type="button"
//                 className="btn primary"
//                 style={{ padding: '4px 10px', fontSize: '12px' }}
//                 onClick={() => approveOrder(item.id)}
//               >
//                 <Check size={14} /> Approve
//               </button>
//               <button
//                 type="button"
//                 className="btn secondary"
//                 style={{ padding: '4px 10px', fontSize: '12px', marginLeft: '6px' }}
//                 onClick={() => rejectOrder(item.id)}
//               >
//                 <X size={14} /> Reject
//               </button>
//             </div>
//           ) : '—',
//         ])}
//       />
//     </div>
//   );
// }

// function Invoices({ invoices, payments, isBuyer, isOwner, paymentOpen, setPaymentOpen, paymentForm, setPaymentForm, createPayment, razorpayProcessing }) {
//   const payableInvoices = invoices.filter(
//     (invoice) => String(invoice.payment_status).toUpperCase() !== 'PAID'
//   );

//   return (
//     <div>
//       <RazorpayPaymentStyles />
//       <Head
//         title={isBuyer ? 'Invoices & Payments' : 'Invoices'}
//         desc={
//           isBuyer
//             ? 'Track invoices and record payments.'
//             : 'View invoices generated for buyers purchasing from your estates.'
//         }
//         icon={FileText}
//       >
//         {isBuyer && payableInvoices.length > 0 && (
//           <Button
//             onClick={() => setPaymentOpen(!paymentOpen)}
//             disabled={razorpayProcessing}
//           >
//             <DollarSign size={16} />
//             {paymentOpen ? 'Close' : 'Pay with Razorpay'}
//           </Button>
//         )}
//       </Head>

//       {isBuyer && paymentOpen && payableInvoices.length > 0 && (
//         <FormCard>
//           <form onSubmit={createPayment} className="form-grid">
//             <Field l="Invoice">
//               <select
//                 className="input"
//                 value={paymentForm.invoice}
//                 onChange={(e) => {
//                   const selected = payableInvoices.find(
//                     (i) => String(i.id) === String(e.target.value)
//                   );

//                   setPaymentForm({
//                     ...paymentForm,
//                     invoice: e.target.value,
//                     amount: selected
//                       ? String(selected.amount || '')
//                       : '',
//                   });
//                 }}
//                 required
//                 disabled={razorpayProcessing}
//               >
//                 <option value="">Select invoice</option>
//                 {payableInvoices.map((invoice) => (
//                   <option key={invoice.id} value={invoice.id}>
//                     {invoice.invoice_number} — ₹
//                     {Number(invoice.amount || 0).toFixed(2)} —{' '}
//                     {invoice.payment_status}
//                   </option>
//                 ))}
//               </select>
//             </Field>

//             <Field l="Amount">
//               <input
//                 className="input"
//                 type="number"
//                 step="0.01"
//                 min="0.01"
//                 value={paymentForm.amount}
//                 onChange={(e) =>
//                   setPaymentForm({
//                     ...paymentForm,
//                     amount: e.target.value,
//                   })
//                 }
//                 required
//                 disabled={razorpayProcessing}
//               />
//             </Field>

//             <div className="payment-secure-note">
//               <div className="payment-secure-icon">
//                 <Check size={16} />
//               </div>
//               <div>
//                 <strong>Secure payment with Razorpay</strong>
//                 <span>
//                   You will use Razorpay Checkout to pay securely using
//                   the payment methods enabled on your Razorpay account.
//                 </span>
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="btn primary"
//               disabled={
//                 razorpayProcessing ||
//                 !paymentForm.invoice ||
//                 !paymentForm.amount
//               }
//             >
//               <DollarSign size={15} />
//               {razorpayProcessing
//                 ? 'Opening secure checkout...'
//                 : 'Pay securely with Razorpay'}
//             </button>
//           </form>
//         </FormCard>
//       )}

//       <Table
//         cols={['Invoice', 'Order', 'Buyer', 'Amount', 'Status', 'Issued']}
//         rows={invoices.map((invoice) => [
//           invoice.invoice_number || '—',
//           `#${invoice.order_number || invoice.order || '—'}`,
//           invoice.buyer_name || '—',
//           `₹${Number(invoice.amount || 0).toFixed(2)}`,
//           <Status key={`invoice-status-${invoice.id}`} s={invoice.payment_status} />,
//           invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString() : '—',
//         ])}
//       />

//       {isBuyer && payments.length > 0 && (
//         <div style={{ marginTop: '24px' }}>
//           <Head title="Payment History" desc="Recorded invoice payments." icon={DollarSign} />
//           <Table
//             cols={['Invoice', 'Buyer', 'Amount', 'Method', 'Transaction', 'Status', 'Date']}
//             rows={payments.map((payment) => [
//               payment.invoice_number || `#${payment.invoice || '—'}`,
//               payment.buyer_name || '—',
//               `₹${Number(payment.amount || 0).toFixed(2)}`,
//               payment.payment_method || '—',
//               payment.transaction_id || '—',
//               <Status key={`payment-status-${payment.id}`} s={payment.status} />,
//               payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '—',
//             ])}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// function OwnerPayments({ payments }) {
//   const successfulPayments = payments.filter(
//     (payment) => String(payment.status || '').toUpperCase() === 'SUCCESS'
//   );

//   const totalIncome = successfulPayments.reduce(
//     (sum, payment) => sum + Number(payment.amount || 0),
//     0
//   );

//   return (
//     <div>
//       <Head
//         title="Buyer Payments"
//         desc="Payments received from buyers for orders belonging to your estates."
//         icon={DollarSign}
//       />

//       <div className="stats" style={{ marginBottom: '20px' }}>
//         <div className="stat">
//           <div><DollarSign size={20} /></div>
//           <span>Total income</span>
//           <b>₹{totalIncome.toFixed(2)}</b>
//         </div>
//         <div className="stat">
//           <div><CheckCircle2 size={20} /></div>
//           <span>Successful payments</span>
//           <b>{successfulPayments.length}</b>
//         </div>
//       </div>

//       <Table
//         cols={['Invoice', 'Buyer', 'Amount', 'Method', 'Transaction', 'Status', 'Date']}
//         rows={payments.map((payment) => [
//           payment.invoice_number || `#${payment.invoice || '—'}`,
//           payment.buyer_name || '—',
//           `₹${Number(payment.amount || 0).toFixed(2)}`,
//           payment.payment_method || '—',
//           payment.transaction_id || '—',
//           <Status key={`owner-payment-status-${payment.id}`} s={payment.status} />,
//           payment.payment_date
//             ? new Date(payment.payment_date).toLocaleDateString()
//             : '—',
//         ])}
//       />

//       {!payments.length && <Empty text="No buyer payments received yet." />}
//     </div>
//   );
// }

// function Expenses({ expenses, estates, expenseOpen, setExpenseOpen, expenseForm, setExpenseForm, createExpense }) {
//   const updateExpenseField = (field, value) => {
//     setExpenseForm((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   return (
//     <div>
//       <Head
//         title="Expenses"
//         desc="Monitor operating costs."
//         icon={Wallet}
//       >
//         <Button onClick={() => setExpenseOpen(!expenseOpen)}>
//           <Plus size={16} />
//           {expenseOpen ? 'Close' : 'Add expense'}
//         </Button>
//       </Head>

//       {expenseOpen && (
//         <FormCard>
//           <form onSubmit={createExpense} className="form-grid">
//             <Field l="Estate">
//               <select
//                 className="input"
//                 value={expenseForm.estate || ''}
//                 onChange={(e) => updateExpenseField('estate', e.target.value)}
//                 required
//               >
//                 <option value="">Select estate</option>
//                 {estates.map((estate) => (
//                   <option key={estate.id} value={estate.id}>
//                     {estate.name}
//                   </option>
//                 ))}
//               </select>
//             </Field>

//             <Field l="Category">
//               <select
//                 className="input"
//                 value={expenseForm.category || ''}
//                 onChange={(e) => updateExpenseField('category', e.target.value)}
//                 required
//               >
//                 <option value="">Select category</option>
//                 {EXPENSE_CATEGORIES.map((category) => (
//                   <option key={category.value} value={category.value}>
//                     {category.label}
//                   </option>
//                 ))}
//               </select>
//             </Field>

//             <Field l="Amount">
//               <input
//                 className="input"
//                 type="number"
//                 min="0.01"
//                 step="0.01"
//                 value={expenseForm.amount || ''}
//                 onChange={(e) => updateExpenseField('amount', e.target.value)}
//                 placeholder="0.00"
//                 required
//               />
//             </Field>

//             <Field l="Date">
//               <input
//                 className="input"
//                 type="date"
//                 value={expenseForm.expense_date || today()}
//                 onChange={(e) => updateExpenseField('expense_date', e.target.value)}
//                 required
//               />
//             </Field>

//             <Field l="Description">
//               <textarea
//                 className="input"
//                 value={expenseForm.description || ''}
//                 onChange={(e) => updateExpenseField('description', e.target.value)}
//                 placeholder="Optional description"
//                 rows={3}
//               />
//             </Field>

//             <div className="form-actions">
//               <button type="submit" className="btn primary">
//                 Save expense
//               </button>
//             </div>
//           </form>
//         </FormCard>
//       )}

//       <Table
//         cols={['Estate', 'Category', 'Amount', 'Date']}
//         rows={expenses.map((item) => [
//           item.estate_name,
//           EXPENSE_CATEGORY_LABELS[item.category] || item.category || '—',
//           `₹${Number(item.amount || 0).toFixed(2)}`,
//           item.expense_date,
//         ])}
//       />
//     </div>
//   );
// }

// function RazorpayPaymentStyles() {
//   return (
//     <style>{`
//       .payment-secure-note {
//         grid-column: 1 / -1;
//         display: flex;
//         align-items: flex-start;
//         gap: 12px;
//         padding: 14px 16px;
//         border: 1px solid rgba(15, 118, 110, 0.16);
//         border-radius: 12px;
//         background: rgba(15, 118, 110, 0.04);
//       }

//       .payment-secure-icon {
//         width: 30px;
//         height: 30px;
//         flex: 0 0 30px;
//         display: grid;
//         place-items: center;
//         border-radius: 50%;
//         background: rgba(15, 118, 110, 0.12);
//         color: #0f766e;
//       }

//       .payment-secure-note strong,
//       .payment-secure-note span {
//         display: block;
//       }

//       .payment-secure-note strong {
//         margin-bottom: 3px;
//         font-size: 13px;
//       }

//       .payment-secure-note span {
//         color: #64748b;
//         font-size: 12px;
//         line-height: 1.5;
//       }

//       .btn:disabled,
//       button:disabled {
//         opacity: 0.6;
//         cursor: not-allowed;
//       }
//     `}</style>
//   );
// }

// function FormCard({ children }) { return <div className="form-card">{children}</div>; }