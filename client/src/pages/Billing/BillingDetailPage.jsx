import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CreditCard,
  Printer,
  UserRound,
  Stethoscope,
  ReceiptText,
} from "lucide-react";

import api from "../../services/api.js";
import formatCurrency from "../../utils/formatCurrency.js";
import formatDate from "../../utils/formatDate.js";

const BillingDetailPage = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data } = await api.get(`/billing/${id}`);
        setInvoice(data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch invoice");
      }
    };

    fetchInvoice();
  }, [id]);

  const paymentClass = useMemo(() => {
    if (!invoice) return "badge-neutral";
    if (invoice.paymentStatus === "paid") return "badge-success";
    if (invoice.paymentStatus === "pending") return "badge-warning";
    return "badge-danger";
  }, [invoice]);

  if (!invoice) return <div className="loader" />;

  return (
    <section className="section-grid">
      <div className="page-head">
        <div>
          <div
            className="summary-chip"
            style={{ width: "fit-content", marginBottom: 10 }}
          >
            <ReceiptText size={14} /> Invoice detail
          </div>
          <h1 className="page-title">Billing Overview</h1>
          <p className="page-subtitle">
            A clear breakdown of this invoice, its services, and current payment
            status.
          </p>
        </div>
        <div className="row-actions" style={{ justifyContent: "flex-end" }}>
          <Link className="btn btn-outline" to="/billing">
            Back to billing
          </Link>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={14} style={{ marginRight: 6 }} /> Print
          </button>
        </div>
      </div>

      <div className="split-layout">
        <article className="card" style={{ padding: 18 }}>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">
                <UserRound
                  size={14}
                  style={{ marginRight: 6, verticalAlign: "middle" }}
                />{" "}
                Patient
              </div>
              <h3>
                <Link
                  to={`/patients/${invoice.patientId?._id}`}
                  style={{ color: "var(--primary)", textDecoration: "none" }}
                >
                  {invoice.patientId?.name || "-"}
                </Link>
              </h3>
              <p className="muted" style={{ marginBottom: 0 }}>
                {invoice.patientId?.email || "-"}
              </p>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <Stethoscope
                  size={14}
                  style={{ marginRight: 6, verticalAlign: "middle" }}
                />{" "}
                Doctor
              </div>
              <h3>{invoice.doctorId?.name || "-"}</h3>
              <p className="muted" style={{ marginBottom: 0 }}>
                {invoice.doctorId?.specialization || "-"}
              </p>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <CreditCard
                  size={14}
                  style={{ marginRight: 6, verticalAlign: "middle" }}
                />{" "}
                Status
              </div>
              <span className={`badge ${paymentClass}`}>
                {invoice.paymentStatus}
              </span>
              <p className="muted" style={{ marginBottom: 0, marginTop: 10 }}>
                {invoice.paymentType || "cash"}
              </p>
            </div>
            <div className="detail-item">
              <div className="detail-label">Created</div>
              <h3>{formatDate(invoice.createdAt)}</h3>
              <p className="muted" style={{ marginBottom: 0 }}>
                Invoice #{invoice._id?.slice(-6)}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <h2 className="page-title" style={{ marginBottom: 12 }}>
              Services
            </h2>
            {(invoice.services || []).length > 0 ? (
              <div className="card-soft" style={{ padding: 8 }}>
                {(invoice.services || []).map((service, index) => (
                  <div
                    key={`${service.serviceId || index}-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "12px 10px",
                      borderBottom:
                        index === invoice.services.length - 1
                          ? "0"
                          : "1px solid rgba(148,163,184,0.18)",
                    }}
                  >
                    <div>
                      <strong>{service.name}</strong>
                      <div className="muted" style={{ fontSize: 13 }}>
                        Qty {service.quantity || 1}
                      </div>
                    </div>
                    <strong>{formatCurrency(service.amount)} </strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                No services captured on this invoice.
              </div>
            )}
          </div>
        </article>

        <aside className="card" style={{ padding: 18, alignSelf: "start" }}>
          <h2 className="page-title" style={{ marginBottom: 8 }}>
            Invoice Summary
          </h2>
          <p className="page-subtitle">
            The key totals and charge values are highlighted here.
          </p>
          <div className="detail-grid" style={{ marginTop: 12 }}>
            <div className="detail-item">
              <div className="detail-label">Subtotal</div>
              <h3>
                {formatCurrency(
                  (invoice.totalAmount || 0) + (invoice.discount || 0),
                )}
              </h3>
            </div>
            <div className="detail-item">
              <div className="detail-label">Discount</div>
              <h3>{formatCurrency(invoice.discount || 0)}</h3>
            </div>
            <div className="detail-item">
              <div className="detail-label">Total</div>
              <h3>{formatCurrency(invoice.totalAmount || 0)}</h3>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default BillingDetailPage;
