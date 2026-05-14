import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calculator, ReceiptText, RefreshCcw, Search } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api.js";
import formatCurrency from "../../utils/formatCurrency.js";
import Table from "../../components/Table.jsx";
import Modal from "../../components/Modal.jsx";

const defaultForm = {
  patientId: "",
  doctorId: "",
  serviceIds: [],
  discount: 0,
  paymentType: "cash",
  paymentStatus: "pending",
};

const BillingPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [invoiceRes, patientRes, doctorRes, serviceRes] = await Promise.all(
        [
          api.get("/billing", { params: { limit: 200, search } }),
          api.get("/patients", { params: { limit: 200 } }),
          api.get("/doctors", { params: { limit: 200 } }),
          api.get("/services", { params: { limit: 200 } }),
        ],
      );
      setInvoices(invoiceRes.data.data || []);
      setPatients(patientRes.data.data || []);
      setDoctors(doctorRes.data.data || []);
      setServices(serviceRes.data.data || []);
      setTotal(invoiceRes.data.pagination?.total || 0);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch billing data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [search]);

  const visibleInvoices = useMemo(() => {
    if (statusFilter === "all") return invoices;
    return invoices.filter((item) => item.paymentStatus === statusFilter);
  }, [invoices, statusFilter]);

  const selectedServices = services.filter((service) =>
    form.serviceIds.includes(service._id),
  );
  const invoicePreview =
    selectedServices.reduce(
      (sum, service) => sum + Number(service.amount || 0),
      0,
    ) - Number(form.discount || 0);

  const createInvoice = async (event) => {
    event.preventDefault();
    try {
      const selectedForPayload = services.filter((service) =>
        form.serviceIds.includes(service._id),
      );
      const totalAmount =
        selectedForPayload.reduce(
          (sum, service) => sum + Number(service.amount),
          0,
        ) - Number(form.discount || 0);
      const payload = {
        patientId: form.patientId,
        doctorId: form.doctorId,
        services: selectedForPayload.map((service) => ({
          serviceId: service._id,
          name: service.name,
          amount: service.amount,
          quantity: 1,
        })),
        totalAmount: totalAmount > 0 ? totalAmount : 0,
        discount: Number(form.discount || 0),
        paymentType: form.paymentType,
        paymentStatus: form.paymentStatus,
      };

      await api.post("/billing", payload);
      toast.success("Invoice created");
      setOpen(false);
      setForm(defaultForm);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create invoice");
    }
  };

  const paymentBadge = (status) => {
    const className =
      status === "paid"
        ? "badge-success"
        : status === "pending"
          ? "badge-warning"
          : status === "partial"
            ? "badge-neutral"
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
            <ReceiptText size={14} /> Billing desk
          </div>
          <h1 className="page-title">Billing</h1>
          <p className="page-subtitle">
            Create invoices and keep payment data in sync with backend records.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          Create Invoice
        </button>
      </div>

      <div className="toolbar card" style={{ padding: 14, marginBottom: 0 }}>
        <div className="toolbar-group">
          <Search size={16} color="var(--muted)" />
          <input
            className="search-input"
            placeholder="Search by payment type or status"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="toolbar-group" style={{ justifyContent: "flex-end" }}>
          <label
            className="label"
            htmlFor="billingFilter"
            style={{ marginBottom: 0 }}
          >
            Payment status
          </label>
          <select
            id="billingFilter"
            className="select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={{ minWidth: 180 }}
          >
            <option value="all">All</option>
            {["pending", "paid", "partial", "failed"].map((status) => (
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
          <div className="detail-label">Invoices</div>
          <h3>{total}</h3>
        </div>
        <div className="detail-item">
          <div className="detail-label">Visible</div>
          <h3>{visibleInvoices.length}</h3>
        </div>
        <div className="detail-item">
          <div className="detail-label">
            <Calculator
              size={14}
              style={{ marginRight: 6, verticalAlign: "middle" }}
            />{" "}
            Revenue
          </div>
          <h3>
            {formatCurrency(
              visibleInvoices.reduce(
                (sum, item) => sum + Number(item.totalAmount || 0),
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
              key: "paymentStatus",
              label: "Payment Status",
              render: (value) => paymentBadge(value),
            },
            {
              key: "totalAmount",
              label: "Amount",
              render: (value) => formatCurrency(value),
            },
            {
              key: "_id",
              label: "View",
              render: (value) => (
                <Link
                  style={{ color: "var(--primary)", fontWeight: 800 }}
                  to={`/billing/${value}`}
                >
                  Open
                </Link>
              ),
            },
          ]}
          data={visibleInvoices}
          emptyMessage={
            search || statusFilter !== "all"
              ? "No invoices matched your filters."
              : "No invoices available."
          }
        />
      )}

      <Modal title="Create Invoice" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={createInvoice}>
          <div className="form-grid">
            <div>
              <label className="label" htmlFor="patient">
                Patient
              </label>
              <select
                id="patient"
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
              <label className="label" htmlFor="doctor">
                Doctor
              </label>
              <select
                id="doctor"
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
              <label className="label" htmlFor="discount">
                Discount
              </label>
              <input
                id="discount"
                className="input"
                type="number"
                value={form.discount}
                onChange={(event) =>
                  setForm({ ...form, discount: event.target.value })
                }
              />
            </div>
            <div>
              <label className="label" htmlFor="paymentType">
                Payment Type
              </label>
              <select
                id="paymentType"
                className="select"
                value={form.paymentType}
                onChange={(event) =>
                  setForm({ ...form, paymentType: event.target.value })
                }
              >
                <option value="cash">cash</option>
                <option value="card">card</option>
                <option value="upi">upi</option>
                <option value="insurance">insurance</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="paymentStatus">
                Payment Status
              </label>
              <select
                id="paymentStatus"
                className="select"
                value={form.paymentStatus}
                onChange={(event) =>
                  setForm({ ...form, paymentStatus: event.target.value })
                }
              >
                <option value="pending">pending</option>
                <option value="paid">paid</option>
                <option value="failed">failed</option>
                <option value="partial">partial</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Services</label>
              <div
                className="card"
                style={{ padding: 8, maxHeight: 180, overflow: "auto" }}
              >
                {services.map((service) => (
                  <label
                    key={service._id}
                    style={{ display: "flex", gap: 8, padding: "6px 0" }}
                  >
                    <input
                      type="checkbox"
                      checked={form.serviceIds.includes(service._id)}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setForm({
                            ...form,
                            serviceIds: [...form.serviceIds, service._id],
                          });
                        } else {
                          setForm({
                            ...form,
                            serviceIds: form.serviceIds.filter(
                              (id) => id !== service._id,
                            ),
                          });
                        }
                      }}
                    />
                    {service.name} - {formatCurrency(service.amount)}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="detail-grid" style={{ marginTop: 14 }}>
            <div className="detail-item">
              <div className="detail-label">Selected services</div>
              <h3>{selectedServices.length}</h3>
            </div>
            <div className="detail-item">
              <div className="detail-label">Estimated total</div>
              <h3>{formatCurrency(invoicePreview > 0 ? invoicePreview : 0)}</h3>
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 12 }}>
            Save Invoice
          </button>
        </form>
      </Modal>
    </section>
  );
};

export default BillingPage;
