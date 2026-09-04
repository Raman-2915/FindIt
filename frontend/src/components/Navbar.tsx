import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link to="/dashboard" className="brand">
        🔎 FindIt
      </Link>

      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/lost-items">Lost Items</Link>
        <Link to="/found-items">Found Items</Link>

        {user && (
          <>
            <Link to="/my-lost-items">My Lost</Link>
            <Link to="/my-found-items">My Found</Link>
            <Link to="/claims">Claims</Link>
            <Link to="/notifications">Notifications</Link>
            <Link to="/reports">Reports</Link>
          </>
        )}

        {user?.role === "ADMIN" && <Link to="/admin">Admin</Link>}

        <button onClick={handleLogout}>Logout</button>
      </nav>
    </header>
  );
}
