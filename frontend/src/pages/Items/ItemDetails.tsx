import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  FolderSearch,
  Loader2,
  MapPin,
  PackageSearch,
  Send,
  Tag,
  UserRound,
  X,
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
  description?: string;
  location: string;
  status: string;
  category?: Category;
  lostAt?: string;
  foundAt?: string;
}

type ItemType = "lost" | "found";

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

interface ItemResponse {
  item: Item;
}

interface ClaimsResponse {
  claims: Claim[];
}

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const routerLocation = useLocation();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [claimMessage, setClaimMessage] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState("");
  const [claimError, setClaimError] = useState("");
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);

  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsError, setClaimsError] = useState("");
  const [canManageClaims, setCanManageClaims] = useState(false);
  const [claimActionId, setClaimActionId] = useState<string | null>(null);

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

  useEffect(() => {
    if (isFound && id && item) {
      loadClaims(id);
    } else {
      setClaims([]);
      setCanManageClaims(false);
    }
  }, [id, isFound, item?.id]);

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

  async function loadClaims(foundItemId: string) {
    try {
      setClaimsLoading(true);
      setClaimsError("");

      const response = await api.get<ClaimsResponse>(
        `/found-items/${foundItemId}/claims`,
      );

      setClaims(response.data.claims || []);
      setCanManageClaims(true);
    } catch (err: any) {
      // A 403 simply means the current user is not the owner of this found item.
      if (err.response?.status === 403) {
        setCanManageClaims(false);
        setClaims([]);
        setClaimsError("");
      } else {
        console.error("Failed to load claims:", err);
        setClaimsError(
          err.response?.data?.message || "Unable to load claims.",
        );
      }
    } finally {
      setClaimsLoading(false);
    }
  }

  async function submitClaim() {
    if (!id || !claimMessage.trim()) return;

    if (claimMessage.trim().length < 10) {
      setClaimError("Please provide at least 10 characters explaining why this is your item.");
      return;
    }

    try {
      setClaimSubmitting(true);
      setClaimError("");
      setClaimSuccess("");

      await api.post(`/found-items/${id}/claims`, {
        message: claimMessage.trim(),
      });

      setClaimMessage("");
      setClaimSubmitted(true);
      setShowClaimForm(false);
      setClaimSuccess("Your claim has been submitted successfully.");
    } catch (err: any) {
      console.error("Failed to submit claim:", err);
      setClaimError(
        err.response?.data?.message ||
          "Unable to submit your claim. Please try again.",
      );
    } finally {
      setClaimSubmitting(false);
    }
  }

  async function updateClaim(claimId: string, action: "approve" | "reject") {
    try {
      setClaimActionId(claimId);
      setClaimsError("");

      await api.patch(`/claims/${claimId}/${action}`);

      if (id) {
        await loadClaims(id);
      }

      if (action === "approve") {
        setItem((current) =>
          current ? { ...current, status: "CLAIMED" } : current,
        );
      }
    } catch (err: any) {
      console.error(`Failed to ${action} claim:`, err);
      setClaimsError(
        err.response?.data?.message ||
          `Unable to ${action} this claim. Please try again.`,
      );
    } finally {
      setClaimActionId(null);
    }
  }

  function formatDate(date?: string) {
    if (!date) return "Not available";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Not available";

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

  function claimStatusClass(status: ClaimStatus) {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700";
      case "REJECTED":
        return "bg-red-50 text-red-700";
      default:
        return "bg-amber-50 text-amber-700";
    }
  }

  const itemDate = isFound ? item?.foundAt : item?.lostAt;
  const isActiveFoundItem = isFound && item?.status.toUpperCase() === "ACTIVE";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link
        to={isFound ? "/found-items" : "/lost-items"}
        className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft size={16} />
        Back to {isFound ? "found items" : "lost items"}
      </Link>

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

      {!loading && !error && item && (
        <>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
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

            <div className="p-6 sm:p-8">
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

              {item.description && (
                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                  <p className="text-xs font-medium text-slate-400">Description</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {item.description}
                  </p>
                </div>
              )}

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
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

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                      <Tag size={19} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">Category</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {item.category?.name || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-500 shadow-sm">
                      <CheckCircle2 size={19} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">Current status</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatStatus(item.status)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {claimSuccess && (
                <div className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
                  <p>{claimSuccess}</p>
                </div>
              )}

              {isFound && !canManageClaims && (
                <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-indigo-900">
                        Think this is your item?
                      </p>
                      <p className="mt-1 text-xs leading-5 text-indigo-700/80">
                        Submit a claim and explain details that can help the finder verify ownership.
                      </p>
                    </div>

                    {isActiveFoundItem && !claimSubmitted ? (
                      <button
                        type="button"
                        onClick={() => {
                          setClaimError("");
                          setShowClaimForm(true);
                        }}
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                      >
                        <Send size={16} />
                        Claim this item
                      </button>
                    ) : (
                      <span className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 text-sm font-semibold text-slate-400">
                        {claimSubmitted ? "Claim submitted" : "Claims closed"}
                      </span>
                    )}
                  </div>

                  {claimError && (
                    <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700">
                      {claimError}
                    </p>
                  )}

                  {showClaimForm && (
                    <div className="mt-5 border-t border-indigo-100 pt-5">
                      <label className="text-sm font-semibold text-slate-800" htmlFor="claim-message">
                        Why do you believe this is your item?
                      </label>
                      <textarea
                        id="claim-message"
                        value={claimMessage}
                        onChange={(event) => setClaimMessage(event.target.value)}
                        maxLength={1000}
                        rows={5}
                        placeholder="Describe identifying details, where you lost it, or anything only the owner would know..."
                        className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                        <span>Minimum 10 characters</span>
                        <span>{claimMessage.length}/1000</span>
                      </div>
                      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setShowClaimForm(false);
                            setClaimError("");
                          }}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          <X size={15} />
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={submitClaim}
                          disabled={claimSubmitting || claimMessage.trim().length < 10}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {claimSubmitting ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Send size={15} />
                          )}
                          Submit claim
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {isFound && canManageClaims && (
            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    <UserRound size={14} />
                    Owner controls
                  </div>
                  <h2 className="mt-3 text-xl font-bold text-slate-900">
                    Claims for this item
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review ownership explanations and decide which claim should be approved.
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-400">
                  {claims.length} {claims.length === 1 ? "claim" : "claims"}
                </span>
              </div>

              {claimsError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {claimsError}
                </div>
              )}

              {claimsLoading ? (
                <div className="mt-6 space-y-3">
                  {[1, 2].map((number) => (
                    <div key={number} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              ) : claims.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-5 py-10 text-center">
                  <UserRound className="mx-auto text-slate-400" size={26} />
                  <p className="mt-3 text-sm font-semibold text-slate-700">No claims yet</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Claims submitted by users will appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {claims.map((claim) => {
                    const pending = claim.status.toUpperCase() === "PENDING";
                    const actionLoading = claimActionId === claim.id;

                    return (
                      <article key={claim.id} className="rounded-2xl border border-slate-200 p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                              <UserRound size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {claim.user?.name || "Community member"}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                Submitted {formatDate(claim.createdAt)}
                              </p>
                            </div>
                          </div>

                          <span className={`self-start rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${claimStatusClass(claim.status)}`}>
                            {formatStatus(claim.status)}
                          </span>
                        </div>

                        <div className="mt-4 rounded-xl bg-slate-50 p-4">
                          <p className="text-sm leading-6 text-slate-700">{claim.message}</p>
                        </div>

                        {pending && item.status.toUpperCase() === "ACTIVE" && (
                          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => updateClaim(claim.id, "reject")}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <X size={15} />}
                              Reject
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => updateClaim(claim.id, "approve")}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                              Approve claim
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
