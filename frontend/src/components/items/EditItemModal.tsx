import { type FormEvent, useEffect, useState } from "react";
import { CalendarDays, Loader2, MapPin, Tag, X } from "lucide-react";

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

interface EditItemModalProps {
  item: Item;
  type: "lost" | "found";
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditItemModal({
  item,
  type,
  onClose,
  onUpdated,
}: EditItemModalProps) {
  const isLost = type === "lost";

  const [title, setTitle] = useState(item.title);
  const [location, setLocation] = useState(item.location);

  const [date, setDate] = useState(() => {
    const value = isLost ? item.lostAt : item.foundAt;

    if (!value) return "";

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toISOString().split("T")[0];
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, saving]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!location.trim()) {
      setError("Location is required.");
      return;
    }

    if (!date) {
      setError(isLost ? "Lost date is required." : "Found date is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const endpoint = isLost
        ? `/lost-items/${item.id}`
        : `/found-items/${item.id}`;

      const payload = {
        title: title.trim(),
        location: location.trim(),
        ...(isLost ? { lostAt: date } : { foundAt: date }),
      };

      await api.put(endpoint, payload);

      onUpdated();
      onClose();
    } catch (err: any) {
      console.error("Failed to update item:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update the item. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p
              className={`mb-1 text-xs font-bold uppercase tracking-wide ${
                isLost ? "text-indigo-600" : "text-emerald-600"
              }`}
            >
              {isLost ? "Lost report" : "Found report"}
            </p>

            <h2 className="text-xl font-bold text-slate-950">Edit report</h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the information for this report.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="mb-5">
            <label
              htmlFor="edit-title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Title
            </label>

            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Black wallet"
              disabled={saving}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-50"
            />
          </div>

          {/* Location */}
          <div className="mb-5">
            <label
              htmlFor="edit-location"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} />
                Location
              </span>
            </label>

            <input
              id="edit-location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Where was it lost/found?"
              disabled={saving}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-50"
            />
          </div>

          {/* Date */}
          <div className="mb-5">
            <label
              htmlFor="edit-date"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} />
                {isLost ? "Date lost" : "Date found"}
              </span>
            </label>

            <input
              id="edit-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={saving}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-50"
            />
          </div>

          {/* Category info */}
          <div className="mb-6 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                <Tag size={16} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">Category</p>

                <p className="mt-0.5 text-sm font-semibold text-slate-700">
                  {item.category?.name || "Not specified"}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-400">
              Category editing will be enabled after we connect the categories
              API properly.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isLost
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
