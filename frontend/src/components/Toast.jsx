import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import "../styles/Toast.css";

const toastConfig = {
  success: { icon: CheckCircle, title: "Success" },
  error: { icon: XCircle, title: "Error" },
  warning: { icon: AlertTriangle, title: "Warning" },
  info: { icon: Info, title: "Information" },
};

function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}) {
  useEffect(() => {
    if (!message || !duration) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const config = toastConfig[type] || toastConfig.success;
  const Icon = config.icon;

  return (
    <div className="toast-overlay">
      <div
        className={`toast-card toast-${type}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="toast-icon">
          <Icon size={24} />
        </div>

        <div className="toast-content">
          <strong>{config.title}</strong>
          <p>{message}</p>
        </div>

        <button
          className="toast-close"
          onClick={onClose}
          aria-label="Close notification"
          type="button"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default Toast;