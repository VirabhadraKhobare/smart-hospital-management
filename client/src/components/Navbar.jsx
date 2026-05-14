import { CalendarDays, LayoutGrid, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const pathLabel =
    location.pathname.replace(/^\//, "").split("/")[0] || "dashboard";
  const title = pathLabel.charAt(0).toUpperCase() + pathLabel.slice(1);

  return (
    <header className="navbar-shell">
      <div className="navbar-title">
        <div className="summary-chip" style={{ width: "fit-content" }}>
          <LayoutGrid size={14} /> HMS Command Center
        </div>
        <h2>{title}</h2>
        <div className="navbar-path">/{pathLabel}</div>
      </div>

      <div className="row-actions" style={{ justifyContent: "flex-end" }}>
        <div className="user-chip">
          <div className="user-avatar">
            {(user?.name || "U").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <strong>{user?.name || "User"}</strong>
            <div
              className="muted"
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                fontSize: 12,
              }}
            >
              <ShieldCheck size={14} />{" "}
              <span style={{ textTransform: "capitalize" }}>
                {user?.role || "member"}
              </span>
            </div>
          </div>
        </div>
        <div className="summary-chip">
          <CalendarDays size={14} /> Live backend sync
        </div>
        <button type="button" className="btn btn-outline" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
