import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileWarning,
  Loader2,
  PackageSearch,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

interface ReportItem {
  id: string;
  title: string;
  status: string;
}

interface Report {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  lostItem?: ReportItem;
  foundItem?: ReportItem;
}

interface ReportsResponse {
  reports: Report[];
}

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
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
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

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<ReportsResponse>("/reports/my");
      setReports(response.data.reports || []);
    } catch (err: any) {
      console.error("Failed to load reports:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load your reports. Please try again.",
      );
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    if (filter === "ALL") return reports;
    return reports.filter((report) => report.status.toUpperCase() === filter);
  }, [filter, reports]);

  const counts = useMemo(
    () => ({
      all: reports.length,
      pending: reports.filter((r) => r.status.toUpperCase() === "PENDING").length,
      reviewed: reports.filter((r) => r.status.toUpperCase() === "REVIEWED").length,
      action: reports.filter((r) => r.status.toUpperCase() === "ACTION_TAKEN").length,
    }),
    [reports],
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <FileWarning size={14} />
            Safety reports
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            My Reports
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Track reports you've submitted about lost or found item listings.
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
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadReports}
            className="w-fit rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm"
          >
            Try again
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "All", value: counts.all, icon: FileWarning, filter: "ALL" },
          { label: "Pending", value: counts.pending, icon: Clock3, filter: "PENDING" },
          { label: "Reviewed", value: counts.reviewed, icon: CheckCircle2, filter: "REVIEWED" },
          { label: "Action taken", value: counts.action, icon: AlertTriangle, filter: "ACTION_TAKEN" },
        ].map((stat) => {
          const Icon = stat.icon;
          const active = filter === stat.filter;
          return (
            <button
              key={stat.filter}
              type="button"
              onClick={() => setFilter(stat.filter)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
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

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-48 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <FileWarning size={28} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            {reports.length === 0 ? "No reports submitted" : "No reports in this status"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {reports.length === 0
              ? "If you see a suspicious, incorrect, or inappropriate listing, you can report it from the item details page."
              : "Try another status filter to see your other reports."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const item = report.lostItem || report.foundItem;
            const isLost = Boolean(report.lostItem);
            const itemPath = item
              ? isLost
                ? `/lost-items/${item.id}`
                : `/found-items/${item.id}`
              : "";

            return (
              <article
                key={report.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <PackageSearch size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-bold text-slate-900">
                          {item?.title || "Item unavailable"}
                        </h2>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          {isLost ? "Lost item" : "Found item"}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                        <CalendarDays size={13} />
                        Submitted {formatDate(report.createdAt)}
                      </div>
                    </div>
                  </div>

                  <span className={`self-start rounded-full px-3 py-1.5 text-xs font-bold ${statusClasses(report.status)}`}>
                    {formatStatus(report.status)}
                  </span>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Your reason
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {report.reason}
                  </p>
                </div>

                {item && itemPath && (
                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-400">
                      Current item status: <span className="font-semibold text-slate-600">{formatStatus(item.status)}</span>
                    </p>
                    <Link
                      to={itemPath}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                    >
                      View item
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
