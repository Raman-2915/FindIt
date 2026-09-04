import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileWarning,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

interface ReportItem {
  id: string;
  title: string;
  status: string;
}

interface Reporter {
  id: string;
  name: string;
  email: string;
}

interface Report {
  id: string;
  reason: string;
  status: "PENDING" | "REVIEWED" | "DISMISSED" | "ACTION_TAKEN" | string;
  createdAt: string;
  reporter?: Reporter;
  lostItem?: ReportItem;
  foundItem?: ReportItem;
}

interface ReportsResponse {
  reports: Report[];
}

const statuses = ["ALL", "PENDING", "REVIEWED", "DISMISSED", "ACTION_TAKEN"];

function formatStatus(status?: string) {
  if (!status) return "Unknown";
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) return "Date unavailable";
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

function statusClasses(status: string) {
  switch (status.toUpperCase()) {
    case "REVIEWED":
      return "bg-blue-50 text-blue-700";
    case "DISMISSED":
      return "bg-slate-100 text-slate-600";
    case "ACTION_TAKEN":
      return "bg-emerald-50 text-emerald-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function loadReports() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get<ReportsResponse>("/reports");
      setReports(response.data.reports || []);
    } catch (err: any) {
      console.error("Failed to load admin reports:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load reports. Please try again.",
      );
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function updateStatus(reportId: string, status: string) {
    try {
      setActionId(reportId);
      setActionError("");
      await api.patch(`/reports/${reportId}/status`, { status });
      setReports((current) =>
        current.map((report) =>
          report.id === reportId ? { ...report, status } : report,
        ),
      );
    } catch (err: any) {
      console.error("Failed to update report:", err);
      setActionError(
        err.response?.data?.message ||
          "Unable to update this report. Please try again.",
      );
    } finally {
      setActionId(null);
    }
  }

  const filteredReports = useMemo(
    () =>
      filter === "ALL"
        ? reports
        : reports.filter((report) => report.status.toUpperCase() === filter),
    [filter, reports],
  );

  const counts = useMemo(
    () => ({
      pending: reports.filter((r) => r.status.toUpperCase() === "PENDING").length,
      reviewed: reports.filter((r) => r.status.toUpperCase() === "REVIEWED").length,
      dismissed: reports.filter((r) => r.status.toUpperCase() === "DISMISSED").length,
      action: reports.filter((r) => r.status.toUpperCase() === "ACTION_TAKEN").length,
    }),
    [reports],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <ShieldCheck size={14} />
            Administration
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Review community reports and update their moderation status.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReports}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {actionError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: "Pending", value: counts.pending, icon: Clock3, filter: "PENDING" },
          { label: "Reviewed", value: counts.reviewed, icon: CheckCircle2, filter: "REVIEWED" },
          { label: "Dismissed", value: counts.dismissed, icon: XCircle, filter: "DISMISSED" },
          { label: "Action taken", value: counts.action, icon: AlertTriangle, filter: "ACTION_TAKEN" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.filter}
              type="button"
              onClick={() => setFilter(filter === stat.filter ? "ALL" : stat.filter)}
              className={`rounded-2xl border p-4 text-left transition ${
                filter === stat.filter
                  ? "border-indigo-200 bg-indigo-50 ring-1 ring-indigo-100"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <Icon size={17} className="text-slate-500" />
              <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            </button>
          );
        })}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === status
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {formatStatus(status)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-56 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <FileWarning className="mx-auto text-slate-400" size={30} />
          <h2 className="mt-4 text-xl font-bold text-slate-900">No reports found</h2>
          <p className="mt-2 text-sm text-slate-500">
            There are no reports matching the selected status.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const item = report.lostItem || report.foundItem;
            const itemPath = item
              ? report.lostItem
                ? `/lost-items/${item.id}`
                : `/found-items/${item.id}`
              : "";
            const busy = actionId === report.id;
            const currentStatus = report.status.toUpperCase();

            return (
              <article key={report.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(report.status)}`}>
                        {formatStatus(report.status)}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(report.createdAt)}</span>
                    </div>

                    <h2 className="mt-3 text-lg font-bold text-slate-900">
                      {item?.title || "Item unavailable"}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      {report.lostItem ? "Lost item report" : "Found item report"}
                    </p>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reason</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{report.reason}</p>
                    </div>

                    {report.reporter && (
                      <div className="mt-4 text-xs text-slate-500">
                        Reported by <span className="font-semibold text-slate-700">{report.reporter.name}</span> ({report.reporter.email})
                      </div>
                    )}
                  </div>

                  <div className="w-full shrink-0 lg:w-64">
                    {item && itemPath && (
                      <Link
                        to={itemPath}
                        className="mb-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                      >
                        View reported item
                      </Link>
                    )}

                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">Update status</label>
                    <select
                      value={currentStatus}
                      disabled={busy}
                      onChange={(event) => updateStatus(report.id, event.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 disabled:opacity-60"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="REVIEWED">Reviewed</option>
                      <option value="DISMISSED">Dismissed</option>
                      <option value="ACTION_TAKEN">Action Taken</option>
                    </select>
                    {busy && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                        <Loader2 size={13} className="animate-spin" /> Saving...
                      </p>
                    )}
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
