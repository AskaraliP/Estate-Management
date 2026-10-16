
import React, { useEffect, useMemo, useState } from "react";
import API from "../api/client";
import "../styles/Invoices.css";

// ------------------------------------------------------
// HELPERS
// ------------------------------------------------------

const getAmount = (value) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

const getInvoiceTotal = (invoice) =>
  Math.max(
    0,
    getAmount(
      invoice.total_amount ??
        invoice.grand_total ??
        invoice.amount ??
        invoice.total
    )
  );

const getPaidAmount = (invoice) => {
  if (invoice.paid_amount != null) {
    return Math.max(0, getAmount(invoice.paid_amount));
  }

  const status = String(
    invoice.payment_status ?? invoice.status ?? ""
  ).toUpperCase();

  if (status === "PAID") return getInvoiceTotal(invoice);

  return 0;
};

const getPaymentStatus = (invoice) => {
  const status = String(
    invoice.payment_status ?? invoice.status ?? ""
  ).toUpperCase();

  if (status === "REFUNDED") return "REFUNDED";

  const total = getInvoiceTotal(invoice);
  const paid = getPaidAmount(invoice);

  if (total > 0 && paid >= total) return "PAID";
  if (paid > 0) return "PARTIAL";

  return "UNPAID";
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(getAmount(value));

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getBuyerName = (invoice) => {
  const buyer =
    invoice.buyer ??
    invoice.order?.buyer ??
    invoice.purchase_order?.buyer;

  if (buyer && typeof buyer === "object") {
    return (
      buyer.company_name ??
      buyer.full_name ??
      buyer.username ??
      buyer.name ??
      "Buyer"
    );
  }

  return (
    invoice.buyer_name ??
    invoice.company_name ??
    invoice.order?.buyer_name ??
    "—"
  );
};

const getInvoiceNumber = (invoice) =>
  invoice.invoice_number ??
  invoice.number ??
  `INV-${invoice.id ?? "UNKNOWN"}`;

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

// ------------------------------------------------------
// RAZORPAY SCRIPT
// ------------------------------------------------------

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () =>
        resolve(Boolean(window.Razorpay))
      );

      existingScript.addEventListener("error", () =>
        reject(new Error("Unable to load Razorpay checkout."))
      );

      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => {
      if (window.Razorpay) {
        resolve(true);
      } else {
        reject(
          new Error("Razorpay checkout did not initialize.")
        );
      }
    };

    script.onerror = () =>
      reject(
        new Error("Unable to load Razorpay checkout.")
      );

    document.body.appendChild(script);
  });

// ------------------------------------------------------
// INVOICES COMPONENT
// ------------------------------------------------------

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentMessageType, setPaymentMessageType] =
    useState("success");

  // ----------------------------------------------------
  // LOAD INVOICES
  // ----------------------------------------------------

  const loadInvoices = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    setError("");

    try {
      const response = await API.get("invoices/");
      setInvoices(getList(response.data));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to load invoices. Check your login and backend API."
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadInvoices();

    // This effect loads invoices when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------
  // PAYMENT MESSAGE
  // ----------------------------------------------------

  const showPaymentMessage = (message, type = "success") => {
    setPaymentMessage(message);
    setPaymentMessageType(type);
  };

  // ----------------------------------------------------
  // PAY INVOICE WITH RAZORPAY
  // ----------------------------------------------------

  const handlePayInvoice = async (invoice) => {
    if (payingInvoiceId !== null) return;

    const invoiceId = invoice.id;

    if (!invoiceId) {
      showPaymentMessage(
        "Invoice ID is missing. Unable to start payment.",
        "error"
      );
      return;
    }

    const total = getInvoiceTotal(invoice);
    const paid = Math.min(getPaidAmount(invoice), total);
    const balance = Math.max(0, total - paid);
    const status = getPaymentStatus(invoice);

    if (status === "REFUNDED") {
      showPaymentMessage(
        "Payment cannot be started for a refunded invoice.",
        "error"
      );
      return;
    }

    if (balance <= 0 || status === "PAID") {
      showPaymentMessage(
        "This invoice has no outstanding balance.",
        "error"
      );

      await loadInvoices(false);
      return;
    }

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!keyId) {
      showPaymentMessage(
        "Razorpay key is missing. Add VITE_RAZORPAY_KEY_ID to your frontend .env file.",
        "error"
      );
      return;
    }

    setPayingInvoiceId(invoiceId);
    setPaymentMessage("");

    try {
      await loadRazorpayScript();

      // Create the Razorpay order through Django.
      const orderResponse = await API.post(
        "razorpay/create-order/",
        {
          invoice: invoiceId,
          amount: balance,
        }
      );

      const order = orderResponse.data ?? {};

      const razorpayOrderId =
        order.order_id ??
        order.razorpay_order_id ??
        order.id;

      if (!razorpayOrderId) {
        throw new Error(
          order.detail ??
            order.message ??
            "The server did not return a Razorpay order ID."
        );
      }

      const orderAmount = Number(order.amount);

      if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
        throw new Error(
          "The server returned an invalid order amount."
        );
      }

      // Razorpay expects the order amount in paise.
      // Use the amount generated by the trusted backend.
      await new Promise((resolve, reject) => {
        let settled = false;

        const finish = (callback, value) => {
          if (settled) return;
          settled = true;
          callback(value);
        };

        const checkout = new window.Razorpay({
          key: order.key_id ?? order.key ?? keyId,
          amount: orderAmount,
          currency: order.currency ?? "INR",

          name:
            order.name ??
            "Rubber Estate Management System",

          description: `Payment for ${getInvoiceNumber(invoice)}`,

          order_id: razorpayOrderId,

          prefill: {
            name:
              typeof invoice.buyer === "object"
                ? invoice.buyer.company_name ??
                  invoice.buyer.full_name ??
                  invoice.buyer.username ??
                  ""
                : invoice.buyer_name ?? "",
            email:
              typeof invoice.buyer === "object"
                ? invoice.buyer.email ?? ""
                : "",
            contact:
              typeof invoice.buyer === "object"
                ? invoice.buyer.phone ?? ""
                : "",
          },

          notes: {
            invoice_id: String(invoiceId),
            invoice_number: getInvoiceNumber(invoice),
          },

          theme: {
            color: "#176b4d",
          },

          handler: async (razorpayResponse) => {
            try {
              // The backend must validate the signature,
              // verify the order and payment, and record
              // the successful transaction.
              await API.post(
                "razorpay/verify-payment/",
                {
                  invoice: invoiceId,
                  razorpay_order_id:
                    razorpayResponse.razorpay_order_id,
                  razorpay_payment_id:
                    razorpayResponse.razorpay_payment_id,
                  razorpay_signature:
                    razorpayResponse.razorpay_signature,
                }
              );

              showPaymentMessage(
                `Payment verified for ${getInvoiceNumber(invoice)}.`,
                "success"
              );

              // Reload server data after verification.
              await loadInvoices(false);

              finish(resolve);
            } catch (verificationError) {
              showPaymentMessage(
                verificationError.response?.data?.detail ??
                  verificationError.response?.data?.message ??
                  "Payment verification could not be confirmed. Do not retry until you check the payment status.",
                "error"
              );

              // Refresh in case the server recorded the payment
              // despite a network error in the verification response.
              await loadInvoices(false);

              finish(
                reject,
                new Error("Payment verification requires checking.")
              );
            }
          },

          modal: {
            ondismiss: () => {
              finish(resolve);
            },
          },
        });

        checkout.on("payment.failed", (response) => {
          finish(
            reject,
            new Error(
              response.error?.description ??
                "Payment failed. Please try again."
            )
          );
        });

        checkout.open();
      });
    } catch (err) {
      const message =
        err.response?.data?.detail ??
        err.response?.data?.message ??
        err.message ??
        "Unable to start payment.";

      // Do not replace a more specific verification warning.
      if (
        !String(message).includes(
          "verification requires checking"
        )
      ) {
        showPaymentMessage(message, "error");
      }
    } finally {
      setPayingInvoiceId(null);
    }
  };

  // ----------------------------------------------------
  // SUMMARY CARDS
  // ----------------------------------------------------

  const summary = useMemo(
    () =>
      invoices.reduce(
        (result, invoice) => {
          const total = getInvoiceTotal(invoice);
          const paid = Math.min(getPaidAmount(invoice), total);
          const status = getPaymentStatus(invoice);

          result.totalAmount += total;

          if (status !== "REFUNDED") {
            result.paidAmount += paid;
            result.outstanding += Math.max(0, total - paid);
          }

          if (status === "PAID") {
            result.paidCount += 1;
          } else if (status === "PARTIAL") {
            result.partialCount += 1;
          } else if (status === "UNPAID") {
            result.unpaidCount += 1;
          } else if (status === "REFUNDED") {
            result.refundedCount += 1;
          }

          return result;
        },
        {
          totalAmount: 0,
          paidAmount: 0,
          outstanding: 0,
          paidCount: 0,
          partialCount: 0,
          unpaidCount: 0,
          refundedCount: 0,
        }
      ),
    [invoices]
  );

  // ----------------------------------------------------
  // SEARCH AND FILTER
  // ----------------------------------------------------

  const filteredInvoices = useMemo(() => {
    const term = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const invoiceNumber =
        invoice.invoice_number ??
        invoice.number ??
        invoice.id ??
        "";

      const orderNumber =
        invoice.order_number ??
        invoice.order?.order_number ??
        invoice.purchase_order?.order_number ??
        "";

      const matchesSearch = [
        invoiceNumber,
        orderNumber,
        getBuyerName(invoice),
        invoice.payment_status,
        invoice.status,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        getPaymentStatus(invoice) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const filters = [
    { value: "ALL", label: "All Invoices" },
    { value: "UNPAID", label: "Unpaid" },
    { value: "PARTIAL", label: "Partially Paid" },
    { value: "PAID", label: "Paid" },
    { value: "REFUNDED", label: "Refunded" },
  ];

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------

  return (
    <section className="invoices-page">
      <header className="invoices-header">
        <div>
          <p className="invoices-eyebrow">
            RUBBER ESTATE MANAGEMENT
          </p>

          <h1>Invoices &amp; Payments</h1>

          <p className="invoices-subtitle">
            Track B2B sales invoices, payments, and outstanding balances.
          </p>
        </div>

        <button
          type="button"
          className="invoices-refresh-btn"
          onClick={() => loadInvoices()}
          disabled={loading || payingInvoiceId !== null}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      {error && (
        <div className="invoices-error" role="alert">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => loadInvoices()}
          >
            Try again
          </button>
        </div>
      )}

      {paymentMessage && (
        <div
          className={`invoices-payment-message ${paymentMessageType}`}
          role={paymentMessageType === "error" ? "alert" : "status"}
        >
          <span>{paymentMessage}</span>

          <button
            type="button"
            onClick={() => setPaymentMessage("")}
            aria-label="Dismiss payment message"
          >
            ×
          </button>
        </div>
      )}

      <div className="invoices-summary">
        <article className="invoices-stat-card">
          <div className="invoices-stat-icon green">₹</div>

          <div>
            <span>Total Invoiced</span>
            <strong>
              {formatCurrency(summary.totalAmount)}
            </strong>
          </div>
        </article>

        <article className="invoices-stat-card">
          <div className="invoices-stat-icon blue">✓</div>

          <div>
            <span>Amount Received</span>
            <strong>
              {formatCurrency(summary.paidAmount)}
            </strong>
          </div>
        </article>

        <article className="invoices-stat-card">
          <div className="invoices-stat-icon orange">◷</div>

          <div>
            <span>Outstanding</span>
            <strong>
              {formatCurrency(summary.outstanding)}
            </strong>
          </div>
        </article>

        <article className="invoices-stat-card">
          <div className="invoices-stat-icon purple">▤</div>

          <div>
            <span>Total Invoices</span>
            <strong>{invoices.length}</strong>
          </div>
        </article>
      </div>

      <div className="invoices-content">
        <div className="invoices-toolbar">
          <div>
            <h2>Invoice Records</h2>

            <p>
              {summary.paidCount} paid · {summary.partialCount} partially
              paid · {summary.unpaidCount} unpaid
              {summary.refundedCount > 0
                ? ` · ${summary.refundedCount} refunded`
                : ""}
            </p>
          </div>

          <input
            type="search"
            className="invoices-search"
            placeholder="Search invoice or buyer..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search invoices"
          />
        </div>

        <div className="invoices-filters">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter.value}
              className={`invoices-filter ${
                statusFilter === filter.value ? "active" : ""
              }`}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="invoices-message">
            Loading invoices...
          </div>
        ) : error ? null : filteredInvoices.length === 0 ? (
          <div className="invoices-empty">
            <div className="invoices-empty-icon">₹</div>

            <h3>No invoices found</h3>

            <p>
              Invoices generated from B2B purchase orders will appear here.
            </p>
          </div>
        ) : (
          <div className="invoices-table-wrapper">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Buyer</th>
                  <th>Invoice Date</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((invoice, index) => {
                  const total = getInvoiceTotal(invoice);
                  const paid = Math.min(getPaidAmount(invoice), total);
                  const balance = Math.max(0, total - paid);
                  const status = getPaymentStatus(invoice);

                  const isPaying =
                    payingInvoiceId === invoice.id;

                  const canPay =
                    (status === "UNPAID" ||
                      status === "PARTIAL") &&
                    balance > 0;

                  return (
                    <tr key={invoice.id ?? index}>
                      <td>
                        <strong>
                          {invoice.invoice_number ??
                            invoice.number ??
                            `INV-${invoice.id ?? index + 1}`}
                        </strong>
                      </td>

                      <td>{getBuyerName(invoice)}</td>

                      <td>
                        {formatDate(
                          invoice.invoice_date ??
                            invoice.created_at ??
                            invoice.date
                        )}
                      </td>

                      <td className="invoices-money">
                        {formatCurrency(total)}
                      </td>

                      <td className="invoices-money">
                        {formatCurrency(paid)}
                      </td>

                      <td className="invoices-money">
                        {formatCurrency(balance)}
                      </td>

                      <td>
                        <span
                          className={`invoices-status ${status.toLowerCase()}`}
                        >
                          {{
                            PAID: "Paid",
                            PARTIAL: "Partially Paid",
                            UNPAID: "Unpaid",
                            REFUNDED: "Refunded",
                          }[status]}
                        </span>
                      </td>

                      <td className="invoices-actions-cell">
                        {canPay ? (
                          <button
                            type="button"
                            className="invoices-pay-btn"
                            onClick={() =>
                              handlePayInvoice(invoice)
                            }
                            disabled={payingInvoiceId !== null}
                          >
                            {isPaying
                              ? "Processing..."
                              : status === "PARTIAL"
                                ? "Pay Remaining"
                                : "Pay Now"}
                          </button>
                        ) : (
                          <span className="invoices-no-action">
                            {status === "PAID"
                              ? "Completed"
                              : status === "REFUNDED"
                                ? "Refunded"
                                : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <footer className="invoices-footer">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </footer>
      </div>
    </section>
  );
}
