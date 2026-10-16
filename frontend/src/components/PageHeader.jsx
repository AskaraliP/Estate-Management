
import { ChevronRight } from "lucide-react";
import "../styles/PageHeader.css";

export default function PageHeader({
  title = "Dashboard",
  description = "",
  breadcrumbs = [],
  actionLabel = "",
  actionIcon: ActionIcon,
  onAction,
  children,
}) {
  return (
    <header className="page-header">
      <div className="page-header-main">
        <div className="page-header-info">
          {breadcrumbs.length > 0 && (
            <nav
              className="page-header-breadcrumbs"
              aria-label="Breadcrumb"
            >
              {breadcrumbs.map((item, index) => (
                <span
                  className="page-header-breadcrumb-item"
                  key={`${item.label}-${index}`}
                >
                  {item.href ? (
                    <a href={item.href}>{item.label}</a>
                  ) : (
                    <span
                      className={
                        index === breadcrumbs.length - 1
                          ? "page-header-current"
                          : ""
                      }
                    >
                      {item.label}
                    </span>
                  )}

                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight size={14} />
                  )}
                </span>
              ))}
            </nav>
          )}

          <h1 className="page-header-title">{title}</h1>

          {description && (
            <p className="page-header-description">
              {description}
            </p>
          )}
        </div>

        {(actionLabel || children) && (
          <div className="page-header-actions">
            {children}

            {actionLabel && (
              <button
                type="button"
                className="page-header-button"
                onClick={onAction}
                disabled={!onAction}
              >
                {ActionIcon && <ActionIcon size={17} />}
                <span>{actionLabel}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
