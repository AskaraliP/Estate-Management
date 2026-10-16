
import {
  Inbox,
  Search,
  ClipboardList,
  Package,
  Users,
  FileText,
  Leaf,
} from "lucide-react";

import "../styles/EmptyState.css";

const iconMap = {
  inbox: Inbox,
  search: Search,
  attendance: ClipboardList,
  inventory: Package,
  labour: Users,
  invoices: FileText,
  harvest: Leaf,
};

export default function EmptyState({
  icon = "inbox",
  title = "No records found",
  description = "There is nothing to display here yet.",
  actionLabel = "",
  onAction,
  compact = false,
}) {
  const Icon = iconMap[icon] || Inbox;

  return (
    <div
      className={`empty-state ${compact ? "empty-state-compact" : ""}`}
      role="status"
    >
      <div className="empty-state-icon">
        <Icon size={compact ? 25 : 34} strokeWidth={1.7} />
      </div>

      <h3 className="empty-state-title">{title}</h3>

      {description && (
        <p className="empty-state-description">{description}</p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          className="empty-state-action"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
