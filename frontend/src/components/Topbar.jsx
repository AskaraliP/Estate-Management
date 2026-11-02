import React, { useEffect, useState } from "react";
import {
  Menu,
  Bell,
  UserCircle,
  CheckCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/client";
import "../styles/Topbar.css";

function Topbar({ onMenuClick, title = "Dashboard" }) {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("user_role") || user.role || "User";

  const formatRole = (value) =>
    String(value)
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const displayName =
    user.full_name ||
    user.name ||
    user.username ||
    user.company_name ||
    "User";

  useEffect(() => {
    let active = true;

    const refreshUnreadCount = async () => {
      try {
        const response = await API.get("notifications/unread-count/");
        if (active) {
          setUnreadCount(Number(response.data?.count ?? 0));
        }
      } catch (error) {
        if (active) {
          console.error(
            "Unable to load notification count:",
            error.response?.data || error.message
          );
        }
      }
    };

    refreshUnreadCount();
    const interval = window.setInterval(refreshUnreadCount, 30000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationError("");

    try {
      const response = await API.get("notifications/");
      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : response.data?.results ?? []
      );
      const countResponse = await API.get("notifications/unread-count/");
      setUnreadCount(Number(countResponse.data?.count ?? 0));
    } catch (error) {
      setNotificationError(
        error.response?.data?.detail ||
          "Unable to load notifications. Please try again."
      );
    } finally {
      setNotificationsLoading(false);
    }
  };

  const toggleNotifications = () => {
    const opening = !notificationsOpen;
    setNotificationsOpen(opening);
    if (opening) loadNotifications();
  };

  const markAllNotificationsRead = async () => {
    try {
      await API.post("notifications/mark-all-read/");
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      setNotificationError(
        error.response?.data?.detail ||
          "Unable to mark notifications as read."
      );
    }
  };

  const openNotification = async (notification) => {
    if (!notification.is_read) {
      try {
        await API.post(
          `notifications/${notification.id}/mark-read/`
        );
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true }
              : item
          )
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch (error) {
        setNotificationError(
          error.response?.data?.detail ||
            "Unable to update this notification."
        );
        return;
      }
    }

    setNotificationsOpen(false);
    if (notification.target_url) {
      navigate(notification.target_url);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={23} />
        </button>

        <div className="topbar-heading">
          <h1>{title}</h1>
          <p>Manage your rubber estate operations</p>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-notifications">
          <button
            type="button"
            className="topbar-icon-btn"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            aria-expanded={notificationsOpen}
            aria-controls="topbar-notification-panel"
            title="Notifications"
            onClick={toggleNotifications}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="topbar-notification-count">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <section
              id="topbar-notification-panel"
              className="topbar-notification-panel"
              aria-label="Notifications"
            >
              <div className="topbar-notification-heading">
                <div>
                  <strong>Notifications</strong>
                  <span>
                    {unreadCount
                      ? `${unreadCount} unread`
                      : "You're all caught up"}
                  </span>
                </div>
                <button
                  type="button"
                  className="topbar-mark-all"
                  onClick={markAllNotificationsRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck size={15} />
                  Mark all read
                </button>
              </div>

              {notificationError && (
                <p className="topbar-notification-error" role="alert">
                  {notificationError}
                </p>
              )}

              {notificationsLoading ? (
                <p className="topbar-notification-empty">
                  Loading notifications...
                </p>
              ) : notifications.length === 0 ? (
                <p className="topbar-notification-empty">
                  No notifications yet.
                </p>
              ) : (
                <ul className="topbar-notification-list">
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <button
                        type="button"
                        className={`topbar-notification-item${
                          notification.is_read ? "" : " is-unread"
                        }`}
                        onClick={() => openNotification(notification)}
                      >
                        <span className="topbar-notification-dot" />
                        <span className="topbar-notification-copy">
                          <strong>{notification.title}</strong>
                          <span>{notification.message}</span>
                          <time dateTime={notification.created_at}>
                            {new Date(
                              notification.created_at
                            ).toLocaleString()}
                          </time>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        <div className="topbar-divider" />

        <div className="topbar-profile">
          <div className="topbar-avatar">
            <UserCircle size={25} />
          </div>

          <div className="topbar-user-info">
            <span className="topbar-user-name">{displayName}</span>
            <span className="topbar-user-role">{formatRole(role)}</span>
          </div>

        </div>
      </div>
    </header>
  );
}

export default Topbar;