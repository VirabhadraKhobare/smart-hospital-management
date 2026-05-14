import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FlaskConical, RefreshCcw, Search } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api.js";
import formatDate from "../../utils/formatDate.js";
import Table from "../../components/Table.jsx";
import Modal from "../../components/Modal.jsx";

const defaultForm = {
  testName: "",
  patientId: "",
  doctorId: "",
  result: "",
  reportFile: "",
  testDate: "",
  status: "requested",
};

const LaboratoryPage = () => {
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [testRes, patientRes, doctorRes] = await Promise.all([
        api.get("/laboratory", { params: { limit: 200, search } }),
        api.get("/patients", { params: { limit: 200 } }),
        api.get("/doctors", { params: { limit: 200 } }),
      ]);
      setTests(testRes.data.data || []);
      setPatients(patientRes.data.data || []);
      setDoctors(doctorRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [search]);

  const visibleTests = useMemo(() => {
    if (statusFilter === "all") return tests;
    return tests.filter((test) => test.status === statusFilter);
  }, [tests, statusFilter]);

  const statusBadge = (status) => {
    const className =
      status === "completed"
        ? "badge-success"
        : status === "in_progress"
          ? "badge-warning"
          : "badge-neutral";
    return <span className={`badge ${className}`}>{status}</span>;
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/laboratory/${editing._id}`, form);
        toast.success("Test updated");
      } else {
        await api.post("/laboratory", form);
        toast.success("Test request created");
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
            <FlaskConical size={14} /> Laboratory
          </div>
          <h1 className="page-title">Laboratory</h1>
          <p className="page-subtitle">
            Track test requests, results, and completion states in one place.
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
          New Test Request
        </button>
      </div>

      <div className="toolbar card" style={{ padding: 14, marginBottom: 0 }}>
        <div className="toolbar-group">
          <Search size={16} color="var(--muted)" />
          <input
            className="search-input"
            placeholder="Search test name, status, or result"
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
            {["requested", "in_progress", "completed"].map((status) => (
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
          <div className="detail-label">Visible tests</div>
          <h3>{visibleTests.length}</h3>
        </div>
        <div className="detail-item">
          <div className="detail-label">Completed</div>
          <h3>{tests.filter((test) => test.status === "completed").length}</h3>
        </div>
        <div className="detail-item">
          <div className="detail-label">Pending</div>
          <h3>{tests.filter((test) => test.status === "requested").length}</h3>
        </div>
      </div>

      {loading ? (
        <div className="loader" />
      ) : (
        <Table
          columns={[
            { key: "testName", label: "Test Name" },
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
              key: "testDate",
              label: "Date",
              render: (value) => formatDate(value),
            },
            {
              key: "status",
              label: "Status",
              render: (value) => statusBadge(value),
            },
          ]}
          data={visibleTests}
          emptyMessage={
            search || statusFilter !== "all"
              ? "No laboratory records matched your filters."
              : "No laboratory records available."
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
                    testDate: row.testDate?.slice(0, 10) || "",
                  });
                }}
              >
                Edit
              </button>
              <button
                className="btn btn-outline"
                onClick={async () => {
                  try {
                    await api.put(`/laboratory/${row._id}`, {
                      status: "completed",
                    });
                    toast.success("Status updated");
                    fetchAll();
                  } catch (error) {
                    toast.error(
                      error.response?.data?.message ||
                        "Unable to update test status",
                    );
                  }
                }}
              >
                Complete
              </button>
            </div>
          )}
        />
      )}

      <Modal
        title={editing ? "Update Test" : "Request Test"}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={save}>
          <div className="form-grid">
            <div>
              <label className="label">Test Name</label>
              <input
                className="input"
                value={form.testName}
                onChange={(event) =>
                  setForm({ ...form, testName: event.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label">Patient</label>
              <select
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
              <label className="label">Doctor</label>
              <select
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
              <label className="label">Test Date</label>
              <input
                className="input"
                type="date"
                value={form.testDate}
                onChange={(event) =>
                  setForm({ ...form, testDate: event.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="select"
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                <option value="requested">requested</option>
                <option value="in_progress">in_progress</option>
                <option value="completed">completed</option>
              </select>
            </div>
            <div>
              <label className="label">Report File URL</label>
              <input
                className="input"
                value={form.reportFile}
                onChange={(event) =>
                  setForm({ ...form, reportFile: event.target.value })
                }
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Result</label>
              <textarea
                className="textarea"
                value={form.result}
                onChange={(event) =>
                  setForm({ ...form, result: event.target.value })
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

export default LaboratoryPage;
