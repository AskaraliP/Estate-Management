
import React, { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api/client";
import "../styles/Inventory.css";

const getRows = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const getEstateId = (item) =>
  item.estate_id ?? (typeof item.estate === "object"
    ? item.estate?.id
    : item.estate);

const getEstateName = (item) =>
  item.estate_name ??
  (typeof item.estate === "object" ? item.estate?.name : "") ??
  "Estate";

const getCategory = (item) =>
  String(item.category ?? item.product_category ?? "LATEX").toUpperCase();

const getQuantity = (item) =>
  Number(item.stock_quantity ?? item.available_quantity ?? item.quantity ?? 0);

const money = (value) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isBuyer = role === "buyer";

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [inventoryResponse, roleResponse] = await Promise.all([
        API.get("inventory/"),
        API.get("user-role/"),
      ]);

      setItems(getRows(inventoryResponse.data));
      setRole(String(roleResponse.data?.role ?? "").toLowerCase());
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load inventory. Please check your connection and sign in again if needed."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categories = useMemo(
    () => [...new Set(items.map(getCategory))],
    [items]
  );

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((item) => {
      const category = getCategory(item);
      const estateName = getEstateName(item);
      const matchesCategory =
        categoryFilter === "ALL" || category === categoryFilter;
      const matchesSearch =
        !term ||
        category.toLowerCase().includes(term) ||
        estateName.toLowerCase().includes(term) ||
        String(item.product_name ?? item.name ?? "").toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [items, search, categoryFilter]);

  const openOrderForm = (item) => {
    if (!getEstateId(item)) {
      setError("This inventory record does not contain a valid estate ID.");
      return;
    }

    setError("");
    setNotice("");
    setSelected(item);
    setQuantity("1");
    setNotes("");
  };

  const closeOrderForm = () => {
    if (!submitting) setSelected(null);
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (!selected || !isBuyer) return;

    const requestedQuantity = Number(quantity);
    const available = getQuantity(selected);

    if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
      setError("Enter a quantity greater than zero.");
      return;
    }

    if (requestedQuantity > available) {
      setError(`Only ${available} ${selected.unit ?? ""} is available.`);
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      await API.post("purchase-orders/", {
        estate: getEstateId(selected),
        category: getCategory(selected),
        quantity: requestedQuantity,
        notes: notes.trim(),
      });

      setSelected(null);
      setNotice("Order placed successfully. Its status is Pending approval.");
    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.detail ||
        data?.quantity?.[0] ||
        data?.category?.[0] ||
        data?.estate?.[0] ||
        (typeof data === "string" ? data : "");

      setError(message || "Unable to place the order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="inventory-page">
      <header className="inventory-header">
        <div>
          <p className="inventory-eyebrow">RUBBER ESTATE MANAGEMENT</p>
          <h1>Inventory</h1>
          <p className="inventory-subtitle">
            View available rubber stock and current unit prices.
          </p>
        </div>

        <button className="inventory-refresh" onClick={loadData} type="button">
          Refresh stock
        </button>
      </header>

      {error && (
        <div className="inventory-alert inventory-alert-error" role="alert">
          {error}
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {notice && (
        <div className="inventory-alert inventory-alert-success" role="status">
          {notice}
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      <div className="inventory-toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search estate or rubber category..."
          aria-label="Search inventory"
        />

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="ALL">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="inventory-state">Loading inventory...</div>
      ) : filteredItems.length === 0 ? (
        <div className="inventory-state">
          No inventory records match your search.
        </div>
      ) : (
        <div className="inventory-grid">
          {filteredItems.map((item) => {
            const available = getQuantity(item);
            const unit = item.unit ?? "KG";
            const category = getCategory(item);
            const price = Number(item.unit_price ?? 0);

            return (
              <article className="inventory-card" key={item.id}>
                <div className="inventory-card-top">
                  <span className="inventory-category">{category}</span>
                  <span
                    className={`inventory-stock-status ${
                      available > 0 ? "in-stock" : "out-of-stock"
                    }`}
                  >
                    {available > 0 ? "In stock" : "Out of stock"}
                  </span>
                </div>

                <h2>{item.product_name ?? item.name ?? category}</h2>
                <p className="inventory-estate">{getEstateName(item)}</p>

                <div className="inventory-metrics">
                  <div>
                    <span>Available quantity</span>
                    <strong>
                      {available.toLocaleString("en-IN")} {unit}
                    </strong>
                  </div>
                  <div>
                    <span>Price per {unit}</span>
                    <strong>{money(price)}</strong>
                  </div>
                </div>

                {isBuyer && (
                  <button
                    className="inventory-order-button"
                    type="button"
                    disabled={available <= 0}
                    onClick={() => openOrderForm(item)}
                  >
                    {available > 0 ? "Place Order" : "Out of Stock"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {selected && (
        <div
          className="inventory-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeOrderForm();
          }}
        >
          <section
            className="inventory-order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-order-title"
          >
            <div className="inventory-modal-heading">
              <div>
                <p className="inventory-eyebrow">NEW PURCHASE REQUEST</p>
                <h2 id="inventory-order-title">Place Order</h2>
              </div>
              <button
                type="button"
                className="inventory-modal-close"
                onClick={closeOrderForm}
                disabled={submitting}
                aria-label="Close order form"
              >
                ×
              </button>
            </div>

            <p className="inventory-modal-product">
              {getCategory(selected)} · {getEstateName(selected)}
            </p>

            <div className="inventory-order-summary">
              <span>Unit price</span>
              <strong>{money(selected.unit_price)}</strong>
              <span>Available</span>
              <strong>
                {getQuantity(selected)} {selected.unit ?? "KG"}
              </strong>
              <span>Estimated total</span>
              <strong>
                {money(Number(quantity || 0) * Number(selected.unit_price || 0))}
              </strong>
            </div>

            <form onSubmit={placeOrder} className="inventory-order-form">
              <label>
                Quantity ({selected.unit ?? "KG"})
                <input
                  type="number"
                  min="0.01"
                  max={getQuantity(selected)}
                  step="0.01"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  required
                />
              </label>

              <label>
                Notes (optional)
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add delivery or product requirements"
                />
              </label>

              <p className="inventory-pending-note">
                Your order will be submitted as Pending. The estate owner must
                approve it before it proceeds.
              </p>

              <button
                type="submit"
                className="inventory-order-button"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Order"}
              </button>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
