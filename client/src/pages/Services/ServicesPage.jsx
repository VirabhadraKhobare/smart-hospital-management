import { useEffect, useMemo, useState } from "react";
import { Layers3, RefreshCcw, Search } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api.js";
import formatCurrency from "../../utils/formatCurrency.js";
import Table from "../../components/Table.jsx";
import Modal from "../../components/Modal.jsx";

const defaultForm = { name: "", amount: "", description: "", department: "" };

const ServicesPage = () => {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [serviceRes, departmentRes] = await Promise.all([
        api.get("/services", { params: { limit: 200, search } }),
        api.get("/departments", { params: { limit: 200 } }),
      ]);
      setItems(serviceRes.data.data || []);
      setDepartments(departmentRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [search]);

  const visibleItems = useMemo(() => {
    if (departmentFilter === "all") return items;
    return items.filter((item) => item.department?._id === departmentFilter);
  }, [items, departmentFilter]);

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/services/${editing._id}`, form);
        toast.success("Service updated");
      } else {
        await api.post("/services", form);
        toast.success("Service added");
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
            <Layers3 size={14} /> Service catalog
          </div>
          <h1 className="page-title">Service Charges</h1>
          <p className="page-subtitle">
            Maintain chargeable services and their department links.
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
          Add Service
        </button>
      </div>

      <div className="toolbar card" style={{ padding: 14, marginBottom: 0 }}>
        <div className="toolbar-group">
          <Search size={16} color="var(--muted)" />
          <input
            className="search-input"
            placeholder="Search name or description"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="toolbar-group" style={{ justifyContent: "flex-end" }}>
          <label
            className="label"
            htmlFor="departmentFilter"
            style={{ marginBottom: 0 }}
          >
            Department
          </label>
          <select
            id="departmentFilter"
            className="select"
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            style={{ minWidth: 220 }}
          >
            <option value="all">All</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
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
          <div className="detail-label">Visible services</div>
          <h3>{visibleItems.length}</h3>
        </div>
        <div className="detail-item">
          <div className="detail-label">Departments</div>
          <h3>{departments.length}</h3>
        </div>
        <div className="detail-item">
          <div className="detail-label">Total value</div>
          <h3>
            {formatCurrency(
              visibleItems.reduce(
                (sum, item) => sum + Number(item.amount || 0),
                0,
              ),
            )}
          </h3>
        </div>
      </div>

      {loading ? (
        <div className="loader" />
      ) : (
        <Table
          columns={[
            { key: "name", label: "Service" },
            {
              key: "department",
              label: "Department",
              render: (value) => value?.name || "-",
            },
            {
              key: "amount",
              label: "Amount",
              render: (value) => formatCurrency(value),
            },
            {
              key: "description",
              label: "Description",
              render: (value) => value || "-",
            },
          ]}
          data={visibleItems}
          emptyMessage={
            search || departmentFilter !== "all"
              ? "No services matched your filters."
              : "No services available."
          }
          renderActions={(row) => (
            <div className="row-actions">
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
                  if (!window.confirm("Delete service?")) return;
                  await api.delete(`/services/${row._id}`);
                  toast.success("Service removed");
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
        title={editing ? "Edit Service" : "Add Service"}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={save}>
          <div className="form-grid">
            <div>
              <label className="label">Name</label>
              <input
                className="input"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Amount</label>
              <input
                className="input"
                type="number"
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Department</label>
              <select
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
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Description</label>
              <textarea
                className="textarea"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
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

export default ServicesPage;
