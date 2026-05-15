import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowRight,
  CircleCheckBig,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { ROLE_DEFAULT_PATH } from "../../utils/constants.js";

const RegisterPage = () => {
  const { register, loading, isAuthenticated, user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    role: "patient",
  });
  const [errors, setErrors] = useState({});

  if (isAuthenticated) {
    return (
      <Navigate to={ROLE_DEFAULT_PATH[user?.role] || "/dashboard"} replace />
    );
  }

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";
    if (!form.password) nextErrors.password = "Password is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      mobile: form.mobile.trim(),
      role: form.role,
    });
  };

  return (
    <div className="auth-shell">
      <aside className="auth-panel">
        <div
          className="summary-chip"
          style={{
            width: "fit-content",
            background: "rgba(255,255,255,0.12)",
            color: "white",
            borderColor: "rgba(255,255,255,0.14)",
          }}
        >
          <Sparkles size={14} /> Start with HMS
        </div>
        <h1>Launch a structured hospital workflow in minutes.</h1>
        <p>
          Create an account for staff, clinicians, or patient-facing roles and
          keep every action aligned with backend permissions.
        </p>

        <div className="auth-highlights">
          <div className="auth-highlight">
            <strong>
              <CircleCheckBig
                size={16}
                style={{ verticalAlign: "middle", marginRight: 6 }}
              />{" "}
              Role-based setup
            </strong>
            Choose the right access level from day one.
          </div>
          <div className="auth-highlight">
            <strong>
              <ShieldCheck
                size={16}
                style={{ verticalAlign: "middle", marginRight: 6 }}
              />{" "}
              Protected data
            </strong>
            User records remain isolated by token-based authentication.
          </div>
          <div className="auth-highlight">
            <strong>
              <ArrowRight
                size={16}
                style={{ verticalAlign: "middle", marginRight: 6 }}
              />{" "}
              Ready to go
            </strong>
            Move directly into the dashboard after login.
          </div>
        </div>
      </aside>

      <div className="auth-card">
        <form className="card" onSubmit={handleSubmit}>
          <div className="summary-chip" style={{ width: "fit-content" }}>
            Create account
          </div>
          <h1 style={{ marginTop: 12 }}>Register</h1>
          <p className="page-subtitle">
            Add your profile so the application can route you into the correct
            workspace.
          </p>

          <label className="label" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            className="input"
            type="text"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Your name"
          />
          {errors.name && <p className="error-text">{errors.name}</p>}

          <label className="label" htmlFor="email" style={{ marginTop: 12 }}>
            Email
          </label>
          <input
            id="email"
            className="input"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            placeholder="you@hospital.com"
          />
          {errors.email && <p className="error-text">{errors.email}</p>}

          <label className="label" htmlFor="mobile" style={{ marginTop: 12 }}>
            Mobile
          </label>
          <input
            id="mobile"
            className="input"
            type="tel"
            value={form.mobile}
            onChange={(event) =>
              setForm({ ...form, mobile: event.target.value })
            }
            placeholder="Optional contact number"
          />

          <label className="label" htmlFor="role" style={{ marginTop: 12 }}>
            Role
          </label>
          <select
            id="role"
            className="select"
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
          >
            <option value="patient">Patient</option>
            <option value="receptionist">Receptionist</option>
            <option value="doctor">Doctor</option>
            <option value="pharmacist">Pharmacist</option>
            <option value="admin">Admin</option>
          </select>

          <label className="label" htmlFor="password" style={{ marginTop: 12 }}>
            Password
          </label>
          <input
            id="password"
            className="input"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            placeholder="Minimum 8 characters"
          />
          {errors.password && <p className="error-text">{errors.password}</p>}

          <button
            className="btn btn-primary"
            type="submit"
            style={{ width: "100%", marginTop: 18 }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p
            style={{
              marginBottom: 0,
              marginTop: 14,
              color: "var(--muted)",
              textAlign: "center",
            }}
          >
            Already registered?{" "}
            <Link
              to="/login"
              style={{ color: "var(--primary)", fontWeight: 800 }}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
