import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  HeartHandshake,
  Loader2,
  MapPin,
  PackageSearch,
  RefreshCw,
  Search,
  Sparkles,
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
  location: string;
  lostAt: string;
  status: string;
  category?: Category;
}

interface LostItemsResponse {
  items: LostItem[];
}

interface FoundItemMatch {
  id: string;
  title: string;
  location: string;
  foundAt: string;
  status: string;
  categoryId: string;
}

interface Match {
  id: string;
  lostItemId: string;
  foundItemId: string;
  score: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | string;
  createdAt?: string;
  foundItem: FoundItemMatch;
}

interface MatchesResponse {
  matches: Match[];
}

interface GenerateMatchesResponse {
  message: string;
  matches: Array<{
    foundItemId: string;
    score: number;
  }>;
}

export default function Matches() {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [selectedLostItemId, setSelectedLostItemId] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);

  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLostItems();
  }, []);

  useEffect(() => {
    if (selectedLostItemId) {
      loadMatches(selectedLostItemId);
    } else {
      setMatches([]);
    }
  }, [selectedLostItemId]);

  async function loadLostItems() {
    try {
      setLoadingItems(true);
      setError("");

      const response = await api.get<LostItemsResponse>("/lost-items/my");
      const items = response.data.items || [];

      setLostItems(items);

      if (items.length > 0) {
        setSelectedLostItemId(items[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load lost items:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load your lost items. Please try again.",
      );
    } finally {
      setLoadingItems(false);
    }
  }

  async function loadMatches(lostItemId: string) {
    try {
      setLoadingMatches(true);
      setError("");

      const response = await api.get<MatchesResponse>(
        `/lost-items/${lostItemId}/matches`,
      );

      setMatches(response.data.matches || []);
    } catch (err: any) {
      console.error("Failed to load matches:", err);
      setMatches([]);
      setError(
        err.response?.data?.message ||
          "Unable to load matches for this item. Please try again.",
      );
    } finally {
      setLoadingMatches(false);
    }
  }

  async function generateMatches() {
    if (!selectedLostItemId) return;

    try {
      setGenerating(true);
      setActionError("");
      setSuccess("");

      const response = await api.post<GenerateMatchesResponse>(
        `/lost-items/${selectedLostItemId}/matches/generate`,
      );

      setSuccess(
        response.data.matches?.length
          ? `${response.data.matches.length} potential match${
              response.data.matches.length === 1 ? "" : "es"
            } found.`
          : "No strong matches found yet.",
      );

      await loadMatches(selectedLostItemId);
    } catch (err: any) {
      console.error("Failed to generate matches:", err);
      setActionError(
        err.response?.data?.message ||
          "Unable to generate matches. Please try again.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function updateMatch(matchId: string, action: "accept" | "reject") {
    try {
      setActionId(matchId);
      setActionError("");
      setSuccess("");

      await api.patch(`/matches/${matchId}/${action}`);

      setSuccess(
        action === "accept"
          ? "Match accepted successfully."
          : "Match rejected successfully.",
      );

      if (selectedLostItemId) {
        await loadMatches(selectedLostItemId);
      }
    } catch (err: any) {
      console.error(`Failed to ${action} match:`, err);
      setActionError(
        err.response?.data?.message ||
          `Unable to ${action} this match. Please try again.`,
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

  function scoreLabel(score: number) {
    if (score >= 80) return "Very strong match";
    if (score >= 60) return "Strong match";
    return "Potential match";
  }

  function scoreWidth(score: number) {
    return `${Math.min(100, Math.max(0, score))}%`;
  }

  const selectedLostItem = useMemo(
    () => lostItems.find((item) => item.id === selectedLostItemId),
    [lostItems, selectedLostItemId],
  );

  const filteredLostItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return lostItems;

    return lostItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query),
    );
  }, [lostItems, search]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          <HeartHandshake size={14} />
          Smart matching
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Matches
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Find potential matches between your lost item reports and active
              found-item reports.
            </p>
          </div>

          <button
            type="button"
            disabled={!selectedLostItemId || generating}
            onClick={generateMatches}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Sparkles size={17} />
            )}
            {generating ? "Finding matches..." : "Find matches"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadLostItems}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm hover:bg-red-100"
          >
            <RefreshCw size={14} />
            Retry
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
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="h-96 animate-pulse rounded-2xl bg-white" />
          <div className="h-96 animate-pulse rounded-2xl bg-white" />
        </div>
      ) : lostItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <PackageSearch size={28} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Report a lost item first
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Once you report something as lost, you can generate potential
            matches from here.
          </p>
          <Link
            to="/lost-items/create"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Report Lost Item
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Lost items selector */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-6">
            <div className="px-2 pb-3">
              <p className="text-sm font-bold text-slate-900">Your lost items</p>
              <p className="mt-1 text-xs text-slate-400">
                Select an item to view its matches.
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

            <div className="max-h-[420px] space-y-1 overflow-y-auto">
              {filteredLostItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedLostItemId(item.id);
                    setSuccess("");
                    setActionError("");
                  }}
                  className={`w-full rounded-xl p-3 text-left transition ${
                    selectedLostItemId === item.id
                      ? "bg-indigo-50 ring-1 ring-indigo-100"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        selectedLostItemId === item.id
                          ? "bg-white text-indigo-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <PackageSearch size={17} />
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
                        selectedLostItemId === item.id
                          ? "text-indigo-500"
                          : "text-slate-300"
                      }
                    />
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Matches */}
          <section>
            {selectedLostItem && (
              <div className="mb-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                      Matching for
                    </p>
                    <h2 className="mt-1 truncate text-xl font-bold text-slate-900">
                      {selectedLostItem.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedLostItem.category?.name || "Uncategorized"} · {selectedLostItem.location}
                    </p>
                  </div>
                  <Link
                    to={`/lost-items/${selectedLostItem.id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                  >
                    View report
                  </Link>
                </div>
              </div>
            )}

            {loadingMatches ? (
              <div className="space-y-4">
                {[1, 2, 3].map((number) => (
                  <div
                    key={number}
                    className="h-44 animate-pulse rounded-2xl bg-white"
                  />
                ))}
              </div>
            ) : matches.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <HeartHandshake size={28} />
                </div>
                <h2 className="mt-5 text-lg font-bold text-slate-900">
                  No matches yet
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Run the matcher to look for active found items that may belong
                  to you.
                </p>
                <button
                  type="button"
                  onClick={generateMatches}
                  disabled={generating}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Sparkles size={16} />
                  Find matches
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => {
                  const isPending = match.status.toUpperCase() === "PENDING";
                  const score = Math.round(match.score);

                  return (
                    <article
                      key={match.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <HeartHandshake size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">
                              {match.foundItem.title}
                            </h3>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                              {formatStatus(match.status)}
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                            <span className="inline-flex items-center gap-2">
                              <MapPin size={14} className="text-slate-400" />
                              {match.foundItem.location}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays size={14} className="text-slate-400" />
                              Found {formatDate(match.foundItem.foundAt)}
                            </span>
                          </div>

                          <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span className="text-xs font-semibold text-slate-500">
                                {scoreLabel(score)}
                              </span>
                              <span className="text-sm font-bold text-indigo-600">
                                {score}%
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-indigo-500 transition-all"
                                style={{ width: scoreWidth(score) }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2 sm:w-36">
                          <Link
                            to={`/found-items/${match.foundItem.id}`}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            View item
                            <ChevronRight size={14} />
                          </Link>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                disabled={actionId === match.id}
                                onClick={() => updateMatch(match.id, "accept")}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {actionId === match.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Check size={14} />
                                )}
                                Accept
                              </button>

                              <button
                                type="button"
                                disabled={actionId === match.id}
                                onClick={() => updateMatch(match.id, "reject")}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              >
                                <X size={14} />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
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
