import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, RefreshCcw, Search } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api.js";
import formatDate from "../../utils/formatDate.js";
import formatCurrency from "../../utils/formatCurrency.js";
import Table from "../../components/Table.jsx";
import Modal from "../../components/Modal.jsx";

const defaultForm = {
  medicineName: "",
  genericName: "",
  quantity: "",
  price: "",
  expiryDate: "",
  supplier: "",
  category: "",
};

const PharmacyPage = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/pharmacy", {
        params: { limit: 200, search },
      });
      setItems(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [search]);

  const visibleItems = useMemo(() => {
    if (stockFilter === "all") return items;
    if (stockFilter === "low")
      return items.filter((item) => Number(item.quantity || 0) < 20);
    return items.filter((item) => Number(item.quantity || 0) >= 20);
  }, [items, stockFilter]);

  const expiringSoon = useMemo(() => {
    const now = new Date();
    const horizon = new Date();
    horizon.setDate(now.getDate() + 60);
    return visibleItems.filter(
      (item) => item.expiryDate && new Date(item.expiryDate) <= horizon,
    ).length;
  }, [visibleItems]);

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/pharmacy/${editing._id}`, form);
        toast.success("Stock updated");
      } else {
        await api.post("/pharmacy", form);
        toast.success("Medicine added");
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
            <Pill size={14} /> Pharmacy inventory
          </div>
          <h1 className="page-title">Pharmacy Inventory</h1>
          <p className="page-subtitle">
            Monitor stock, expiry dates, and medicines that need attention.
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
          Add Stock
        </button>
      </div>

      <div className="toolbar card" style={{ padding: 14, marginBottom: 0 }}>
        <div className="toolbar-group">
          <Search size={16} color="var(--muted)" />
          <input
            className="search-input"
            placeholder="Search medicine, generic name, supplier, or category"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="toolbar-group" style={{ justifyContent: "flex-end" }}>
          <label
            className="label"
            htmlFor="stockFilter"
            style={{ marginBottom: 0 }}
          >
            Stock level
          </label>
          <select
            id="stockFilter"
            className="select"
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
            style={{ minWidth: 180 }}
          >
            <option value="all">All</option>
            <option value="low">Low stock</option>
            <option value="healthy">Healthy stock</option>
          </select>
          <button type="button" className="btn btn-outline" onClick={fetchAll}>
            <RefreshCcw size={14} style={{ marginRight: 6 }} /> Refresh
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <div className="detail-label">Visible items</div>
          <h3>{visibleItems.length}</h3>
        </div>
        <div className="detail-item">
          <div className="detail-label">Low stock</div>
          <h3>
            {
              visibleItems.filter((item) => Number(item.quantity || 0) < 20)
                .length
            }
          </h3>
        </div>
        <div className="detail-item">
          <div className="detail-label">Expiring soon</div>
          <h3>{expiringSoon}</h3>
        </div>
      </div>

      {loading ? (
        <div className="loader" />
      ) : (
        <Table
          columns={[
            {
              key: "medicineName",
              label: "Medicine",
              render: (value, row) => (
                <span
                  style={{
                    color:
                      Number(row.quantity || 0) < 20
                        ? "var(--danger)"
                        : "inherit",
                    fontWeight: 800,
                  }}
                >
                  {value}
                </span>
              ),
            },
            { key: "genericName", label: "Generic Name" },
            {
              key: "quantity",
              label: "Quantity",
              render: (value) => (
                <span
                  className={`badge ${Number(value || 0) < 20 ? "badge-danger" : "badge-success"}`}
                >
                  {value ?? 0}
                </span>
              ),
            },
            {
              key: "price",
              label: "Price",
              render: (value) => formatCurrency(value),
            },
            {
              key: "expiryDate",
              label: "Expiry",
              render: (value) => formatDate(value),
            },
          ]}
          data={visibleItems}
          emptyMessage={
            search || stockFilter !== "all"
              ? "No medicines matched your filters."
              : "No inventory items available."
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
                    expiryDate: row.expiryDate?.slice(0, 10) || "",
                  });
                }}
              >
                Edit
              </button>
              <button
                className="btn btn-outline"
                onClick={async () => {
                  if (!window.confirm("Delete stock item?")) return;
                  await api.delete(`/pharmacy/${row._id}`);
                  toast.success("Stock item removed");
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
        title={editing ? "Edit Stock" : "Add Stock"}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={save}>
          <div className="form-grid">
            {[
              "medicineName",
              "genericName",
              "quantity",
              "price",
              "supplier",
              "category",
            ].map((field) => (
              <div key={field}>
                <label className="label">{field}</label>
                <input
                  className="input"
                  value={form[field] || ""}
                  onChange={(event) =>
                    setForm({ ...form, [field]: event.target.value })
                  }
                  required={["medicineName", "quantity", "price"].includes(
                    field,
                  )}
                />
              </div>
            ))}
            <div>
              <label className="label">expiryDate</label>
              <input
                className="input"
                type="date"
                value={form.expiryDate}
                onChange={(event) =>
                  setForm({ ...form, expiryDate: event.target.value })
                }
                required
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

export default PharmacyPage;
