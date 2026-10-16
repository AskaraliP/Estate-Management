
import React, { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api/client";
import "../styles/Orders.css";

const getRows = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const getEstateId = (item) =>
  item.estate_id ??
  (typeof item.estate === "object" ? item.estate?.id : item.estate);

const getEstateName = (item) =>
  item.estate_name ??
  (typeof item.estate === "object" ? item.estate?.name : "") ??
  "—";

const getCategory = (item) =>
  String(item.category ?? item.product_category ?? "LATEX").toUpperCase();

const getStock = (item) =>
  Number(item.stock_quantity ?? item.available_quantity ?? item.quantity ?? 0);

const money = (value) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getErrorMessage = (err) => {
  const data = err.response?.data;
  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;

  if (data && typeof data === "object") {
    const firstValue = Object.values(data).flat()[0];
    if (typeof firstValue === "string") return firstValue;
  }

  return "The request failed. Please try again.";
};

export default function Order() {
  const [role, setRole] = useState("");
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [form, setForm] = useState({
    inventoryId: "",
    quantity: "1",
    notes: "",
  });

  const isBuyer = role === "buyer";
  const canManage = role === "admin" || role === "estate_owner";

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const roleResponse = await API.get("user-role/");
      const currentRole = String(
        roleResponse.data?.role ?? ""
      ).toLowerCase();

      setRole(currentRole);

      const [ordersResponse, inventoryResponse] = await Promise.all([
        API.get("purchase-orders/"),
        currentRole === "buyer" ? API.get("inventory/") : Promise.resolve({ data: [] }),
      ]);

      setOrders(getRows(ordersResponse.data));
      setInventory(getRows(inventoryResponse.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedStock = useMemo(
    () => inventory.find((item) => String(item.id) === String(form.inventoryId)),
    [inventory, form.inventoryId]
  );

  const availableInventory = useMemo(
    () => inventory.filter((item) => getStock(item) > 0 && getEstateId(item)),
    [inventory]
  );

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = String(order.status ?? "PENDING").toUpperCase();
      const text = [
        order.id,
        order.order_number,
        order.buyer_company,
        order.buyer_name,
        order.buyer_username,
        getEstateName(order),
        getCategory(order),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (statusFilter === "ALL" || status === statusFilter) &&
        (!term || text.includes(term))
      );
    });
  }, [orders, search, statusFilter]);

  const openForm = (inventoryId = "") => {
    setError("");
    setNotice("");
    setForm({
      inventoryId: inventoryId ? String(inventoryId) : "",
      quantity: "1",
      notes: "",
    });
    setFormOpen(true);
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (!isBuyer) return;

    if (!selectedStock) {
      setError("Select an available product before placing your order.");
      return;
    }

    const quantity = Number(form.quantity);
    const available = getStock(selectedStock);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (quantity > available) {
      setError(`Only ${available} ${selectedStock.unit ?? "KG"} is available.`);
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      await API.post("purchase-orders/", {
        estate: getEstateId(selectedStock),
        category: getCategory(selectedStock),
        quantity,
        notes: form.notes.trim(),
      });

      setFormOpen(false);
      setNotice("Order placed. It is now Pending estate-owner approval.");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const processOrder = async (orderId, action) => {
    const actionLabel = action === "approve" ? "approve" : "reject";
    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} order #${orderId}?`
    );

    if (!confirmed) return;

    setProcessingId(orderId);
    setError("");
    setNotice("");

    try {
      await API.post(`purchase-orders/${orderId}/${action}/`);
      setNotice(
        action === "approve"
          ? `Order #${orderId} approved successfully.`
          : `Order #${orderId} rejected.`
      );
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const downloadCSV = async () => {
    setError("");

    try {
      const endpoint = isBuyer ? "export/my-orders/" : "export/sales/";
      const response = await API.get(endpoint, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: "text/csv;charset=utf-8;" })
      );
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = isBuyer ? "my-orders.csv" : "sales.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section className="orders-page">
      <header className="orders-header">
        <div>
          <p className="orders-eyebrow">RUBBER ESTATE MANAGEMENT</p>
          <h1>{isBuyer ? "My Orders" : "B2B Orders"}</h1>
          <p className="orders-subtitle">
            {isBuyer
              ? "Place wholesale orders and track approval status."
              : "Review buyer orders and manage estate-owner approvals."}
          </p>
        </div>

        <div className="orders-header-actions">
          {isBuyer && (
            <button
              type="button"
              className="orders-primary-button"
              onClick={() => openForm()}
            >
              + Place Order
            </button>
          )}

          {(isBuyer || canManage) && (
            <button
              type="button"
              className="orders-secondary-button"
              onClick={downloadCSV}
            >
              Download CSV
            </button>
          )}

          <button
            type="button"
            className="orders-secondary-button"
            onClick={loadData}
          >
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="orders-alert orders-alert-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {notice && (
        <div className="orders-alert orders-alert-success" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      {isBuyer && formOpen && (
        <section className="orders-form-card">
          <div className="orders-form-heading">
            <div>
              <h2>Place a new order</h2>
              <p>Select stock, enter the quantity and submit your request.</p>
            </div>
            <button
              type="button"
              className="orders-close-button"
              onClick={() => !submitting && setFormOpen(false)}
              disabled={submitting}
              aria-label="Close form"
            >
              ×
            </button>
          </div>

          {availableInventory.length === 0 ? (
            <p className="orders-empty-inline">
              No available inventory can currently be ordered.
            </p>
          ) : (
            <form className="orders-form" onSubmit={placeOrder}>
              <label>
                Available product
                <select
                  value={form.inventoryId}
                  onChange={(event) =>
                    setForm({ ...form, inventoryId: event.target.value })
                  }
                  required
                >
                  <option value="">Choose product and estate</option>
                  {availableInventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {getCategory(item)} — {getEstateName(item)} —{" "}
                      {getStock(item)} {item.unit ?? "KG"} available
                    </option>
                  ))}
                </select>
              </label>

              {selectedStock && (
                <div className="orders-price-summary">
                  <div>
                    <span>Unit price</span>
                    <strong>{money(selectedStock.unit_price)}</strong>
                  </div>
                  <div>
                    <span>Available stock</span>
                    <strong>
                      {getStock(selectedStock)} {selectedStock.unit ?? "KG"}
                    </strong>
                  </div>
                  <div>
                    <span>Estimated total</span>
                    <strong>
                      {money(
                        Number(form.quantity || 0) *
                          Number(selectedStock.unit_price || 0)
                      )}
                    </strong>
                  </div>
                </div>
              )}

              <label>
                Quantity ({selectedStock?.unit ?? "KG"})
                <input
                  type="number"
                  min="0.01"
                  max={selectedStock ? getStock(selectedStock) : undefined}
                  step="0.01"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm({ ...form, quantity: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                Notes (optional)
                <textarea
                  rows="3"
                  value={form.notes}
                  onChange={(event) =>
                    setForm({ ...form, notes: event.target.value })
                  }
                  placeholder="Delivery details or product requirements"
                />
              </label>

              <div className="orders-pending-note">
                Your order will remain Pending until the estate owner reviews it.
              </div>

              <div className="orders-form-actions">
                <button
                  type="button"
                  className="orders-secondary-button"
                  onClick={() => setFormOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="orders-primary-button"
                  disabled={submitting || !selectedStock}
                >
                  {submitting ? "Submitting..." : "Submit Order"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <div className="orders-toolbar">
        <input
          type="search"
          placeholder="Search order, estate, buyer..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search orders"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by order status"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="orders-empty">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty">
          <h2>No orders found</h2>
          <p>
            {isBuyer
              ? "Your orders will appear here after you place an order."
              : "There are no orders matching these filters."}
          </p>
          {isBuyer && (
            <button
              type="button"
              className="orders-primary-button"
              onClick={() => openForm()}
            >
              Place Order
            </button>
          )}
        </div>
      ) : (
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order</th>
                {!isBuyer && <th>Buyer</th>}
                <th>Estate</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Status</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const status = String(order.status ?? "PENDING").toUpperCase();
                const pending = status === "PENDING";

                return (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.order_number ?? order.id}</strong>
                      <span className="orders-date">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString("en-IN")
                          : "—"}
                      </span>
                    </td>
                    {!isBuyer && (
                      <td>
                        {order.buyer_company ||
                          order.buyer_name ||
                          order.buyer_username ||
                          order.buyer?.username ||
                          "—"}
                      </td>
                    )}
                    <td>{getEstateName(order)}</td>
                    <td>{getCategory(order)}</td>
                    <td>
                      {order.quantity} {order.unit ?? ""}
                    </td>
                    <td>{money(order.total_price)}</td>
                    <td>
                      <span
                        className={`orders-status orders-status-${status.toLowerCase()}`}
                      >
                        {status}
                      </span>
                    </td>
                    {canManage && (
                      <td>
                        {pending ? (
                          <div className="orders-row-actions">
                            <button
                              type="button"
                              className="orders-approve-button"
                              disabled={processingId === order.id}
                              onClick={() => processOrder(order.id, "approve")}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="orders-reject-button"
                              disabled={processingId === order.id}
                              onClick={() => processOrder(order.id, "reject")}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="orders-muted">Processed</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
