import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, UserRound, Phone, CalendarDays } from "lucide-react";

import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import formatDate from "../../utils/formatDate.js";

const ProfilePage = () => {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", mobile: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/users/profile");
        setProfile(data);
        setForm({ name: data.name || "", mobile: data.mobile || "" });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      }
    };

    fetchProfile();
  }, []);

  const save = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.put("/users/profile", form);
      setProfile(data);
      setUser((current) => ({
        ...current,
        name: data.name,
        mobile: data.mobile,
      }));
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  if (!profile) return <div className="loader" />;

  return (
    <section className="section-grid">
      <div className="page-head">
        <div>
          <div
            className="summary-chip"
            style={{ width: "fit-content", marginBottom: 10 }}
          >
            <ShieldCheck size={14} /> Account details
          </div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">
            Keep the visible account profile updated for the current session.
          </p>
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
                Name
              </div>
              <h3>{profile.name || "-"}</h3>
            </div>
            <div className="detail-item">
              <div className="detail-label">Email</div>
              <h3>{profile.email || "-"}</h3>
            </div>
            <div className="detail-item">
              <div className="detail-label">Role</div>
              <span
                className={`badge ${profile.role === "admin" ? "badge-success" : "badge-neutral"}`}
              >
                {profile.role}
              </span>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <CalendarDays
                  size={14}
                  style={{ marginRight: 6, verticalAlign: "middle" }}
                />{" "}
                Joined
              </div>
              <h3>{formatDate(profile.createdAt)}</h3>
            </div>
          </div>

          <form onSubmit={save} style={{ marginTop: 18 }}>
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
                <label className="label">
                  <Phone
                    size={14}
                    style={{ marginRight: 6, verticalAlign: "middle" }}
                  />{" "}
                  Mobile
                </label>
                <input
                  className="input"
                  value={form.mobile}
                  onChange={(event) =>
                    setForm({ ...form, mobile: event.target.value })
                  }
                />
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 14 }}>
              Update Profile
            </button>
          </form>
        </article>

        <aside className="card" style={{ padding: 18, alignSelf: "start" }}>
          <h2 className="page-title" style={{ marginBottom: 8 }}>
            Session Summary
          </h2>
          <p className="page-subtitle">
            The profile panel is backed by the authenticated user endpoint.
          </p>
          <div className="detail-grid" style={{ marginTop: 12 }}>
            <div className="detail-item">
              <div className="detail-label">Access</div>
              <h3>Verified</h3>
            </div>
            <div className="detail-item">
              <div className="detail-label">Mobile</div>
              <h3>{profile.mobile || "-"}</h3>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default ProfilePage;
