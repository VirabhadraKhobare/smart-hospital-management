import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Calendar, CreditCard, FlaskConical } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api.js";
import formatDate from "../../utils/formatDate.js";
import formatCurrency from "../../utils/formatCurrency.js";
import Table from "../../components/Table.jsx";

const PatientDetailPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [billing, setBilling] = useState([]);
  const [lab, setLab] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, appointmentRes, billingRes, labRes] =
          await Promise.allSettled([
            api.get(`/patients/${id}`),
            api.get("/appointments", { params: { limit: 200 } }),
            api.get("/billing", { params: { limit: 200 } }),
            api.get("/laboratory", { params: { limit: 200 } }),
          ]);

        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value.data);
        } else {
          throw profileRes.reason;
        }

        if (appointmentRes.status === "fulfilled") {
          setAppointments(
            (appointmentRes.value.data.data || []).filter(
              (item) => item.patientId?._id === id,
            ),
          );
        }

        if (billingRes.status === "fulfilled") {
          setBilling(
            (billingRes.value.data.data || []).filter(
              (item) => item.patientId?._id === id,
            ),
          );
        }

        if (labRes.status === "fulfilled") {
          setLab(
            (labRes.value.data.data || []).filter(
              (item) => item.patientId?._id === id,
            ),
          );
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load patient detail",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="loader" />;
  if (!profile) return <p>Patient not found.</p>;

  return (
    <section>
      <div className="page-head">
        <div>
          <Link
            to="/patients"
            className="btn btn-outline"
            style={{ marginBottom: 12 }}
          >
            <ChevronLeft size={14} style={{ marginRight: 6 }} /> Back to
            Patients
          </Link>
          <h1 className="page-title">{profile.name}</h1>
          <p className="page-subtitle">
            {profile.email} | {profile.mobile}
          </p>
        </div>
        <div className="row-actions">
          <Link to="/appointments" className="btn btn-outline">
            <Calendar size={14} style={{ marginRight: 6 }} /> View Appointments
          </Link>
          <Link to="/billing" className="btn btn-outline">
            <CreditCard size={14} style={{ marginRight: 6 }} /> View Billing
          </Link>
          <Link to="/laboratory" className="btn btn-outline">
            <FlaskConical size={14} style={{ marginRight: 6 }} /> View Lab Tests
          </Link>
        </div>
      </div>

      <article className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Address</div>
            <p>{profile.address || "-"}</p>
          </div>
          <div className="detail-item">
            <div className="detail-label">Blood Group</div>
            <p>{profile.bloodGroup || "-"}</p>
          </div>
          <div className="detail-item">
            <div className="detail-label">Disease</div>
            <p>{profile.disease || "-"}</p>
          </div>
          <div className="detail-item">
            <div className="detail-label">Age</div>
            <p>{profile.age || "-"}</p>
          </div>
          <div className="detail-item">
            <div className="detail-label">Gender</div>
            <p style={{ textTransform: "capitalize" }}>
              {profile.gender || "-"}
            </p>
          </div>
        </div>
      </article>

      <h3 style={{ marginBottom: 8 }}>Appointment History</h3>
      <Table
        columns={[
          {
            key: "doctorId",
            label: "Doctor",
            render: (value) =>
              value?._id ? (
                <Link
                  to="/doctors"
                  style={{ color: "var(--primary)", fontWeight: 600 }}
                >
                  {value?.name || "-"}
                </Link>
              ) : (
                "-"
              ),
          },
          { key: "date", label: "Date", render: (value) => formatDate(value) },
          {
            key: "status",
            label: "Status",
            render: (value) => (
              <span
                className={`badge badge-${value === "completed" ? "success" : value === "scheduled" ? "warning" : "danger"}`}
              >
                {value}
              </span>
            ),
          },
        ]}
        data={appointments}
        emptyMessage="No appointments found for this patient."
      />

      <h3 style={{ marginTop: 14, marginBottom: 8 }}>Billing History</h3>
      <Table
        columns={[
          {
            key: "paymentStatus",
            label: "Payment Status",
            render: (value) => (
              <span
                className={`badge badge-${value === "paid" ? "success" : value === "pending" ? "warning" : "danger"}`}
              >
                {value}
              </span>
            ),
          },
          {
            key: "totalAmount",
            label: "Amount",
            render: (value) => formatCurrency(value),
          },
        ]}
        data={billing}
        emptyMessage="No billing records found for this patient."
      />

      <h3 style={{ marginTop: 14, marginBottom: 8 }}>Lab Results</h3>
      <Table
        columns={[
          { key: "testName", label: "Test" },
          {
            key: "status",
            label: "Status",
            render: (value) => (
              <span
                className={`badge badge-${value === "completed" ? "success" : value === "in_progress" ? "warning" : "neutral"}`}
              >
                {value}
              </span>
            ),
          },
          {
            key: "testDate",
            label: "Date",
            render: (value) => formatDate(value),
          },
        ]}
        data={lab}
        emptyMessage="No lab tests found for this patient."
      />
    </section>
  );
};

export default PatientDetailPage;
