
import React, { useEffect, useState } from "react";
import API from "../api/client";
import "../styles/Overview.css";

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getArray = (data) =>
  Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];

const getStatus = (item) =>
  String(item.status ?? item.order_status ?? "PENDING")
    .toUpperCase();

const getOrderNumber = (order) =>
  order.order_number ??
  order.order_no ??
  `ORD-${order.id ?? "—"}`;

const getBuyerName = (order) => {
  const buyer = order.buyer;

  if (buyer && typeof buyer === "object") {
    return (
      buyer.company_name ||
      buyer.full_name ||
      buyer.username ||
      buyer.name ||
      "Buyer"
    );
  }

  return order.buyer_name ?? order.company_name ?? "B2B Buyer";
};

const getStockQuantity = (item) =>
  Number(
    item.available_quantity ??
      item.stock_quantity ??
      item.quantity ??
      0
  );

const getInvoiceAmount = (invoice) =>
  Number(
    invoice.total_amount ??
      invoice.amount_due ??
      invoice.total ??
      invoice.amount ??
      0
  );

const getPaidAmount = (invoice) =>
  Number(
    invoice.amount_paid ??
      invoice.paid_amount ??
      invoice.paid_total ??
      0
  );

const isInvoicePaid = (invoice) =>
  ["PAID", "COMPLETED", "SETTLED"].includes(
    String(
      invoice.payment_status ??
        invoice.status ??
        ""
    ).toUpperCase()
  );

const getErrorStatus = (error) =>
  error?.response?.status;

export default function Overview() {
  const [userRole, setUserRole] = useState("");

  const [data, setData] = useState({
    estates: [],
    labour: [],
    inventory: [],
    tapping: [],
    attendance: [],
    orders: [],
    invoices: [],
    expenses: [],
    buyers: [],
    payroll: [],
    payments: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = async (role = userRole) => {
    setLoading(true);
    setError("");

    const isBuyer = String(role).toLowerCase() === "buyer";

    const endpoints = [
      ["estates", "estates/"],
      ["inventory", "inventory/"],
      ["orders", "purchase-orders/"],
      ["invoices", "invoices/"],

      ...(isBuyer
        ? [["payments", "payments/"]]
        : [
            ["labour", "labour-profiles/"],
            ["tapping", "tapping-records/"],
            ["attendance", "attendance/"],
            ["expenses", "expenses/"],
            ["buyers", "buyer-profiles/"],
            ["payroll", "labour-wage-payments/"],
          ]),
    ];

    try {
      const results = await Promise.allSettled(
        endpoints.map(([, endpoint]) => API.get(endpoint))
      );

      const nextData = {};
      const failedEndpoints = [];

      results.forEach((result, index) => {
        const [key, endpoint] = endpoints[index];

        if (result.status === "fulfilled") {
          nextData[key] = getArray(result.value.data);
        } else {
          nextData[key] = [];
          failedEndpoints.push(endpoint);

          console.error(
            `Dashboard request failed: ${endpoint}`,
            getErrorStatus(result.reason),
            result.reason?.response?.data ||
              result.reason?.message
          );
        }
      });

      if (isBuyer) {
        nextData.labour = [];
        nextData.tapping = [];
        nextData.attendance = [];
        nextData.expenses = [];
        nextData.buyers = [];
        nextData.payroll = [];
      }

      setData((previous) => ({
        ...previous,
        ...nextData,
      }));

      if (failedEndpoints.length === endpoints.length) {
        setError(
          "Unable to load dashboard data. Please check your login and API connection."
        );
      } else if (failedEndpoints.length > 0) {
        setError(
          `Some dashboard information could not be loaded: ${failedEndpoints.join(", ")}`
        );
      }
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initializeDashboard = async () => {
      try {
        const response = await API.get("user-role/");

        const role = String(
          response.data?.role ?? ""
        ).toLowerCase();

        if (cancelled) return;

        setUserRole(role);
        await loadOverview(role);
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Unable to load user role:",
          err?.response?.data || err?.message
        );

        setError(
          "Unable to identify your account role. Please check your login."
        );
        setLoading(false);
      }
    };

    initializeDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const isBuyer = userRole === "buyer";

  // Estate overview calculations
  const totalEstates = data.estates.length;
  const totalLabour = data.labour.length;

  const totalStock = data.inventory.reduce(
    (sum, item) => sum + getStockQuantity(item),
    0
  );

  const totalProduction = data.tapping.reduce((sum, item) => {
    const verified =
      item.is_verified === true ||
      item.verified === true ||
      String(
        item.status ?? item.verification_status ?? ""
      ).toUpperCase() === "VERIFIED";

    return verified
      ? sum + Number(item.quantity ?? 0)
      : sum;
  }, 0);

  const totalExpenses = data.expenses.reduce(
    (sum, expense) =>
      sum +
      Number(
        expense.amount ??
          expense.total_amount ??
          expense.cost ??
          0
      ),
    0
  );

  const totalPayroll = data.payroll.reduce(
    (sum, item) =>
      sum +
      Number(
        item.net_pay ??
          item.net_salary ??
          item.total_wages ??
          item.wages ??
          item.amount ??
          item.salary ??
          0
      ),
    0
  );

  // Buyer order calculations.
  // These counts assume the API returns only records the
  // logged-in buyer is authorized to see.
  const pendingStatuses = [
    "PENDING",
    "PENDING_APPROVAL",
    "AWAITING_APPROVAL",
    "PROCESSING",
  ];

  const pendingOrders = data.orders.filter((order) =>
    pendingStatuses.includes(getStatus(order))
  );

  const totalSales = data.orders
    .filter((order) =>
      [
        "APPROVED",
        "CONFIRMED",
        "PROCESSING",
        "COMPLETED",
        "DELIVERED",
      ].includes(getStatus(order))
    )
    .reduce(
      (sum, order) =>
        sum +
        Number(
          order.total_amount ??
            order.total_price ??
            order.amount ??
            0
        ),
      0
    );

  // Buyer invoice calculations.
  const outstandingInvoices = data.invoices.filter(
    (invoice) => {
      if (isInvoicePaid(invoice)) return false;

      const outstanding =
        getInvoiceAmount(invoice) -
        getPaidAmount(invoice);

      return outstanding > 0;
    }
  );

  const outstandingAmount = outstandingInvoices.reduce(
    (sum, invoice) =>
      sum +
      Math.max(
        0,
        getInvoiceAmount(invoice) -
          getPaidAmount(invoice)
      ),
    0
  );

  const paidInvoices = data.invoices.filter(isInvoicePaid);

  const completedPayments = data.payments.filter(
    (payment) =>
      ["SUCCESS", "COMPLETED", "PAID", "CAPTURED"].includes(
        String(
          payment.status ??
            payment.payment_status ??
            ""
        ).toUpperCase()
      )
  );

  const totalPaid = completedPayments.reduce(
    (sum, payment) =>
      sum +
      Number(
        payment.amount ??
          payment.amount_paid ??
          payment.total_amount ??
          0
      ),
    0
  );

  // Attendance calculation for non-buyers.
  const today = new Date();

  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const presentToday = data.attendance.filter((item) => {
    const attendanceDate =
      item.date ?? item.attendance_date;

    return (
      attendanceDate &&
      String(attendanceDate).slice(0, 10) === localToday &&
      String(
        item.status ?? item.attendance_status ?? ""
      ).toUpperCase() === "PRESENT"
    );
  }).length;

  const recentOrders = [...data.orders]
    .sort((a, b) => {
      const dateA = new Date(
        a.created_at ?? a.order_date ?? 0
      ).getTime();

      const dateB = new Date(
        b.created_at ?? b.order_date ?? 0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  const recentProduction = [...data.tapping]
    .sort((a, b) => {
      const dateA = new Date(
        a.harvest_date ??
          a.tap_date ??
          a.created_at ??
          0
      ).getTime();

      const dateB = new Date(
        b.harvest_date ??
          b.tap_date ??
          b.created_at ??
          0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <section className="overview-page">
      <header className="overview-header">
        <div>
          <p className="overview-eyebrow">
            RUBBER ESTATE MANAGEMENT
          </p>

          <h1>
            {isBuyer
              ? "Buyer Dashboard"
              : "Dashboard Overview"}
          </h1>

          <p className="overview-subtitle">
            {isBuyer
              ? "Manage your rubber purchases, orders and payments."
              : "Your estate operations at a glance."}
          </p>
        </div>

        <button
          type="button"
          className="overview-refresh-btn"
          onClick={() => loadOverview(userRole)}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      {error && (
        <div className="overview-error" role="alert">
          {error}
        </div>
      )}

      {loading &&
      data.estates.length === 0 &&
      data.orders.length === 0 &&
      data.inventory.length === 0 ? (
        <div className="overview-loading">
          Loading your dashboard...
        </div>
      ) : (
        <>
          {isBuyer ? (
            <>
              {/* BUYER DASHBOARD CARDS */}
              <div className="overview-stats">
                <article className="overview-stat-card">
                  <div className="overview-stat-top">
                    <span>Available Rubber Stock</span>
                    <div className="overview-stat-icon green">
                      ♧
                    </div>
                  </div>

                  <strong>
                    {formatNumber(totalStock)}
                  </strong>

                  <small>
                    Quantity recorded in inventory
                  </small>
                </article>

                <article className="overview-stat-card">
                  <div className="overview-stat-top">
                    <span>My Orders</span>
                    <div className="overview-stat-icon blue">
                      ▤
                    </div>
                  </div>

                  <strong>
                    {formatNumber(data.orders.length)}
                  </strong>

                  <small>
                    Orders returned for your account
                  </small>
                </article>

                <article className="overview-stat-card">
                  <div className="overview-stat-top">
                    <span>Pending Orders</span>
                    <div className="overview-stat-icon orange">
                      ◷
                    </div>
                  </div>

                  <strong>
                    {formatNumber(pendingOrders.length)}
                  </strong>

                  <small>
                    Awaiting approval or processing
                  </small>
                </article>

                <article className="overview-stat-card">
                  <div className="overview-stat-top">
                    <span>Outstanding Bills</span>
                    <div className="overview-stat-icon purple">
                      ₹
                    </div>
                  </div>

                  <strong>
                    {formatCurrency(outstandingAmount)}
                  </strong>

                  <small>
                    {outstandingInvoices.length} unpaid or
                    partially paid invoices
                  </small>
                </article>
              </div>

              {/* BUYER INVOICE AND PAYMENT SUMMARY */}
              <div className="overview-secondary-stats">
                <article className="overview-secondary-card">
                  <div>
                    <span>My Invoices</span>
                    <strong>
                      {formatNumber(data.invoices.length)}
                    </strong>
                    <small className="overview-card-note">
                      Invoices returned for your account
                    </small>
                  </div>

                  <div className="overview-secondary-icon pending">
                    ▤
                  </div>
                </article>

                <article className="overview-secondary-card">
                  <div>
                    <span>Paid Invoices</span>
                    <strong>
                      {formatNumber(paidInvoices.length)}
                    </strong>
                    <small className="overview-card-note">
                      Marked as paid
                    </small>
                  </div>

                  <div className="overview-secondary-icon attendance">
                    ✓
                  </div>
                </article>

                <article className="overview-secondary-card">
                  <div>
                    <span>Successful Payments</span>
                    <strong>
                      {formatCurrency(totalPaid)}
                    </strong>
                    <small className="overview-card-note">
                      {completedPayments.length} successful
                      payment records
                    </small>
                  </div>

                  <div className="overview-secondary-icon sales">
                    ₹
                  </div>
                </article>
              </div>
            </>
          ) : (
            <>
              {/* ADMIN / ESTATE MANAGEMENT CARDS */}
              <div className="overview-stats">
                <article className="overview-stat-card">
                  <div className="overview-stat-top">
                    <span>Registered Buyers</span>
                    <div className="overview-stat-icon blue">
                      ♙
                    </div>
                  </div>

                  <strong>
                    {formatNumber(data.buyers.length)}
                  </strong>

                  <small>Total registered buyers</small>
                </article>

                <article className="overview-stat-card">
                  <div className="overview-stat-top">
                    <span>Estates</span>
                    <div className="overview-stat-icon green">
                      ⌂
                    </div>
                  </div>

                  <strong>
                    {formatNumber(totalEstates)}
                  </strong>

                  <small>Registered estates</small>
                </article>

                <article className="overview-stat-card">
                  <div className="overview-stat-top">
                    <span>Labourers</span>
                    <div className="overview-stat-icon blue">
                      ♙
                    </div>
                  </div>

                  <strong>
                    {formatNumber(totalLabour)}
                  </strong>

                  <small>Registered workers</small>
                </article>

                <article className="overview-stat-card">
                  <div className="overview-stat-top">
                    <span>Verified Production</span>
                    <div className="overview-stat-icon purple">
                      ⚖
                    </div>
                  </div>

                  <strong>
                    {formatNumber(totalProduction)}
                  </strong>

                  <small>Recorded quantity</small>
                </article>

                <article className="overview-stat-card">
                  <div className="overview-stat-top">
                    <span>Available Stock</span>
                    <div className="overview-stat-icon orange">
                      ▤
                    </div>
                  </div>

                  <strong>
                    {formatNumber(totalStock)}
                  </strong>

                  <small>Across inventory records</small>
                </article>
              </div>

              <div className="overview-secondary-stats">
                <article className="overview-secondary-card">
                  <div>
                    <span>Pending B2B Orders</span>
                    <strong>
                      {pendingOrders.length}
                    </strong>
                  </div>

                  <div className="overview-secondary-icon pending">
                    ◷
                  </div>
                </article>

                <article className="overview-secondary-card">
                  <div>
                    <span>Present Today</span>
                    <strong>{presentToday}</strong>
                  </div>

                  <div className="overview-secondary-icon attendance">
                    ✓
                  </div>
                </article>

                <article className="overview-secondary-card">
                  <div>
                    <span>Order Value</span>
                    <strong>
                      {formatCurrency(totalSales)}
                    </strong>
                  </div>

                  <div className="overview-secondary-icon sales">
                    ₹
                  </div>
                </article>

                <article className="overview-secondary-card">
                  <div>
                    <span>Payroll</span>
                    <strong>
                      {formatCurrency(totalPayroll)}
                    </strong>
                    <small className="overview-card-note">
                      Recorded payroll total
                    </small>
                  </div>

                  <div className="overview-secondary-icon sales">
                    ₹
                  </div>
                </article>

                <article className="overview-secondary-card">
                  <div>
                    <span>Recorded Expenses</span>
                    <strong>
                      {formatCurrency(totalExpenses)}
                    </strong>
                  </div>

                  <div className="overview-secondary-icon expenses">
                    ↗
                  </div>
                </article>
              </div>
            </>
          )}

          {/* RECENT ORDERS — BUYER SEES THEIR ORDERS
              IF THE BACKEND SCOPES THE API CORRECTLY */}
          <div className="overview-panels">
            <section className="overview-panel">
              <div className="overview-panel-header">
                <div>
                  <h2>
                    {isBuyer
                      ? "My Recent Orders"
                      : "Recent B2B Orders"}
                  </h2>

                  <p>
                    {isBuyer
                      ? "Track your latest purchase orders"
                      : "Latest purchase order activity"}
                  </p>
                </div>

                <span className="overview-panel-count">
                  {data.orders.length} orders
                </span>
              </div>

              {recentOrders.length === 0 ? (
                <div className="overview-empty">
                  {isBuyer
                    ? "You have not placed any orders yet."
                    : "No orders available yet."}
                </div>
              ) : (
                <div className="overview-record-list">
                  {recentOrders.map((order, index) => {
                    const status = getStatus(order);

                    return (
                      <div
                        className="overview-record"
                        key={order.id ?? index}
                      >
                        <div className="overview-record-icon order-icon">
                          ▤
                        </div>

                        <div className="overview-record-main">
                          <strong>
                            {getOrderNumber(order)}
                          </strong>

                          <span>
                            {isBuyer
                              ? order.estate_name ??
                                order.estate?.name ??
                                "Purchase order"
                              : getBuyerName(order)}
                          </span>
                        </div>

                        <div className="overview-record-end">
                          <strong>
                            {formatCurrency(
                              order.total_amount ??
                                order.total_price ??
                                order.amount ??
                                0
                            )}
                          </strong>

                          <span
                            className={`overview-status ${status.toLowerCase()}`}
                          >
                            {status.replaceAll("_", " ")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* BUYER INVOICES */}
            {isBuyer && (
              <section className="overview-panel">
                <div className="overview-panel-header">
                  <div>
                    <h2>My Invoices</h2>
                    <p>
                      Check invoice totals and payment status
                    </p>
                  </div>

                  <span className="overview-panel-count">
                    {data.invoices.length} invoices
                  </span>
                </div>

                {data.invoices.length === 0 ? (
                  <div className="overview-empty">
                    No invoices available yet.
                  </div>
                ) : (
                  <div className="overview-record-list">
                    {data.invoices
                      .slice(0, 5)
                      .map((invoice, index) => {
                        const invoiceStatus = String(
                          invoice.payment_status ??
                            invoice.status ??
                            "PENDING"
                        ).toUpperCase();

                        const invoiceNumber =
                          invoice.invoice_number ??
                          invoice.invoice_no ??
                          `INV-${invoice.id ?? "—"}`;

                        const outstanding = Math.max(
                          0,
                          getInvoiceAmount(invoice) -
                            getPaidAmount(invoice)
                        );

                        return (
                          <div
                            className="overview-record"
                            key={invoice.id ?? index}
                          >
                            <div className="overview-record-icon order-icon">
                              ₹
                            </div>

                            <div className="overview-record-main">
                              <strong>{invoiceNumber}</strong>
                              <span>
                                {outstanding > 0
                                  ? `Due: ${formatCurrency(outstanding)}`
                                  : "No outstanding balance"}
                              </span>
                            </div>

                            <div className="overview-record-end">
                              <strong>
                                {formatCurrency(
                                  getInvoiceAmount(invoice)
                                )}
                              </strong>

                              <span
                                className={`overview-status ${invoiceStatus.toLowerCase()}`}
                              >
                                {invoiceStatus.replaceAll("_", " ")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </section>
            )}

            {/* PRODUCTION — NON-BUYER ROLES ONLY */}
            {!isBuyer && (
              <section className="overview-panel">
                <div className="overview-panel-header">
                  <div>
                    <h2>Recent Production</h2>
                    <p>
                      Latest harvest and tapping records
                    </p>
                  </div>

                  <span className="overview-panel-count">
                    {data.tapping.length} records
                  </span>
                </div>

                {recentProduction.length === 0 ? (
                  <div className="overview-empty">
                    No production records available yet.
                  </div>
                ) : (
                  <div className="overview-record-list">
                    {recentProduction.map((record, index) => {
                      const status = String(
                        record.status ??
                          record.verification_status ??
                          ""
                      ).toUpperCase();

                      const isVerified =
                        record.is_verified === true ||
                        record.verified === true ||
                        status === "VERIFIED";

                      const productionDate =
                        record.harvest_date ??
                        record.tap_date ??
                        record.created_at;

                      return (
                        <div
                          className="overview-record"
                          key={record.id ?? index}
                        >
                          <div className="overview-record-icon production-icon">
                            ♧
                          </div>

                          <div className="overview-record-main">
                            <strong>
                              {record.category ??
                                record.product_type ??
                                "Harvest"}
                            </strong>

                            <span>
                              {productionDate
                                ? new Date(
                                    productionDate
                                  ).toLocaleDateString("en-IN")
                                : "Date unavailable"}
                            </span>
                          </div>

                          <div className="overview-record-end">
                            <strong>
                              {formatNumber(record.quantity)}{" "}
                              {record.unit ?? ""}
                            </strong>

                            <span
                              className={`overview-status ${
                                isVerified
                                  ? "verified"
                                  : "pending"
                              }`}
                            >
                              {isVerified
                                ? "Verified"
                                : "Pending"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>
        </>
      )}
    </section>
  );
}
