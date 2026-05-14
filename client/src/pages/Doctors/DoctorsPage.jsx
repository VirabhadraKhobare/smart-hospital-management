import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, RefreshCcw, Search, UserRoundPlus } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api.js";
import Table from "../../components/Table.jsx";
import Modal from "../../components/Modal.jsx";

const defaultForm = {
  name: "",
  specialization: "",
  mobile: "",
  email: "",
  qualification: "",
  experience: "",
  availableTiming: "",
  department: "",
};

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [doctorRes, deptRes] = await Promise.all([
        api.get("/doctors", { params: { limit: 200, search } }),
        api.get("/departments", { params: { limit: 200 } }),
      ]);
      setDoctors(doctorRes.data.data || []);
      setDepartments(deptRes.data.data || []);
      setTotal(doctorRes.data.pagination?.total || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [search]);

  const visibleDoctors = useMemo(() => {
    if (filter === "all") return doctors;
    return doctors.filter((item) => item.specialization === filter);
  }, [doctors, filter]);

  const saveDoctor = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/doctors/${editing._id}`, form);
        toast.success("Doctor updated");
      } else {
        await api.post("/doctors", form);
        toast.success("Doctor created");
      }
      setOpen(false);
      setEditing(null);
      setForm(defaultForm);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed");
    }
  };

  return (
    <section className="section-grid">
      <div className="page-head">
        <div>
          <div
            className="summary-chip"
            style={{ width: "fit-content", marginBottom: 10 }}
          >
            <UserRoundPlus size={14} /> Doctor directory
          </div>
          <h1 className="page-title">Doctors</h1>
          <p className="page-subtitle">
            Keep clinician records searchable and tied to departments.
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
          Add Doctor
        </button>
      </div>

      <div className="toolbar card" style={{ padding: 14, marginBottom: 0 }}>
        <div className="toolbar-group">
          <Search size={16} color="var(--muted)" />
          <input
            className="search-input"
            placeholder="Search by name, email, or specialization"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="toolbar-group" style={{ justifyContent: "flex-end" }}>
          <label
            className="label"
            htmlFor="specialization"
            style={{ marginBottom: 0 }}
          >
            Specialization
          </label>
          <select
            id="specialization"
            className="select"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            style={{ minWidth: 220 }}
          >
            <option value="all">All</option>
            {[
              ...new Set(
                doctors.map((item) => item.specialization).filter(Boolean),
              ),
            ].map((item) => (
              <option key={item} value={item}>
                {item}
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
          <div className="detail-label">Total matches</div>
          <h3>{total}</h3>
        </div>
        <div className="detail-item">
          <div className="detail-label">Visible doctors</div>
          <h3>{visibleDoctors.length}</h3>
        </div>
        <div className="detail-item">
          <div className="detail-label">
            <Building2
              size={14}
              style={{ marginRight: 6, verticalAlign: "middle" }}
            />{" "}
            Departments
          </div>
          <h3>{departments.length}</h3>
        </div>
      </div>

      {loading ? (
        <div className="loader" />
      ) : (
        <Table
          columns={[
            {
              key: "name",
              label: "Name",
              render: (value, row) => (
                <span style={{ fontWeight: 600 }}>{value}</span>
              ),
            },
            { key: "specialization", label: "Specialization" },
            {
              key: "department",
              label: "Department",
              render: (value) => value?.name || "-",
            },
            { key: "email", label: "Email" },
            { key: "experience", label: "Experience" },
          ]}
          data={visibleDoctors}
          emptyMessage={
            search ? "No doctors matched your search." : "No doctors available."
          }
          renderActions={(row) => (
            <div className="row-actions">
              <Link
                to="/appointments"
                className="btn btn-outline"
                style={{ fontSize: 12 }}
              >
                View Appointments
              </Link>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setOpen(true);
                  setEditing(row);
                  setForm({ ...row, department: row.department?._id || "" });
                }}
              >
                Edit
              </button>
              <button
                className="btn btn-outline"
                onClick={async () => {
                  if (!window.confirm(`Delete ${row.name}?`)) return;
                  await api.delete(`/doctors/${row._id}`);
                  toast.success("Doctor removed");
                  fetchAll();
                }}
              >
                Delete
              </button>
            </div>
          )}
        />
      )}

      <Modal
        title={editing ? "Edit Doctor" : "Add Doctor"}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={saveDoctor}>
          <div className="form-grid">
            {[
              "name",
              "specialization",
              "mobile",
              "email",
              "qualification",
              "experience",
              "availableTiming",
            ].map((field) => (
              <div key={field}>
                <label className="label" htmlFor={field}>
                  {field}
                </label>
                <input
                  id={field}
                  className="input"
                  value={form[field] || ""}
                  onChange={(event) =>
                    setForm({ ...form, [field]: event.target.value })
                  }
                />
              </div>
            ))}
            <div>
              <label className="label" htmlFor="department">
                Department
              </label>
              <select
                id="department"
                className="select"
                value={form.department}
                onChange={(event) =>
                  setForm({ ...form, department: event.target.value })
                }
              >
                <option value="">Select</option>
                {departments.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.name}
                  </option>
                ))}
              </select>
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

export default DoctorsPage;
