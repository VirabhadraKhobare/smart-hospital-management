import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  FlaskConical,
  Pill,
  RefreshCcw,
  Stethoscope,
  Users2,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";
import formatCurrency from "../../utils/formatCurrency.js";
import formatDate from "../../utils/formatDate.js";
import StatCard from "../../components/StatCard.jsx";
import Table from "../../components/Table.jsx";

const dashboardLinks = [
  { to: "/patients", label: "Patients", icon: Users2 },
  { to: "/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/billing", label: "Billing", icon: BellRing },
  { to: "/laboratory", label: "Laboratory", icon: FlaskConical },
  { to: "/pharmacy", label: "Pharmacy", icon: Pill },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [lowStockMeds, setLowStockMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const { data } = await api.get("/dashboard/stats");
      setStats(data.totals);
      setActivity(data.recentActivity || []);
      setLowStockMeds(data.lowStockMedicines || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch dashboard data",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const appointmentBadges = useMemo(() => {
    return Object.entries(stats?.appointmentsByStatus || {}).map(
      ([status, count]) => ({ status, count }),
    );
  }, [stats]);

  const activityColumns = [
    {
      key: "patientId",
      label: "Patient",
      render: (value) => value?.name || "-",
    },
    { key: "doctorId", label: "Doctor", render: (value) => value?.name || "-" },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`badge ${value === "completed" ? "badge-success" : value === "scheduled" ? "badge-warning" : "badge-danger"}`}
        >
          {value}
        </span>
      ),
    },
    { key: "date", label: "Date", render: (value) => formatDate(value) },
  ];

  const medicineColumns = [
    { key: "medicineName", label: "Medicine Name" },
    { key: "genericName", label: "Generic Name" },
    { key: "quantity", label: "Stock" },
    { key: "price", label: "Price", render: (value) => formatCurrency(value) },
  ];

  if (loading) return <div className="loader" />;

  return (
    <section className="section-grid">
      <div className="hero-banner card">
        <div className="eyebrow">Welcome back, {user?.name || "team"}</div>
        <h1>Hospital operations at a glance.</h1>
        <p>
          Track patient flow, appointments, billing, diagnostics, and pharmacy
          inventory from one live dashboard.
        </p>
        <div className="hero-meta">
          <span className="chip">
            <CalendarDays size={14} /> Live data from backend
          </span>
          <span className="chip">
            <BellRing size={14} /> {stats?.appointments || 0} active
            appointments
          </span>
          <span className="chip">
            <RefreshCcw size={14} /> Auto-synced on refresh
          </span>
        </div>
      </div>

      <div className="toolbar">
        <div>
          <h2 className="page-title">Operational Snapshot</h2>
          <p className="page-subtitle">
            The core numbers below are pulled from the backend and reflect live
            records.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={fetchStats}
          disabled={refreshing}
        >
          <RefreshCcw size={14} style={{ marginRight: 6 }} />{" "}
          {refreshing ? "Refreshing" : "Refresh data"}
        </button>
      </div>

      <div className="metrics-grid">
        <StatCard
          title="Patients"
          value={stats?.patients || 0}
          helper="Active patient records"
        />
        <StatCard
          title="Doctors"
          value={stats?.doctors || 0}
          helper="Active clinicians"
        />
        <StatCard
          title="Appointments"
          value={stats?.appointments || 0}
          helper="Scheduled and completed visits"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats?.revenue || 0)}
          helper={`From ${stats?.bills || 0} bills`}
        />
        <StatCard
          title="Departments"
          value={stats?.departments || 0}
          helper="Operational departments"
        />
        <StatCard
          title="Services"
          value={stats?.services || 0}
          helper="Billable services"
        />
        <StatCard
          title="Lab Tests"
          value={stats?.laboratories || 0}
          helper="Diagnostic entries"
        />
        <StatCard
          title="Medicines"
          value={stats?.pharmacies || 0}
          helper="Available stock items"
        />
      </div>

      <div className="split-layout">
        <div className="section-grid">
          <div className="toolbar" style={{ marginBottom: 0 }}>
            <div>
              <h2 className="page-title">Quick Actions</h2>
              <p className="page-subtitle">
                Jump into the most used operational screens.
              </p>
            </div>
          </div>

          <div className="list-grid">
            {dashboardLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="card"
                style={{ padding: 18, display: "block" }}
              >
                <div
                  className="summary-chip"
                  style={{ width: "fit-content", marginBottom: 14 }}
                >
                  <Icon size={14} /> {label}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <h3 style={{ marginBottom: 6 }}>{label} workspace</h3>
                    <p className="muted" style={{ margin: 0 }}>
                      Open, edit, and review live records.
                    </p>
                  </div>
                  <ArrowRight size={18} />
                </div>
              </Link>
            ))}
          </div>

          <div>
            <div className="toolbar" style={{ marginBottom: 12 }}>
              <div>
                <h2 className="page-title">Recent Appointments</h2>
                <p className="page-subtitle">
                  The latest activity from the appointment module.
                </p>
              </div>
            </div>
            <Table
              columns={activityColumns}
              data={activity}
              emptyMessage="No recent appointments found."
            />
          </div>
        </div>

        <div className="section-grid">
          <div className="card" style={{ padding: 18 }}>
            <h2 className="page-title" style={{ marginBottom: 8 }}>
              Appointment Status
            </h2>
            <p className="page-subtitle">
              A compact view of the appointment mix by status.
            </p>
            <div
              className="metrics-grid"
              style={{
                marginTop: 14,
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              }}
            >
              {appointmentBadges.length > 0 ? (
                appointmentBadges.map(({ status, count }) => (
                  <div
                    key={status}
                    className="detail-item"
                    style={{ textAlign: "center" }}
                  >
                    <div className="detail-label">{status}</div>
                    <h3>{count}</h3>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  No appointment breakdown available.
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div className="toolbar" style={{ marginBottom: 10 }}>
              <div>
                <h2 className="page-title">Low Stock Medicines</h2>
                <p className="page-subtitle">
                  Items that may need attention from the pharmacy team.
                </p>
              </div>
            </div>
            {lowStockMeds.length > 0 ? (
              <Table
                columns={medicineColumns}
                data={lowStockMeds}
                emptyMessage="No low stock items."
              />
            ) : (
              <div className="empty-state">
                No low stock medicines right now.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <h2 className="page-title" style={{ marginBottom: 8 }}>
          Command Summary
        </h2>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Open revenue pipeline</div>
            <h3>{formatCurrency(stats?.revenue || 0)}</h3>
          </div>
          <div className="detail-item">
            <div className="detail-label">Remaining stock items</div>
            <h3>{stats?.pharmacies || 0}</h3>
          </div>
          <div className="detail-item">
            <div className="detail-label">Latest activity sync</div>
            <h3>{formatDate(new Date())}</h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
