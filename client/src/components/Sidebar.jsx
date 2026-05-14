import {
  Activity,
  Calendar,
  CreditCard,
  FlaskConical,
  LayoutDashboard,
  Pill,
  Settings2,
  Stethoscope,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { ROLE_NAV } from "../utils/constants.js";

const labels = {
  dashboard: "Dashboard",
  patients: "Patients",
  doctors: "Doctors",
  appointments: "Appointments",
  billing: "Billing",
  services: "Services",
  laboratory: "Laboratory",
  pharmacy: "Pharmacy",
  profile: "Profile",
};

const icons = {
  dashboard: LayoutDashboard,
  patients: Users,
  doctors: Stethoscope,
  appointments: Calendar,
  billing: CreditCard,
  services: Activity,
  laboratory: FlaskConical,
  pharmacy: Pill,
  profile: Settings2,
};

const Sidebar = ({ role = "patient" }) => {
  const items = ROLE_NAV[role] || ["profile"];

  return (
    <aside className="sidebar-shell">
      <div className="sidebar-brand">
        <div className="sidebar-mark">HMS</div>
        <div>
          <h2 style={{ fontSize: 22 }}>Hospital OS</h2>
          <div style={{ opacity: 0.84, fontSize: 13 }}>
            Connected care workspace
          </div>
        </div>
      </div>

      <div className="summary-chip" style={{ width: "fit-content" }}>
        {role.toUpperCase()} ACCESS
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item}
            to={`/${item}`}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {(() => {
              const Icon = icons[item] || LayoutDashboard;
              return <Icon size={16} />;
            })()}
            <span>{labels[item]}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontWeight: 800, marginBottom: 6 }}>
          Operational focus
        </div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          Appointment flow, patient records, billing, lab results, and pharmacy
          inventory are all tied to live backend data.
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
