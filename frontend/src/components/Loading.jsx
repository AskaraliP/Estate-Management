
import { LoaderCircle } from "lucide-react";
import "../styles/Loading.css";

export default function Loading({
  message = "Loading data...",
  fullPage = false,
  size = "medium",
}) {
  return (
    <div
      className={`loading-container ${
        fullPage ? "loading-full-page" : ""
      } loading-${size}`}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle className="loading-spinner" />
      <p className="loading-message">{message}</p>
    </div>
  );
}
