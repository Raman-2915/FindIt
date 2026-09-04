import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  EllipsisVertical,
  FileSearch,
  FolderSearch,
  Loader2,
  MapPin,
  PackageSearch,
  Pencil,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";
import EditItemModal from "../../components/items/EditItemModal";

interface Category {
  id: string;
  name: string;
}

interface LostItem {
  id: string;
  title: string;
  location: string;
  lostAt: string;
  status: string;
  category?: Category;
}

interface FoundItem {
  id: string;
  title: string;
  location: string;
  foundAt: string;
  status: string;
  category?: Category;
}

interface LostResponse {
  items: LostItem[];
}

interface FoundResponse {
  items: FoundItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type Tab = "lost" | "found";

type SelectedItem = LostItem | FoundItem;

export default function MyReports() {
  const [activeTab, setActiveTab] = useState<Tab>("lost");

  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);

  const [loadingLost, setLoadingLost] = useState(true);
  const [loadingFound, setLoadingFound] = useState(false);

  const [lostError, setLostError] = useState("");
  const [foundError, setFoundError] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<SelectedItem | null>(null);

  const [deletingItem, setDeletingItem] = useState<SelectedItem | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    loadLostItems();
    loadFoundItems();
  }, []);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (!target.closest("[data-report-menu]")) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", closeMenu);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
    };
  }, []);

  async function loadLostItems() {
    try {
      setLoadingLost(true);
      setLostError("");

      const response = await api.get<LostResponse>("/lost-items/my");

      setLostItems(response.data.items || []);
    } catch (error: any) {
      console.error("Failed to load lost reports:", error);

      setLostError(
        error.response?.data?.message || "Unable to load your lost reports.",
      );
    } finally {
      setLoadingLost(false);
    }
  }

  async function loadFoundItems() {
    try {
      setLoadingFound(true);
      setFoundError("");

      const response = await api.get<FoundResponse>("/found-items/my", {
        params: {
          page: 1,
          limit: 50,
        },
      });

      setFoundItems(response.data.items || []);
    } catch (error: any) {
      console.error("Failed to load found reports:", error);

      setFoundError(
        error.response?.data?.message || "Unable to load your found reports.",
      );
    } finally {
      setLoadingFound(false);
    }
  }

  async function refreshReports() {
    await Promise.all([loadLostItems(), loadFoundItems()]);
  }

  async function handleDelete() {
    if (!deletingItem) return;

    try {
      setDeleteLoading(true);
      setDeleteError("");

      const endpoint =
        activeTab === "lost"
          ? `/lost-items/${deletingItem.id}`
          : `/found-items/${deletingItem.id}`;

      await api.delete(endpoint);

      setDeletingItem(null);
      setOpenMenuId(null);

      await refreshReports();
    } catch (error: any) {
      console.error("Failed to delete report:", error);

      setDeleteError(
        error.response?.data?.message ||
          "Unable to delete this report. Please try again.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  function formatDate(date?: string) {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatStatus(status?: string) {
    if (!status) return "Unknown";

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  const activeItems = useMemo(() => {
    return activeTab === "lost" ? lostItems : foundItems;
  }, [activeTab, lostItems, foundItems]);

  const isLoading = activeTab === "lost" ? loadingLost : loadingFound;

  const activeError = activeTab === "lost" ? lostError : foundError;

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <FileSearch size={14} />
            Your activity
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                My Reports
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Keep track of the items you've reported as lost or found.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                to="/lost-items/create"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                Report Lost
              </Link>

              <Link
                to="/found-items/create"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Report Found
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("lost")}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                activeTab === "lost"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <PackageSearch size={17} />
              Lost Items
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === "lost"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {lostItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("found")}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                activeTab === "found"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <FolderSearch size={17} />
              Found Items
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === "found"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {foundItems.length}
              </span>
            </button>
          </div>
        </div>

        {/* Error */}
        {activeError && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-red-700">{activeError}</p>

            <button
              type="button"
              onClick={activeTab === "lost" ? loadLostItems : loadFoundItems}
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((number) => (
              <div
                key={number}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-100" />

                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !activeError && activeItems.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                activeTab === "lost"
                  ? "bg-indigo-50 text-indigo-500"
                  : "bg-emerald-50 text-emerald-500"
              }`}
            >
              {activeTab === "lost" ? (
                <PackageSearch size={28} />
              ) : (
                <FolderSearch size={28} />
              )}
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No {activeTab} items yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {activeTab === "lost"
                ? "If you've lost something, report it here so others can help you find it."
                : "If you've found something, report it here so its owner can find it."}
            </p>

            <Link
              to={
                activeTab === "lost"
                  ? "/lost-items/create"
                  : "/found-items/create"
              }
              className={`mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white ${
                activeTab === "lost"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {activeTab === "lost" ? "Report Lost Item" : "Report Found Item"}
            </Link>
          </div>
        )}

        {/* Reports */}
        {!isLoading && !activeError && activeItems.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {activeItems.map((item) => {
              const date =
                activeTab === "lost"
                  ? (item as LostItem).lostAt
                  : (item as FoundItem).foundAt;

              const detailsPath =
                activeTab === "lost"
                  ? `/lost-items/${item.id}`
                  : `/found-items/${item.id}`;

              const isActive = item.status?.toUpperCase() === "ACTIVE";

              return (
                <div
                  key={item.id}
                  className="group overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="p-5">
                    {/* Top */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          activeTab === "lost"
                            ? "bg-indigo-50 text-indigo-500"
                            : "bg-emerald-50 text-emerald-500"
                        }`}
                      >
                        {activeTab === "lost" ? (
                          <PackageSearch size={22} />
                        ) : (
                          <FolderSearch size={22} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-slate-400">
                            {item.category?.name || "Uncategorized"}
                          </span>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              isActive
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {formatStatus(item.status)}
                          </span>
                        </div>

                        <h2 className="truncate text-lg font-bold text-slate-900">
                          {item.title}
                        </h2>
                      </div>

                      {/* Actions */}
                      <div className="relative shrink-0" data-report-menu>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === item.id ? null : item.id,
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Report actions"
                        >
                          <EllipsisVertical size={18} />
                        </button>

                        {openMenuId === item.id && (
                          <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem(item);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                              <Pencil size={15} />
                              Edit report
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDeletingItem(item);
                                setDeleteError("");
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                              Delete report
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Information */}
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <div className="min-w-0">
                            <p className="text-[11px] font-medium text-slate-400">
                              Location
                            </p>

                            <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">
                              {item.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <div>
                            <p className="text-[11px] font-medium text-slate-400">
                              {activeTab === "lost" ? "Lost" : "Found"}
                            </p>

                            <p className="mt-0.5 text-xs font-semibold text-slate-700">
                              {formatDate(date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs text-slate-400">
                        Your report
                      </span>

                      <Link
                        to={detailsPath}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition group-hover:text-indigo-700"
                      >
                        View details
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          type={activeTab}
          onClose={() => setEditingItem(null)}
          onUpdated={refreshReports}
        />
      )}

      {/* Delete Modal */}
      {deletingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleteLoading) {
              setDeletingItem(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Trash2 size={21} />
              </div>

              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={deleteLoading}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Delete this report?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You're about to permanently delete{" "}
              <span className="font-semibold text-slate-700">
                "{deletingItem.title}"
              </span>
              . This action cannot be undone.
            </p>

            {deleteError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={deleteLoading}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteLoading && (
                  <Loader2 size={16} className="animate-spin" />
                )}

                {deleteLoading ? "Deleting..." : "Delete report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
