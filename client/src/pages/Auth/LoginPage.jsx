import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { ROLE_DEFAULT_PATH } from "../../utils/constants.js";

const LoginPage = () => {
  const { login, loading, isAuthenticated, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  if (isAuthenticated) {
    return (
      <Navigate to={ROLE_DEFAULT_PATH[user?.role] || "/dashboard"} replace />
    );
  }

  const validate = () => {
    const nextErrors = {};
    if (!form.email) nextErrors.email = "Email is required";
    if (!form.password) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    await login({
      email: form.email.trim(),
      password: form.password,
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
          <Sparkles size={14} /> Hospital OS
        </div>
        <h1>Run the hospital from one clean workspace.</h1>
        <p>
          Securely manage patients, doctors, appointments, billing, laboratory
          work, and pharmacy inventory.
        </p>

        <div className="auth-highlights">
          <div className="auth-highlight">
            <strong>
              <ShieldCheck
                size={16}
                style={{ verticalAlign: "middle", marginRight: 6 }}
              />{" "}
              Secure access
            </strong>
            Role-based authentication and protected routes.
          </div>
          <div className="auth-highlight">
            <strong>
              <Stethoscope
                size={16}
                style={{ verticalAlign: "middle", marginRight: 6 }}
              />{" "}
              Live records
            </strong>
            Connected directly to the backend API.
          </div>
          <div className="auth-highlight">
            <strong>
              <ArrowRight
                size={16}
                style={{ verticalAlign: "middle", marginRight: 6 }}
              />{" "}
              Fast workflow
            </strong>
            Streamlined navigation for daily operations.
          </div>
        </div>
      </aside>

      <div className="auth-card">
        <form className="card" onSubmit={handleSubmit}>
          <div className="summary-chip" style={{ width: "fit-content" }}>
            Login
          </div>
          <h1 style={{ marginTop: 12 }}>Welcome back</h1>
          <p className="page-subtitle">
            Use your account to continue into the hospital management dashboard.
          </p>

          <label className="label" htmlFor="email">
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
            placeholder="Enter your password"
          />
          {errors.password && <p className="error-text">{errors.password}</p>}

          <button
            className="btn btn-primary"
            type="submit"
            style={{ width: "100%", marginTop: 18 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Enter dashboard"}
          </button>

          <p
            style={{
              marginBottom: 0,
              marginTop: 14,
              color: "var(--muted)",
              textAlign: "center",
            }}
          >
            New here?{" "}
            <Link
              to="/register"
              style={{ color: "var(--primary)", fontWeight: 800 }}
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
