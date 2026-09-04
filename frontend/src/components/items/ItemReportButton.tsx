import { useState } from "react";
import { AlertTriangle, FileWarning, Loader2, X } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";

import api from "../../services/api";

export default function ItemReportButton() {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const isItemDetailsRoute =
    Boolean(id) &&
    (/^\/lost-items\/[^/]+$/.test(location.pathname) ||
      /^\/found-items\/[^/]+$/.test(location.pathname));

  const isLost = location.pathname.startsWith("/lost-items/");

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isItemDetailsRoute || !id) return null;

  async function submitReport() {
    if (reason.trim().length < 10) {
      setError("Please provide at least 10 characters explaining the issue.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.post("/reports", {
        ...(isLost ? { lostItemId: id } : { foundItemId: id }),
        reason: reason.trim(),
      });

      setReason("");
      setSuccess(true);
    } catch (err: any) {
      console.error("Failed to submit report:", err);
      setError(
        err.response?.data?.message ||
          "Unable to submit this report. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    if (submitting) return;
    setOpen(false);
    setError("");
    setSuccess(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setSuccess(false);
          setOpen(true);
        }}
        className="fixed bottom-5 right-5 z-30 inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-lg transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        <FileWarning size={16} />
        Report item
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <AlertTriangle size={19} />
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-900">
                  Report this item
                </h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Tell the FindIt team what is wrong with this listing.
                </p>
              </div>

              <button
                type="button"
                onClick={close}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close report dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {success ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                  <p className="font-semibold text-emerald-800">Report submitted</p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Thanks for helping keep FindIt safe and useful.
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <label htmlFor="item-report-reason" className="text-sm font-semibold text-slate-800">
                    Why are you reporting this listing?
                  </label>
                  <textarea
                    id="item-report-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    maxLength={1000}
                    rows={6}
                    placeholder="For example: this listing contains incorrect information, appears suspicious, or violates the community rules..."
                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />

                  <div className="mt-2 flex justify-between text-xs text-slate-400">
                    <span>Minimum 10 characters</span>
                    <span>{reason.length}/1000</span>
                  </div>

                  {error && (
                    <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700">
                      {error}
                    </p>
                  )}

                  <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={close}
                      disabled={submitting}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={submitReport}
                      disabled={submitting || reason.trim().length < 10}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting && <Loader2 size={15} className="animate-spin" />}
                      Submit report
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
