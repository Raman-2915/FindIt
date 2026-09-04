import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FolderSearch,
  Loader2,
  MapPin,
  PackageSearch,
  Tag,
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";

import api from "../../services/api";

interface Category {
  id: string;
  name: string;
}

interface Item {
  id: string;
  title: string;
  location: string;
  status: string;
  category?: Category;
  lostAt?: string;
  foundAt?: string;
}

type ItemType = "lost" | "found";

interface ItemResponse {
  item: Item;
}

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const routerLocation = useLocation();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const itemType: ItemType = routerLocation.pathname.startsWith("/found-items")
    ? "found"
    : "lost";

  const isFound = itemType === "found";

  useEffect(() => {
    if (!id) {
      setError("Item ID is missing.");
      setLoading(false);
      return;
    }

    loadItem(id);
  }, [id, itemType]);

  async function loadItem(itemId: string) {
    try {
      setLoading(true);
      setError("");

      const endpoint = isFound
        ? `/found-items/${itemId}`
        : `/lost-items/${itemId}`;

      const response = await api.get<ItemResponse>(endpoint);

      setItem(response.data.item);
    } catch (err: any) {
      console.error("Failed to load item:", err);

      if (err.response?.status === 404) {
        setError(isFound ? "Found item not found." : "Lost item not found.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load item details. Please try again.",
        );
      }

      setItem(null);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date?: string) {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatStatus(status: string) {
    if (!status) return "Unknown";

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  const itemDate = isFound ? item?.foundAt : item?.lostAt;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Back */}
      <Link
        to={isFound ? "/found-items" : "/lost-items"}
        className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft size={16} />
        Back to {isFound ? "found items" : "lost items"}
      </Link>

      {/* Loading */}
      {loading && (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-52 animate-pulse bg-slate-100 sm:h-64" />

          <div className="space-y-5 p-6 sm:p-8">
            <div className="h-5 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-9 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />

            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <PackageSearch size={28} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Unable to find this item
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {error}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => id && loadItem(id)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Try again
            </button>

            <Link
              to={isFound ? "/found-items" : "/lost-items"}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Go back
            </Link>
          </div>
        </div>
      )}

      {/* Item */}
      {!loading && !error && item && (
        <>
          {/* Main card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Hero */}
            <div
              className={`relative flex min-h-56 items-center justify-center overflow-hidden sm:min-h-64 ${
                isFound
                  ? "bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50"
                  : "bg-gradient-to-br from-indigo-50 via-violet-50 to-slate-50"
              }`}
            >
              <div
                className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-sm ${
                  isFound ? "text-emerald-500" : "text-indigo-500"
                }`}
              >
                {isFound ? (
                  <FolderSearch size={48} strokeWidth={1.5} />
                ) : (
                  <PackageSearch size={48} strokeWidth={1.5} />
                )}
              </div>

              {/* Status */}
              <div className="absolute right-5 top-5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-sm ${
                    item.status.toUpperCase() === "ACTIVE"
                      ? "text-emerald-600"
                      : "text-slate-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      item.status.toUpperCase() === "ACTIVE"
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />

                  {formatStatus(item.status)}
                </span>
              </div>

              {/* Type */}
              <div className="absolute bottom-5 left-5">
                <span
                  className={`rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow-sm ${
                    isFound ? "text-emerald-700" : "text-indigo-700"
                  }`}
                >
                  {isFound ? "FOUND ITEM" : "LOST ITEM"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Title */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  {item.category?.name && (
                    <>
                      <Tag size={15} className="text-slate-400" />

                      <span className="text-sm font-medium text-slate-500">
                        {item.category.name}
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {item.title}
                </h1>
              </div>

              {/* Information */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {/* Location */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                      <MapPin size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-400">
                        {isFound ? "Found location" : "Last seen location"}
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                        {item.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                      <CalendarDays size={19} />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        {isFound ? "Date found" : "Date lost"}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatDate(itemDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                      <Tag size={19} />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Category
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {item.category?.name || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-500 shadow-sm">
                      <CheckCircle2 size={19} />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Current status
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatStatus(item.status)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description placeholder */}
              <div className="mt-8 rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
                <p className="text-sm font-semibold text-amber-900">
                  More information coming soon
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700/80">
                  The current backend detail API does not return the item's
                  description or reporter information yet. We'll add those
                  during the backend improvement phase.
                </p>
              </div>

              {/* Action */}
              <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-slate-400">
                    Think this is your item?
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    More claim/contact functionality will be added next.
                  </p>
                </div>

                <button
                  type="button"
                  disabled
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 text-sm font-semibold text-slate-400"
                >
                  <Loader2 size={16} />
                  Claim feature coming soon
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
