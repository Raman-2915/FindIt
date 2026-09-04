import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  FolderSearch,
  MapPin,
  PackageSearch,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyLostItems } from "../../services/lostItemService";
import { getMyFoundItems } from "../../services/foundItemService";
import { getNotifications } from "../../services/notificationService";

interface Item {
  id: string;
  title: string;
  description?: string;
  location?: string;
  status?: string;
  createdAt?: string;
}

interface Notification {
  id: string;
  read?: boolean;
}

export default function Dashboard() {
  // -----------------------------
  // State
  // -----------------------------

  const [lostItems, setLostItems] = useState<Item[]>([]);
  const [foundItems, setFoundItems] = useState<Item[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------
  // Load dashboard data
  // -----------------------------

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [lostResponse, foundResponse, notificationResponse] =
          await Promise.all([
            getMyLostItems(),
            getMyFoundItems(),
            getNotifications(),
          ]);

        // Normalize lost items response
        const lostData = Array.isArray(lostResponse)
          ? lostResponse
          : lostResponse?.items || lostResponse?.lostItems || [];

        // Normalize found items response
        const foundData = Array.isArray(foundResponse)
          ? foundResponse
          : foundResponse?.items || foundResponse?.foundItems || [];

        // Normalize notifications response
        const notificationData = Array.isArray(notificationResponse)
          ? notificationResponse
          : notificationResponse?.notifications || [];

        setLostItems(lostData);
        setFoundItems(foundData);
        setNotifications(notificationData);
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError("Unable to load your dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // -----------------------------
  // Dashboard statistics
  // -----------------------------

  const stats = [
    {
      label: "My Lost Items",
      value: lostItems.length,
      description: "Items you've reported lost",
      icon: PackageSearch,
    },
    {
      label: "My Found Items",
      value: foundItems.length,
      description: "Items you've reported found",
      icon: FolderSearch,
    },
    {
      label: "Notifications",
      value: notifications.filter((item) => !item.read).length,
      description: "Unread notifications",
      icon: Bell,
    },
    {
      label: "Active Reports",
      value:
        lostItems.filter((item) => item.status === "ACTIVE").length +
        foundItems.filter((item) => item.status === "ACTIVE").length,
      description: "Reports currently active",
      icon: ShieldCheck,
    },
  ];

  // -----------------------------
  // Recent activity
  // -----------------------------

  const recentItems = [
    ...lostItems.map((item) => ({
      ...item,
      type: "Lost",
    })),

    ...foundItems.map((item) => ({
      ...item,
      type: "Found",
    })),
  ]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;

      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return dateB - dateA;
    })
    .slice(0, 5);

  // -----------------------------
  // Render
  // -----------------------------

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Loading */}
      {loading && (
        <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
          Loading your dashboard...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Welcome */}
      <section className="mb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-indigo-600">
              Your FindIt dashboard
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Welcome back 👋
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Keep track of your lost and found reports and discover potential
              matches.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/lost-items/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Plus size={17} />
              Report Lost
            </Link>

            <Link
              to="/found-items/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              <Plus size={17} />
              Report Found
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon size={21} />
                </div>

                <ArrowRight size={17} className="text-slate-300" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {stat.label}
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                {stat.value}
              </p>

              <p className="mt-1 text-xs text-slate-400">{stat.description}</p>
            </div>
          );
        })}
      </section>

      {/* Main content */}
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        {/* Recent activity */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold text-slate-950">Recent activity</h2>

              <p className="mt-1 text-xs text-slate-400">
                Your latest lost and found reports
              </p>
            </div>

            <Link
              to="/my-lost-items"
              className="hidden items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 sm:flex"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="p-5 sm:p-6">
            {recentItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <PackageSearch size={21} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-700">
                  No reports yet
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                  You haven't reported any lost or found items yet. Create your
                  first report to get started.
                </p>

                <div className="mt-5 flex justify-center gap-2">
                  <Link
                    to="/lost-items/create"
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Report Lost
                  </Link>

                  <Link
                    to="/found-items/create"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Report Found
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {recentItems.map((item) => {
                  const isLost = item.type === "Lost";

                  return (
                    <Link
                      key={`${item.type}-${item.id}`}
                      to={
                        isLost
                          ? `/lost-items/${item.id}`
                          : `/found-items/${item.id}`
                      }
                      className="group flex items-center gap-4 rounded-xl border border-transparent p-3 transition hover:border-slate-100 hover:bg-slate-50"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          isLost
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {isLost ? (
                          <PackageSearch size={19} />
                        ) : (
                          <FolderSearch size={19} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {item.title}
                          </p>

                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                              isLost
                                ? "bg-amber-50 text-amber-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {item.type}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {item.location}
                            </span>
                          )}

                          {item.createdAt && (
                            <span>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {item.status && (
                        <span
                          className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold sm:block ${
                            item.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.status}
                        </span>
                      )}

                      <ArrowRight
                        size={16}
                        className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-950">Quick actions</h2>

            <p className="mt-1 text-xs text-slate-400">
              Get things done quickly
            </p>
          </div>

          <div className="space-y-2 p-4">
            <Link
              to="/lost-items/create"
              className="group flex items-center gap-4 rounded-xl p-3 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <PackageSearch size={19} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Report something lost
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Tell the community what you lost
                </p>
              </div>

              <ArrowRight
                size={17}
                className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
              />
            </Link>

            <Link
              to="/found-items/create"
              className="group flex items-center gap-4 rounded-xl p-3 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FolderSearch size={19} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Report something found
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Help someone recover their item
                </p>
              </div>

              <ArrowRight
                size={17}
                className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
              />
            </Link>

            <Link
              to="/lost-items"
              className="group flex items-center gap-4 rounded-xl p-3 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Search size={19} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Browse lost items
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  See what people are looking for
                </p>
              </div>

              <ArrowRight
                size={17}
                className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
              />
            </Link>

            <Link
              to="/found-items"
              className="group flex items-center gap-4 rounded-xl p-3 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <FolderSearch size={19} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Browse found items
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Maybe someone found your item
                </p>
              </div>

              <ArrowRight
                size={17}
                className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
              />
            </Link>
          </div>
        </section>
      </div>

      {/* Bottom information */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <InfoCard
          icon={<Clock3 size={18} />}
          title="Stay updated"
          description="We'll notify you when something important happens."
        />

        <InfoCard
          icon={<CheckCircle2 size={18} />}
          title="Track your reports"
          description="Follow the status of your lost and found items."
        />

        <InfoCard
          icon={<MapPin size={18} />}
          title="Add useful details"
          description="Accurate locations help people find the right item."
        />
      </section>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>

        <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
      </div>
    </div>
  );
}
