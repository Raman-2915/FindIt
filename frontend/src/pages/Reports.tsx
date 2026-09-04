import { type FormEvent, useEffect, useState } from "react";
import api from "../services/api";

interface Report {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  lostItem?: {
    title: string;
    status: string;
  };
  foundItem?: {
    title: string;
    status: string;
  };
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);

  const [lostItemId, setLostItemId] = useState("");
  const [foundItemId, setFoundItemId] = useState("");
  const [reason, setReason] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadReports() {
    try {
      const response = await api.get("/reports/my");

      setReports(response.data.reports || []);
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to load reports");
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function submitReport(e: FormEvent) {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      if (!lostItemId && !foundItemId) {
        setError("Provide either a lost item ID or found item ID.");
        return;
      }

      if (lostItemId && foundItemId) {
        setError("Provide only one item ID.");
        return;
      }

      await api.post("/reports", {
        ...(lostItemId && { lostItemId }),
        ...(foundItemId && { foundItemId }),
        reason,
      });

      setMessage("Report submitted successfully.");

      setLostItemId("");
      setFoundItemId("");
      setReason("");

      loadReports();
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to submit report");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">SAFETY</p>
          <h1>Reports</h1>
          <p>Report suspicious or misleading items.</p>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form className="form-card" onSubmit={submitReport}>
        <h2>Submit Report</h2>

        <label>Lost Item ID</label>

        <input
          value={lostItemId}
          onChange={(e) => setLostItemId(e.target.value)}
          placeholder="Optional"
        />

        <label>Found Item ID</label>

        <input
          value={foundItemId}
          onChange={(e) => setFoundItemId(e.target.value)}
          placeholder="Optional"
        />

        <label>Reason</label>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain the problem (minimum 10 characters)"
          minLength={10}
          required
        />

        <button className="primary-button">Submit Report</button>
      </form>

      <h2 className="section-title">My Reports</h2>

      <div className="reports-list">
        {reports.length === 0 ? (
          <div className="empty-state">No reports submitted yet.</div>
        ) : (
          reports.map((report) => (
            <div className="report-card" key={report.id}>
              <div className="claim-header">
                <strong>Report</strong>

                <span className="status-badge">{report.status}</span>
              </div>

              <p>{report.reason}</p>

              {report.lostItem && (
                <p>
                  <strong>Lost item:</strong> {report.lostItem.title}
                </p>
              )}

              {report.foundItem && (
                <p>
                  <strong>Found item:</strong> {report.foundItem.title}
                </p>
              )}

              <small>{new Date(report.createdAt).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
