import { useEffect, useState } from "react";
import api from "../services/api";

interface Report {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter?: {
    name: string;
    email: string;
  };
  lostItem?: {
    title: string;
  };
  foundItem?: {
    title: string;
  };
}

interface Claim {
  id: string;
  message: string;
  status: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");

      const [reportsResponse, claimsResponse] = await Promise.all([
        api.get("/reports"),
        api.get("/claims"),
      ]);

      setReports(reportsResponse.data.reports || []);
      setClaims(claimsResponse.data.claims || []);
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to load admin data");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function updateReport(reportId: string, status: string) {
    try {
      await api.patch(`/reports/${reportId}/status`, {
        status,
      });

      loadData();
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to update report");
    }
  }

  async function updateClaim(claimId: string, status: string) {
    try {
      await api.patch(`/claims/${claimId}/status`, {
        status,
      });

      loadData();
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to update claim");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Admin Dashboard</h1>
          <p>Manage reports and ownership claims.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <section>
        <h2 className="section-title">Reports ({reports.length})</h2>

        <div className="admin-list">
          {reports.length === 0 ? (
            <div className="empty-state">No reports found.</div>
          ) : (
            reports.map((report) => (
              <div className="admin-card" key={report.id}>
                <div className="claim-header">
                  <strong>
                    {report.foundItem?.title ||
                      report.lostItem?.title ||
                      "Reported Item"}
                  </strong>

                  <span className="status-badge">{report.status}</span>
                </div>

                <p>{report.reason}</p>

                {report.reporter && (
                  <p>
                    Reported by: <strong>{report.reporter.name}</strong>
                  </p>
                )}

                <div className="admin-actions">
                  <button onClick={() => updateReport(report.id, "REVIEWED")}>
                    Mark Reviewed
                  </button>

                  <button
                    onClick={() => updateReport(report.id, "ACTION_TAKEN")}
                  >
                    Action Taken
                  </button>

                  <button onClick={() => updateReport(report.id, "DISMISSED")}>
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="section-title">Claims ({claims.length})</h2>

        <div className="admin-list">
          {claims.length === 0 ? (
            <div className="empty-state">No claims found.</div>
          ) : (
            claims.map((claim) => (
              <div className="admin-card" key={claim.id}>
                <div className="claim-header">
                  <strong>Ownership Claim</strong>

                  <span className="status-badge">{claim.status}</span>
                </div>

                <p>{claim.message}</p>

                {claim.user && (
                  <p>
                    User: <strong>{claim.user.name}</strong>
                  </p>
                )}

                <div className="admin-actions">
                  <button onClick={() => updateClaim(claim.id, "APPROVED")}>
                    Approve
                  </button>

                  <button onClick={() => updateClaim(claim.id, "REJECTED")}>
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
