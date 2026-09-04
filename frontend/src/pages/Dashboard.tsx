import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <section className="hero-section">
        <div>
          <p className="eyebrow">WELCOME TO FINDIT</p>

          <h1>
            Lost something?
            <br />
            <span>Let's find it.</span>
          </h1>

          <p className="hero-text">
            FindIt connects people who have lost belongings with people who have
            found them.
          </p>

          <div className="hero-actions">
            <Link to="/lost-items" className="primary-button">
              Find Lost Items
            </Link>

            <Link to="/found-items" className="secondary-button">
              View Found Items
            </Link>
          </div>
        </div>

        <div className="hero-visual">🔎</div>
      </section>

      <section className="welcome-card">
        <h2>Hello, {user?.name}! 👋</h2>

        <p>
          Use FindIt to report lost or found belongings, discover possible
          matches, submit claims and stay updated with notifications.
        </p>
      </section>

      <section className="dashboard-grid">
        <Link to="/lost-items" className="dashboard-card">
          <div className="card-icon">🔎</div>
          <h3>Lost Items</h3>
          <p>Browse items reported as lost.</p>
        </Link>

        <Link to="/found-items" className="dashboard-card">
          <div className="card-icon">📦</div>
          <h3>Found Items</h3>
          <p>Browse items that people have found.</p>
        </Link>

        <Link to="/my-lost-items" className="dashboard-card">
          <div className="card-icon">📋</div>
          <h3>My Lost Items</h3>
          <p>Manage the items you reported.</p>
        </Link>

        <Link to="/my-found-items" className="dashboard-card">
          <div className="card-icon">🧳</div>
          <h3>My Found Items</h3>
          <p>Manage items you found.</p>
        </Link>

        <Link to="/claims" className="dashboard-card">
          <div className="card-icon">🤝</div>
          <h3>Claims</h3>
          <p>Manage ownership claims.</p>
        </Link>

        <Link to="/notifications" className="dashboard-card">
          <div className="card-icon">🔔</div>
          <h3>Notifications</h3>
          <p>Stay updated about your activity.</p>
        </Link>
      </section>
    </div>
  );
}
