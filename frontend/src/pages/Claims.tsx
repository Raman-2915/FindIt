import { type FormEvent, useEffect, useState } from "react";
import api from "../services/api";

interface Claim {
  id: string;
  message: string;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export default function Claims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [message, setMessage] = useState("");
  const [itemId, setItemId] = useState("");
  const [claimMessage, setClaimMessage] = useState("");

  const [error, setError] = useState("");

  async function loadClaims() {
    try {
      const response = await api.get("/claims/my");
      setClaims(response.data.claims || []);
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to load claims");
    }
  }

  useEffect(() => {
    loadClaims();
  }, []);

  async function createClaim(e: FormEvent) {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      await api.post("/claims", {
        foundItemId: itemId,
        message: claimMessage,
      });

      setMessage("Claim submitted successfully.");

      setItemId("");
      setClaimMessage("");

      loadClaims();
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to submit claim");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">OWNERSHIP</p>
          <h1>Claims</h1>
          <p>Submit and track your item claims.</p>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form className="form-card" onSubmit={createClaim}>
        <h2>Submit a Claim</h2>

        <label>Found Item ID</label>

        <input
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          placeholder="Enter found item ID"
          required
        />

        <label>Why does this item belong to you?</label>

        <textarea
          value={claimMessage}
          onChange={(e) => setClaimMessage(e.target.value)}
          placeholder="Provide identifying details..."
          required
        />

        <button className="primary-button">Submit Claim</button>
      </form>

      <h2 className="section-title">My Claims</h2>

      <div className="claims-list">
        {claims.length === 0 ? (
          <div className="empty-state">No claims submitted yet.</div>
        ) : (
          claims.map((claim) => (
            <div className="claim-card" key={claim.id}>
              <div className="claim-header">
                <strong>Claim</strong>

                <span
                  className={`status-badge status-${claim.status.toLowerCase()}`}
                >
                  {claim.status}
                </span>
              </div>

              <p>{claim.message}</p>

              {claim.user && (
                <p>
                  <strong>User:</strong> {claim.user.name}
                </p>
              )}

              <small>{new Date(claim.createdAt).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
