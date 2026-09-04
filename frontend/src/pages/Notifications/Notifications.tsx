import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Clock3,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface NotificationsResponse {
  notifications?: Notification[];
}

function isNotificationRead(notification: Notification) {
  return notification.isRead ?? notification.read ?? false;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatType(type: string) {
  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState<string | null>(null);

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<NotificationsResponse | Notification[]>(
        "/notifications",
      );

      const data = response.data;
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load notifications. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function markAsRead(id: string) {
    try {
      setMarkingId(id);
      await api.patch(`/notifications/${id}/read`);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true, read: true }
            : notification,
        ),
      );
    } catch (err: any) {
      console.error("Failed to mark notification as read:", err);
      setError(
        err.response?.data?.message ||
          "Unable to update the notification. Please try again.",
      );
    } finally {
      setMarkingId(null);
    }
  }

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !isNotificationRead(notification)).length,
    [notifications],
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Bell size={14} />
            Activity updates
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Stay updated about potential matches, claims, and other activity on your reports.
          </p>
        </div>

        <button
          type="button"
          onClick={loadNotifications}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadNotifications}
            className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Bell size={28} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">You're all caught up</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            New activity related to your reports will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const read = isNotificationRead(notification);

            return (
              <article
                key={notification.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                  read ? "border-slate-200" : "border-indigo-200 bg-indigo-50/30"
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      read ? "bg-slate-100 text-slate-500" : "bg-indigo-100 text-indigo-600"
                    }`}
                  >
                    {read ? <Check size={19} /> : <Bell size={19} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-bold text-slate-900">{notification.title}</h2>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            {formatType(notification.type)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {notification.message}
                        </p>
                      </div>

                      {!read && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notification.id)}
                          disabled={markingId === notification.id}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {markingId === notification.id ? (
                            <Clock3 size={13} className="animate-pulse" />
                          ) : (
                            <CheckCheck size={13} />
                          )}
                          Mark read
                        </button>
                      )}
                    </div>

                    <p className="mt-4 text-xs text-slate-400">{formatDate(notification.createdAt)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
