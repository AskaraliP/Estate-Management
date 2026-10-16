
import {
  Building2,
  Users,
  Leaf,
  Package,
  ShoppingCart,
  Wallet,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

import "../styles/StatCard.css";

const iconMap = {
  estates: Building2,
  labour: Users,
  harvest: Leaf,
  inventory: Package,
  orders: ShoppingCart,
  expenses: Wallet,
};

export default function StatCard({
  title = "Total Records",
  value = 0,
  icon = "estates",
  color = "green",
  subtitle = "",
  trend,
  trendLabel = "",
  prefix = "",
  suffix = "",
  loading = false,
  onClick,
}) {
  const Icon = iconMap[icon] || Building2;

  const trendValue =
    typeof trend === "number" ? trend : null;

  const trendType =
    trendValue === null || trendValue === 0
      ? "neutral"
      : trendValue > 0
        ? "up"
        : "down";

  const TrendIcon =
    trendType === "up"
      ? TrendingUp
      : trendType === "down"
        ? TrendingDown
        : Minus;

  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString("en-IN")
      : value;

  return (
    <article
      className={`stat-card stat-card-${color} ${
        onClick ? "stat-card-clickable" : ""
      }`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (
          onClick &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card-top">
        <div className="stat-card-label">
          <span>{title}</span>
        </div>

        <div className="stat-card-icon">
          <Icon size={22} strokeWidth={1.8} />
        </div>
      </div>

      <div className="stat-card-value">
        {loading ? (
          <span className="stat-card-skeleton" aria-label="Loading" />
        ) : (
          <>
            {prefix}
            {formattedValue}
            {suffix}
          </>
        )}
      </div>

      {(subtitle || trend !== undefined) && (
        <div className="stat-card-bottom">
          {subtitle && (
            <span className="stat-card-subtitle">
              {subtitle}
            </span>
          )}

          {trend !== undefined && !loading && (
            <span className={`stat-card-trend stat-card-trend-${trendType}`}>
              <TrendIcon size={14} />
              {trendValue === null
                ? trend
                : `${Math.abs(trendValue)}%`}
              {trendLabel && (
                <span className="stat-card-trend-label">
                  {" "}{trendLabel}
                </span>
              )}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
