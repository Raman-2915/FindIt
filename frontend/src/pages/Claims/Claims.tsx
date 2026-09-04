import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  MessageSquareText,
  PackageCheck,
  Search,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

interface Category {
  id: string;
  name: string;
}

interface FoundItem {
  id: string;
  title: string;
  description?: string;
  location: string;
  foundAt: string;
  status: string;
  category?: Category;
}

interface FoundItemsResponse {
  items: FoundItem[];
}

type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED" | string;

interface Claim {
  id: string;
  message: string;
  status: ClaimStatus;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
  };
}

interface ClaimsResponse {
  claims: Claim[];
}

export default function Claims() {
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [selectedFoundItemId, setSelectedFoundItemId] = useState("");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [search, setSearch] = useState("");

  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadFoundItems();
  }, []);

  useEffect(() => {
    if (selectedFoundItemId) {
      loadClaims(selectedFoundItemId);
    } else {
      setClaims([]);
    }
  }, [selectedFoundItemId]);

  async function loadFoundItems() {
    try {
      setLoadingItems(true);
      setError("");

      const response = await api.get<FoundItemsResponse>("/found-items/my", {
        params: { page: 1, limit: 50 },
      });

      const items = response.data.items || [];
      setFoundItems(items);

      if (items.length > 0) {
        setSelectedFoundItemId(items[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load found items:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load your found items. Please try again.",
      );
    } finally {
      setLoadingItems(false);
    }
  }

  async function loadClaims(foundItemId: string) {
    try {
      setLoadingClaims(true);
      setError("");

      const response = await api.get<ClaimsResponse>(
        `/found-items/${foundItemId}/claims`,
      );

      setClaims(response.data.claims || []);
    } catch (err: any) {
      console.error("Failed to load claims:", err);
      setClaims([]);
      setError(
        err.response?.data?.message ||
          "Unable to load claims for this item. Please try again.",
      );
    } finally {
      setLoadingClaims(false);
    }
  }

  async function updateClaim(claimId: string, action: "approve" | "reject") {
    try {
      setActionId(claimId);
      setActionError("");
      setSuccess("");

      await api.patch(`/claims/${claimId}/${action}`);

      setSuccess(
        action === "approve"
          ? "Claim approved successfully. Other pending claims were rejected automatically."
          : "Claim rejected successfully.",
      );

      if (selectedFoundItemId) {
        await loadClaims(selectedFoundItemId);
        if (action === "approve") {
          setFoundItems((current) =>
            current.map((item) =>
              item.id === selectedFoundItemId
                ? { ...item, status: "CLAIMED" }
                : item,
            ),
          );
        }
      }
    } catch (err: any) {
      console.error(`Failed to ${action} claim:`, err);
      setActionError(
        err.response?.data?.message ||
          `Unable to ${action} this claim. Please try again.`,
      );
    } finally {
      setActionId(null);
    }
  }

  function formatDate(date?: string) {
    if (!date) return "Date unavailable";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Date unavailable";

    return parsed.toLocaleDateString(undefined, {
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

  function statusClass(status: ClaimStatus) {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700";
      case "REJECTED":
        return "bg-red-50 text-red-700";
      default:
        return "bg-amber-50 text-amber-700";
    }
  }

  const selectedFoundItem = useMemo(
    () => foundItems.find((item) => item.id === selectedFoundItemId),
    [foundItems, selectedFoundItemId],
  );

  const filteredFoundItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return foundItems;

    return foundItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query),
    );
  }, [foundItems, search]);

  const pendingCount = claims.filter(
    (claim) => claim.status.toUpperCase() === "PENDING",
  ).length;
  const approvedCount = claims.filter(
    (claim) => claim.status.toUpperCase() === "APPROVED",
  ).length;
  const rejectedCount = claims.filter(
    (claim) => claim.status.toUpperCase() === "REJECTED",
  ).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <PackageCheck size={14} />
          Claim management
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Claims
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Review people claiming the found items you reported and decide who
            should receive them.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadFoundItems}
            className="w-fit rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {loadingItems ? (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="h-96 animate-pulse rounded-2xl bg-white" />
          <div className="h-96 animate-pulse rounded-2xl bg-white" />
        </div>
      ) : foundItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
            <PackageCheck size={28} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No found items to manage
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Claims appear here when someone reports a found item under your
            account and another user submits a claim for it.
          </p>
          <Link
            to="/found-items/create"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Report Found Item
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-6">
            <div className="px-2 pb-3">
              <p className="text-sm font-bold text-slate-900">Your found items</p>
              <p className="mt-1 text-xs text-slate-400">
                Select an item to review its claims.
              </p>
            </div>

            <div className="relative mb-2">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your reports..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:bg-white"
              />
            </div>

            <div className="max-h-[430px] space-y-1 overflow-y-auto">
              {filteredFoundItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedFoundItemId(item.id);
                    setSuccess("");
                    setActionError("");
                  }}
                  className={`w-full rounded-xl p-3 text-left transition ${
                    selectedFoundItemId === item.id
                      ? "bg-emerald-50 ring-1 ring-emerald-100"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        selectedFoundItemId === item.id
                          ? "bg-white text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <PackageCheck size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {item.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {item.location}
                      </p>
                    </div>
                    <ChevronRight
                      size={15}
                      className={
                        selectedFoundItemId === item.id
                          ? "text-emerald-500"
                          : "text-slate-300"
                      }
                    />
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section>
            {selectedFoundItem && (
              <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      Claims for
                    </p>
                    <h2 className="mt-1 truncate text-xl font-bold text-slate-900">
                      {selectedFoundItem.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedFoundItem.category?.name || "Uncategorized"} · {selectedFoundItem.location} · {formatStatus(selectedFoundItem.status)}
                    </p>
                  </div>
                  <Link
                    to={`/found-items/${selectedFoundItem.id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    View item
                  </Link>
                </div>
              </div>
            )}

            <div className="mb-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                <Clock3 size={17} className="text-amber-600" />
                <p className="mt-3 text-2xl font-bold text-slate-900">{pendingCount}</p>
                <p className="text-xs font-medium text-slate-500">Pending</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <CheckCircle2 size={17} className="text-emerald-600" />
                <p className="mt-3 text-2xl font-bold text-slate-900">{approvedCount}</p>
                <p className="text-xs font-medium text-slate-500">Approved</p>
              </div>
              <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4">
                <XCircle size={17} className="text-red-500" />
                <p className="mt-3 text-2xl font-bold text-slate-900">{rejectedCount}</p>
                <p className="text-xs font-medium text-slate-500">Rejected</p>
              </div>
            </div>

            {loadingClaims ? (
              <div className="space-y-4">
                {[1, 2].map((number) => (
                  <div
                    key={number}
                    className="h-52 animate-pulse rounded-2xl bg-white"
                  />
                ))}
              </div>
            ) : claims.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <MessageSquareText size={25} />
                </div>
                <h2 className="mt-5 text-lg font-bold text-slate-900">
                  No claims yet
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  When someone believes your found item belongs to them, their
                  claim and message will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {claims.map((claim) => {
                  const pending = claim.status.toUpperCase() === "PENDING";
                  const busy = actionId === claim.id;

                  return (
                    <article
                      key={claim.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <UserRound size={19} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900">
                              {claim.user?.name || "Unknown user"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Submitted {formatDate(claim.createdAt)}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClass(claim.status)}`}
                        >
                          {formatStatus(claim.status)}
                        </span>
                      </div>

                      <div className="mt-4 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold text-slate-400">
                          Claim message
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {claim.message}
                        </p>
                      </div>

                      {pending && selectedFoundItem && selectedFoundItem.status.toUpperCase() === "ACTIVE" && (
                        <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => updateClaim(claim.id, "reject")}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {busy ? <Loader2 size={15} className="animate-spin" /> : <X size={15} />}
                            Reject
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => updateClaim(claim.id, "approve")}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                            Approve claim
                          </button>
                        </div>
                      )}

                      {selectedFoundItem && selectedFoundItem.status.toUpperCase() === "CLAIMED" && claim.status.toUpperCase() === "APPROVED" && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 size={15} />
                          This claim was approved and the found item is now claimed.
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
