
import React, { useEffect, useMemo, useState } from "react";
import API from "../api/client";
import "../styles/Payments.css";

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

let razorpayScriptPromise = null;

const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);

  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => {
      razorpayScriptPromise = null;
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

const getArray = (data) =>
  Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const getStatus = (payment) =>
  String(
    payment.status ?? payment.payment_status ?? "PENDING"
  ).toUpperCase();

const getMethod = (payment) =>
  String(
    payment.payment_method ??
      payment.method ??
      payment.payment_type ??
      "—"
  ).replaceAll("_", " ");

const getInvoiceId = (item) => {
  const invoice = item?.invoice;

  if (invoice && typeof invoice === "object") {
    return invoice.id ?? invoice.pk ?? null;
  }

  return invoice ?? item?.invoice_id ?? null;
};

const getInvoice = (payment) => {
  const invoice = payment.invoice;

  if (invoice && typeof invoice === "object") {
    return (
      invoice.invoice_number ??
      `INV-${invoice.id ?? "—"}`
    );
  }

  return (
    payment.invoice_number ??
    (invoice ? `INV-${invoice}` : `PAY-${payment.id ?? "—"}`)
  );
};

const getOrder = (payment) => {
  const order = payment.order;

  if (order && typeof order === "object") {
    return order.order_number ?? `ORD-${order.id ?? "—"}`;
  }

  return payment.order_number ?? "—";
};

const isSuccessful = (payment) =>
  ["SUCCESS", "COMPLETED", "PAID", "CAPTURED"].includes(
    getStatus(payment)
  );

const getInvoiceAmount = (invoice) =>
  Number(invoice.amount ?? invoice.total_amount ?? 0);

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);

  const loadPayments = async () => {
    setLoading(true);
    setError("");

    try {
      const [paymentResult, invoiceResult] =
        await Promise.allSettled([
          API.get("payments/"),
          API.get("invoices/"),
        ]);

      if (paymentResult.status === "fulfilled") {
        setPayments(getArray(paymentResult.value.data));
      } else {
        setError(
          paymentResult.reason?.response?.data?.detail ||
            "Unable to load payment records. Please check your login and API permissions."
        );
      }

      if (invoiceResult.status === "fulfilled") {
        setInvoices(getArray(invoiceResult.value.data));
      } else {
        setError((previous) =>
          previous ||
          invoiceResult.reason?.response?.data?.detail ||
          "Unable to load invoices."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load payment information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const getPaidAmount = (invoiceId) =>
    payments
      .filter(
        (payment) =>
          String(getInvoiceId(payment)) === String(invoiceId) &&
          isSuccessful(payment)
      )
      .reduce(
        (sum, payment) =>
          sum + Number(payment.amount ?? payment.paid_amount ?? 0),
        0
      );

  const getBalance = (invoice) =>
    Math.max(
      0,
      getInvoiceAmount(invoice) - getPaidAmount(invoice.id)
    );

  const canPayInvoice = (invoice) => {
    const status = String(
      invoice.payment_status ?? invoice.status ?? "UNPAID"
    ).toUpperCase();

    return (
      !["PAID", "COMPLETED", "CANCELLED", "CANCELED"].includes(status) &&
      getBalance(invoice) > 0
    );
  };

  const handlePayNow = async (invoice) => {
    if (payingInvoiceId !== null) return;

    setError("");
    setPayingInvoiceId(invoice.id);

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Unable to load Razorpay Checkout. Please check your internet connection and try again."
        );
      }

      // Create an order on your authenticated Django backend.
      const response = await API.post("razorpay/create-order/", {
        invoice: invoice.id,
      });

      const orderData = response.data || {};
      const key = orderData.key || orderData.key_id;
      const orderId =
        orderData.order_id || orderData.razorpay_order_id;
      const amount = Number(orderData.amount);
      const currencyCode = orderData.currency || "INR";

      if (!key || !orderId || !Number.isFinite(amount) || amount <= 0) {
        throw new Error(
          "The server did not return valid Razorpay order details."
        );
      }

      const checkout = new window.Razorpay({
        key,
        order_id: orderId,
        amount,
        currency: currencyCode,
        name: "Rubber Estate Management System",
        description: `Payment for ${
          invoice.invoice_number || `Invoice ${invoice.id}`
        }`,
        notes: {
          invoice_id: String(invoice.id),
        },
        theme: {
          color: "#0f766e",
        },

        handler: async (checkoutResponse) => {
          try {
            // Verify the signature on the Django backend.
            await API.post("razorpay/verify-payment/", {
              invoice: invoice.id,
              razorpay_order_id:
                checkoutResponse.razorpay_order_id,
              razorpay_payment_id:
                checkoutResponse.razorpay_payment_id,
              razorpay_signature:
                checkoutResponse.razorpay_signature,
            });

            window.alert(
              "Payment verified successfully!"
            );

            await loadPayments();
          } catch (verifyError) {
            console.error(
              "Payment verification failed:",
              verifyError.response?.data || verifyError
            );

            window.alert(
              verifyError.response?.data?.detail ||
                "Payment verification could not be completed. Please refresh and check the payment status before trying again."
            );

            await loadPayments();
          } finally {
            setPayingInvoiceId(null);
          }
        },

        modal: {
          ondismiss: () => {
            setPayingInvoiceId(null);
          },
        },
      });

      checkout.on("payment.failed", (event) => {
        console.error(
          "Razorpay payment failed:",
          event.error
        );

        setPayingInvoiceId(null);

        window.alert(
          event.error?.description ||
            "Payment failed. Please try again."
        );
      });

      checkout.open();
    } catch (err) {
      console.error(
        "Unable to start payment:",
        err.response?.data || err
      );

      const responseData = err.response?.data;
      const message =
        responseData?.detail ||
        responseData?.invoice?.[0] ||
        responseData?.amount?.[0] ||
        err.message ||
        "Unable to start payment. Please try again.";

      setError(
        typeof message === "string"
          ? message
          : "Unable to start payment. Please try again."
      );

      setPayingInvoiceId(null);
    }
  };

  const methods = useMemo(
    () => [
      ...new Set(
        payments
          .map(getMethod)
          .filter((method) => method !== "—")
      ),
    ],
    [payments]
  );

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const status = getStatus(payment);
      const method = getMethod(payment);

      const searchable = [
        payment.id,
        payment.transaction_id,
        payment.transaction_reference,
        payment.reference_number,
        getInvoice(payment),
        getOrder(payment),
        method,
        status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (statusFilter === "ALL" || status === statusFilter) &&
        (methodFilter === "ALL" || method === methodFilter)
      );
    });
  }, [payments, search, statusFilter, methodFilter]);

  const totalReceived = payments
    .filter(isSuccessful)
    .reduce(
      (sum, payment) =>
        sum + Number(payment.amount ?? payment.paid_amount ?? 0),
      0
    );

  const totalPending = payments
    .filter((payment) =>
      ["PENDING", "PROCESSING"].includes(getStatus(payment))
    )
    .reduce(
      (sum, payment) =>
        sum + Number(payment.amount ?? payment.paid_amount ?? 0),
      0
    );

  const totalInvoices = invoices.reduce(
    (sum, invoice) => sum + getInvoiceAmount(invoice),
    0
  );
  

  const getAmount = (payment) =>
    Number(payment.amount ?? payment.paid_amount ?? 0);

  return (
    <section className="payments-page">
      <header className="payments-header">
        <div>
          <p className="payments-eyebrow">
            FINANCE MANAGEMENT
          </p>
          <h1>Payments</h1>
          <p className="payments-subtitle">
            Monitor B2B payments, invoices, and transactions.
          </p>
        </div>

        <button
          type="button"
          className="payments-refresh-btn"
          onClick={loadPayments}
          disabled={loading || payingInvoiceId !== null}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      {error && (
        <div className="payments-error" role="alert">
          {error}
        </div>
      )}
      

      <div className="payments-summary">
        <article className="payments-summary-card">
          <div className="payments-summary-icon received">
            ₹
          </div>
          <div>
            <span>Successful Payments</span>
            <strong>{currency(totalReceived)}</strong>
          </div>
        </article>

        <article className="payments-summary-card">
          <div className="payments-summary-icon pending">
            ◷
          </div>
          <div>
            <span>Pending Payments</span>
            <strong>{currency(totalPending)}</strong>
          </div>
        </article>

        <article className="payments-summary-card">
          <div className="payments-summary-icon invoices">
            ▤
          </div>
          <div>
            <span>Total Invoice Value</span>
            <strong>{currency(totalInvoices)}</strong>
          </div>
        </article>

        <article className="payments-summary-card">
          <div className="payments-summary-icon records">
            ↔
          </div>
          <div>
            <span>Payment Records</span>
            <strong>{payments.length}</strong>
          </div>
        </article>
      </div>

      {/* Outstanding invoices with Pay Now buttons */}
      <section className="payments-table-panel">
        <div className="payments-panel-heading">
          <div>
            <h2>My Invoices</h2>
            <p>Review outstanding invoices and pay securely online.</p>
          </div>

          <span className="payments-record-count">
            {invoices.filter(canPayInvoice).length} unpaid
          </span>
        </div>

        {loading ? (
          <div className="payments-empty">
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="payments-empty">
            <div className="payments-empty-icon">▤</div>
            <strong>No invoices found</strong>
            <p>Your invoices will appear here when available.</p>
          </div>
        ) : (
          <div className="payments-table-wrap">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Order</th>
                  <th>Invoice Amount</th>
                  <th>Paid</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice, index) => {
                  const balance = getBalance(invoice);
                  const invoiceStatus = String(
                    invoice.payment_status ??
                      invoice.status ??
                      "UNPAID"
                  ).toUpperCase();

                  const order =
                    invoice.order && typeof invoice.order === "object"
                      ? invoice.order.order_number ??
                        `ORD-${invoice.order.id ?? "—"}`
                      : invoice.order_number ??
                        (invoice.order
                          ? `ORD-${invoice.order}`
                          : "—");

                  const canPay = canPayInvoice(invoice);

                  return (
                    <tr key={invoice.id ?? index}>
                      <td className="payments-id">
                        {invoice.invoice_number ??
                          `INV-${invoice.id ?? index + 1}`}
                      </td>

                      <td>{order}</td>

                      <td className="payments-amount">
                        {currency(getInvoiceAmount(invoice))}
                      </td>

                      <td>{currency(getPaidAmount(invoice.id))}</td>

                      <td className="payments-amount">
                        {currency(balance)}
                      </td>

                      <td>
                        <span
                          className={`payments-status ${invoiceStatus.toLowerCase()}`}
                        >
                          {invoiceStatus.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td>
                        {canPay ? (
                          <button
                            type="button"
                            className="payments-pay-btn"
                            disabled={
                              payingInvoiceId !== null ||
                              loading
                            }
                            onClick={() => handlePayNow(invoice)}
                          >
                            {payingInvoiceId === invoice.id
                              ? "Opening..."
                              : "₹ Pay Now"}
                          </button>
                        ) : (
                          <span className="payments-paid-label">
                            {balance <= 0 ||
                            invoiceStatus === "PAID"
                              ? "Paid"
                              : "Not payable"}
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
      </section>

      {/* Existing payment history */}
      <section className="payments-table-panel">
        <div className="payments-panel-heading">
          <div>
            <h2>Payment History</h2>
            <p>View and search recorded transactions.</p>
          </div>

          <span className="payments-record-count">
            {filteredPayments.length} records
          </span>
        </div>

        <div className="payments-filters">
          <div className="payments-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search transaction, invoice, or order..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            aria-label="Filter by payment status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="COMPLETED">Completed</option>
            <option value="PAID">Paid</option>
            <option value="CAPTURED">Captured</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <select
            aria-label="Filter by payment method"
            value={methodFilter}
            onChange={(event) =>
              setMethodFilter(event.target.value)
            }
          >
            <option value="ALL">All Methods</option>
            {methods.map((method) => (
              <option value={method} key={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="payments-empty">
            Loading payments...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="payments-empty">
            <div className="payments-empty-icon">₹</div>
            <strong>No payment records found</strong>
            <p>
              Payments will appear here when recorded by your backend.
            </p>
          </div>
        ) : (
          <div className="payments-table-wrap">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Invoice</th>
                  <th>Order</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Transaction Reference</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment, index) => {
                  const status = getStatus(payment);
                  const date =
                    payment.payment_date ??
                    payment.created_at ??
                    payment.date;

                  return (
                    <tr key={payment.id ?? index}>
                      <td className="payments-id">
                        PAY-{payment.id ?? index + 1}
                      </td>

                      <td>{getInvoice(payment)}</td>
                      <td>{getOrder(payment)}</td>

                      <td className="payments-amount">
                        {currency(getAmount(payment))}
                      </td>

                      <td>{getMethod(payment)}</td>

                      <td>
                        {payment.transaction_id ??
                          payment.transaction_reference ??
                          payment.reference_number ??
                          "—"}
                      </td>

                      <td>
                        {date
                          ? new Date(date).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td>
                        <span
                          className={`payments-status ${status.toLowerCase()}`}
                        >
                          {status.replaceAll("_", " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
