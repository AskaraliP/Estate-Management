import React from "react";
import "../styles/StatusBadge.css";

const STATUS_MAP = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  VERIFIED: "verified",
  PAID: "paid",
  UNPAID: "unpaid",
  PARTIAL: "partial",
  PRESENT: "present",
  HALF_DAY: "half-day",
  ABSENT: "absent",
  ACTIVE: "active",
  INACTIVE: "inactive",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  PROCESSING: "processing",
};

function StatusBadge({ status, label }) {
  const rawStatus = String(status || "UNKNOWN");
  const normalizedStatus = rawStatus.toUpperCase().replace(/[\s-]+/g, "_");
  const statusClass = STATUS_MAP[normalizedStatus] || "default";
  const displayLabel =
    label || rawStatus.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <span className={`status-badge status-${statusClass}`}>
      <span className="status-badge-dot" />
      {displayLabel}
    </span>
  );
}

export default StatusBadge;