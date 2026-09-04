import { useEffect, useState } from "react";
import api from "../services/api";

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      const response = await api.get("/notifications");

      setNotifications(response.data.notifications || response.data || []);
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to load notifications");
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">UPDATES</p>
          <h1>Notifications</h1>
          <p>Stay updated about FindIt activity.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div>🔔</div>
            <h3>No notifications</h3>
            <p>You're all caught up.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              className={`notification-card ${
                notification.isRead ? "" : "unread"
              }`}
              key={notification.id}
            >
              <div className="notification-icon">🔔</div>

              <div>
                <span className="notification-type">{notification.type}</span>

                <p>{notification.message}</p>

                <small>
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
