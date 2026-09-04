import { type FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  PackageSearch,
  Send,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";

interface Category {
  id: string;
  name: string;
}

export default function ReportLost() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [lostAt, setLostAt] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setCategoriesLoading(true);

      const response = await api.get("/categories");

      const data = response.data;

      const categoryList = Array.isArray(data) ? data : data?.categories || [];

      setCategories(categoryList);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError("Unable to load categories. Please refresh the page.");
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Basic frontend validation
    if (!title.trim()) {
      setError("Please enter the item title.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe the item.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter where you lost the item.");
      return;
    }

    if (!lostAt) {
      setError("Please select when you lost the item.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/lost-items", {
        categoryId,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        lostAt,
      });

      setSuccess("Your lost item has been reported successfully.");

      // Give the success message a moment before redirecting.
      setTimeout(() => {
        navigate("/lost-items");
      }, 900);
    } catch (err: any) {
      console.error("Failed to create lost item:", err);

      setError(
        err.response?.data?.message ||
          "Unable to report the lost item. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Back */}
      <Link
        to="/lost-items"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft size={16} />
        Back to lost items
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          <PackageSearch size={14} />
          Lost item report
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Report something you lost
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Provide a few details about your lost item. The more accurate the
          information, the easier it will be to identify a potential match.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {/* Form header */}
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-7">
          <h2 className="font-semibold text-slate-900">Item information</h2>

          <p className="mt-1 text-xs text-slate-400">
            Tell us what you lost and where it happened.
          </p>
        </div>

        <div className="space-y-6 p-5 sm:p-7">
          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Item title
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Black Samsung Galaxy S24"
              maxLength={120}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Give your item a short and recognizable name.
            </p>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Category
              <span className="ml-1 text-red-500">*</span>
            </label>

            <select
              id="category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={categoriesLoading}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">
                {categoriesLoading
                  ? "Loading categories..."
                  : "Select a category"}
              </option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Description
              <span className="ml-1 text-red-500">*</span>
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the item, including its color, brand, model, identifying marks, or anything else that could help identify it."
              rows={5}
              maxLength={1000}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            />

            <div className="mt-1.5 flex justify-end">
              <span className="text-xs text-slate-400">
                {description.length}/1000
              </span>
            </div>
          </div>

          {/* Location + Date */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Where did you lose it?
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <MapPin
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="e.g. GTBIT College, Delhi"
                  maxLength={200}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
            </div>

            {/* Lost date */}
            <div>
              <label
                htmlFor="lostAt"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                When did you lose it?
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="lostAt"
                  type="datetime-local"
                  value={lostAt}
                  onChange={(event) => setLostAt(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
            </div>
          </div>

          {/* Information box */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <PackageSearch size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-indigo-900">
                  Helpful tip
                </p>

                <p className="mt-1 text-xs leading-5 text-indigo-700/70">
                  Include details that someone could use to distinguish your
                  item from similar items. Avoid sharing sensitive information
                  such as passwords, PINs, or financial details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-5 sm:flex-row sm:justify-end sm:px-7">
          <Link
            to="/lost-items"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting || categoriesLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Reporting...
              </>
            ) : (
              <>
                <Send size={17} />
                Report Lost Item
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
