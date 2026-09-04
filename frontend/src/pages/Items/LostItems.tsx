import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PackageSearch,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

interface Category {
  id: string;
  name: string;
}

interface LostItem {
  id: string;
  title: string;
  description: string;
  location: string;
  lostAt: string;
  status: string;
  category?: Category;
}

interface LostItemsResponse {
  items: LostItem[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export default function LostItems() {
  const [items, setItems] = useState<LostItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchLocation, setSearchLocation] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadItems();
  }, [page, categoryId, searchLocation]);

  async function loadCategories() {
    try {
      const response = await api.get("/categories");

      const data = response.data;

      setCategories(Array.isArray(data) ? data : data?.categories || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }

  async function loadItems() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<LostItemsResponse>("/lost-items", {
        params: {
          page,
          limit: 12,
          ...(categoryId ? { categoryId } : {}),
          ...(searchLocation.trim() ? { location: searchLocation.trim() } : {}),
        },
      });

      setItems(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      console.error("Failed to load lost items:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load lost items. Please try again.",
      );

      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setCategoryId("");
    setSearchLocation("");
    setPage(1);
  }

  const hasFilters = categoryId !== "" || searchLocation.trim() !== "";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <section className="mb-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <PackageSearch size={14} />
              Lost items
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Find a lost item
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Browse items reported lost by the FindIt community. You might be
              able to help someone recover what they lost.
            </p>
          </div>

          <Link
            to="/lost-items/create"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <Plus size={17} />
            Report Lost Item
          </Link>
        </div>
      </section>

      {/* Search / Filters */}
      <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Location search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchLocation}
              onChange={(e) => {
                setPage(1);
                setSearchLocation(e.target.value);
              }}
              placeholder="Search by location..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          {/* Category */}
          <div className="relative lg:w-60">
            <select
              value={categoryId}
              onChange={(e) => {
                setPage(1);
                setCategoryId(e.target.value);
              }}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            >
              <option value="">All categories</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 lg:hidden"
          >
            <SlidersHorizontal size={17} />
            Filters
          </button>

          {/* Clear */}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>

        {/* Filter information */}
        {showFilters && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-500 lg:hidden">
            Use the search field and category selector above to narrow down lost
            item reports.
          </div>
        )}
      </section>

      {/* Error */}
      {error && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-red-700">{error}</p>

          <button
            type="button"
            onClick={loadItems}
            className="self-start rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm hover:bg-red-100 sm:self-auto"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results header */}
      {!loading && !error && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {items.length === 0
              ? "No items found"
              : `Showing ${items.length} lost ${
                  items.length === 1 ? "item" : "items"
                }`}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="h-36 animate-pulse bg-slate-100" />

              <div className="space-y-3 p-5">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <PackageSearch size={25} />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-800">
            No lost items found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            We couldn't find any lost item reports matching your current
            filters.
          </p>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Clear filters
            </button>
          ) : (
            <Link
              to="/lost-items/create"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={16} />
              Report Lost Item
            </Link>
          )}
        </div>
      )}

      {/* Items */}
      {!loading && !error && items.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/lost-items/${item.id}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >
              {/* Card top */}
              <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-slate-50">
                <PackageSearch
                  size={42}
                  strokeWidth={1.5}
                  className="text-amber-500 transition duration-200 group-hover:scale-110"
                />

                <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-600 shadow-sm">
                  {item.status}
                </span>
              </div>

              {/* Card body */}
              <div className="p-5">
                <div className="mb-3">
                  {item.category?.name && (
                    <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-600">
                      {item.category.name}
                    </span>
                  )}
                </div>

                <h2 className="line-clamp-1 text-lg font-semibold text-slate-900">
                  {item.title}
                </h2>

                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                  {item.description}
                </p>

                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={14} className="shrink-0 text-slate-400" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays
                      size={14}
                      className="shrink-0 text-slate-400"
                    />
                    <span>
                      {new Date(item.lostAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-semibold text-slate-400">
                    View details
                  </span>

                  <span className="text-sm font-semibold text-indigo-600 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && items.length > 0 && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="text-sm font-medium text-slate-500">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
