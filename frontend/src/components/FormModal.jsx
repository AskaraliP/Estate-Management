
import { useEffect } from "react";
import { X } from "lucide-react";
import "../styles/FormModal.css";

export default function FormModal({
  open,
  title = "Add Record",
  subtitle = "",
  children,
  onSubmit,
  onClose,
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  size = "medium",
}) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !loading) {
      onClose?.();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!loading) {
      onSubmit?.(event);
    }
  };

  return (
    <div
      className="form-modal-overlay"
      onMouseDown={handleBackdropClick}
    >
      <section
        className={`form-modal form-modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
      >
        <div className="form-modal-header">
          <div>
            <h2 id="form-modal-title">{title}</h2>

            {subtitle && (
              <p className="form-modal-subtitle">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            className="form-modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-modal-body">
            {children}
          </div>

          <div className="form-modal-footer">
            <button
              type="button"
              className="form-modal-cancel"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </button>

            <button
              type="submit"
              className="form-modal-submit"
              disabled={loading}
            >
              {loading ? "Saving..." : submitText}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
