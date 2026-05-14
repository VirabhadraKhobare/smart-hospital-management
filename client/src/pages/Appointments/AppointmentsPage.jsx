import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, CheckCircle2, RefreshCcw, Search } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api.js";
import formatDate from "../../utils/formatDate.js";
import { APPOINTMENT_STATUS } from "../../utils/constants.js";
import Table from "../../components/Table.jsx";
import Modal from "../../components/Modal.jsx";

const defaultForm = {
  patientId: "",
  doctorId: "",
  date: "",
  time: "",
  status: "scheduled",
  notes: "",
};

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [appointmentRes, patientRes, doctorRes] = await Promise.all([
        api.get("/appointments", { params: { limit: 200, search } }),
        api.get("/patients", { params: { limit: 200 } }),
        api.get("/doctors", { params: { limit: 200 } }),
      ]);
      setAppointments(appointmentRes.data.data || []);
      setPatients(patientRes.data.data || []);
      setDoctors(doctorRes.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch appointments",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [search]);

  const visibleAppointments = useMemo(() => {
    if (statusFilter === "all") return appointments;
    return appointments.filter((item) => item.status === statusFilter);
  }, [appointments, statusFilter]);

  const saveAppointment = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/appointments/${editing._id}`, form);
        toast.success("Appointment updated");
      } else {
        await api.post("/appointments", form);
        toast.success("Appointment booked");
      }
      setOpen(false);
      setEditing(null);
      setForm(defaultForm);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed");
    }
  };

  const statusBadge = (status) => {
    const className =
      status === "completed"
        ? "badge-success"
        : status === "scheduled"
          ? "badge-warning"
          : "badge-danger";
    return <span className={`badge ${className}`}>{status}</span>;
  };

  return (
    <section className="section-grid">
      <div className="page-head">
        <div>
          <div
            className="summary-chip"
            style={{ width: "fit-content", marginBottom: 10 }}
          >
            <CalendarClock size={14} /> Appointment flow
          </div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">
            Schedule, update, or cancel appointments with data synced from the
            backend.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setOpen(true);
            setEditing(null);
            setForm(defaultForm);
          }}
        >
          Book Appointment
        </button>
      </div>

      <div className="toolbar card" style={{ padding: 14, marginBottom: 0 }}>
        <div className="toolbar-group">
          <Search size={16} color="var(--muted)" />
          <input
            className="search-input"
            placeholder="Search notes, status, or time"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="toolbar-group" style={{ justifyContent: "flex-end" }}>
          <label
            className="label"
            htmlFor="statusFilter"
            style={{ marginBottom: 0 }}
          >
            Status
          </label>
          <select
            id="statusFilter"
            className="select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={{ minWidth: 180 }}
          >
            <option value="all">All</option>
            {APPOINTMENT_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-outline" onClick={fetchAll}>
            <RefreshCcw size={14} style={{ marginRight: 6 }} /> Refresh
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <div className="detail-label">Visible appointments</div>
          <h3>{visibleAppointments.length}</h3>
        </div>
        <div className="detail-item">
          <div className="detail-label">Scheduled</div>
          <h3>
            {appointments.filter((item) => item.status === "scheduled").length}
          </h3>
        </div>
        <div className="detail-item">
          <div className="detail-label">
            <CheckCircle2
              size={14}
              style={{ marginRight: 6, verticalAlign: "middle" }}
            />{" "}
            Completed
          </div>
          <h3>
            {appointments.filter((item) => item.status === "completed").length}
          </h3>
        </div>
      </div>

      {loading ? (
        <div className="loader" />
      ) : (
        <Table
          columns={[
            {
              key: "patientId",
              label: "Patient",
              render: (value) =>
                value?._id ? (
                  <Link
                    to={`/patients/${value._id}`}
                    style={{ color: "var(--primary)", fontWeight: 600 }}
                  >
                    {value?.name || "-"}
                  </Link>
                ) : (
                  "-"
                ),
            },
            {
              key: "doctorId",
              label: "Doctor",
              render: (value) => value?.name || "-",
            },
            {
              key: "date",
              label: "Date",
              render: (value) => formatDate(value),
            },
            { key: "time", label: "Time" },
            {
              key: "status",
              label: "Status",
              render: (value) => statusBadge(value),
            },
          ]}
          data={visibleAppointments}
          emptyMessage={
            search || statusFilter !== "all"
              ? "No appointments matched your filters."
              : "No appointments available."
          }
          renderActions={(row) => (
            <div className="row-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setOpen(true);
                  setEditing(row);
                  setForm({
                    ...row,
                    patientId: row.patientId?._id,
                    doctorId: row.doctorId?._id,
                    date: row.date?.slice(0, 10) || "",
                  });
                }}
              >
                Edit
              </button>
              <button
                className="btn btn-outline"
                onClick={async () => {
                  try {
                    await api.put(`/appointments/${row._id}`, {
                      status: "cancelled",
                    });
                    toast.success("Appointment cancelled");
                    fetchAll();
                  } catch (error) {
                    toast.error(
                      error.response?.data?.message ||
                        "Unable to cancel appointment",
                    );
                  }
                }}
              >
                Cancel
              </button>
            </div>
          )}
        />
      )}

      <Modal
        title={editing ? "Update Appointment" : "Book Appointment"}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={saveAppointment}>
          <div className="form-grid">
            <div>
              <label className="label" htmlFor="patientId">
                Patient
              </label>
              <select
                id="patientId"
                className="select"
                value={form.patientId}
                onChange={(event) =>
                  setForm({ ...form, patientId: event.target.value })
                }
                required
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="doctorId">
                Doctor
              </label>
              <select
                id="doctorId"
                className="select"
                value={form.doctorId}
                onChange={(event) =>
                  setForm({ ...form, doctorId: event.target.value })
                }
                required
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                className="input"
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm({ ...form, date: event.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="time">
                Time
              </label>
              <input
                id="time"
                className="input"
                value={form.time}
                onChange={(event) =>
                  setForm({ ...form, time: event.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                className="select"
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                {APPOINTMENT_STATUS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                className="textarea"
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
              />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 12 }}>
            Save
          </button>
        </form>
      </Modal>
    </section>
  );
};

export default AppointmentsPage;
