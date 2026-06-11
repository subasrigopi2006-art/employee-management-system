import React, { useState, useEffect } from "react";
import { getPerformanceScores, addPerformanceReview } from "../api/employeeApi";

const PERF_COLOR = {
  Excellent: "#22c55e",
  Good:      "#3b82f6",
  Average:   "#eab308",
  Poor:      "#ef4444",
};
const RATINGS = ["Excellent", "Good", "Average", "Poor"];
const RATING_SCORES = { Excellent: 9, Good: 7, Average: 5, Poor: 2 };

export default function Performance({ user }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [ratingModal, setRatingModal] = useState(null);
  const [form, setForm] = useState({ rating: "Good", score: 7, comment: "", reviewedBy: "" });
  const [saving, setSaving] = useState(false);
  const [showHow, setShowHow] = useState(false);

  const isEmployee = user?.role === "employee";

  const load = async () => {
    setLoading(true);
    try {
      const data = await getPerformanceScores();
      setEmployees(data);
    } catch { /* offline */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const visible = isEmployee
    ? employees.filter((e) => e.email === user?.email)
    : employees;

  const submitRating = async () => {
    if (!form.rating || !form.score) return;
    setSaving(true);
    try {
      await addPerformanceReview(ratingModal._id, form);
      setRatingModal(null);
      await load();
    } catch (err) {
      alert("Error: " + err.message);
    } finally { setSaving(false); }
  };

  const scoreColor = (s) =>
    s >= 85 ? PERF_COLOR.Excellent :
    s >= 65 ? PERF_COLOR.Good      :
    s >= 45 ? PERF_COLOR.Average   : PERF_COLOR.Poor;

  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">
        <h1 className="page-heading">Performance</h1>
        <button
          onClick={() => setShowHow(!showHow)}
          style={{
            padding: "8px 16px", borderRadius: "8px", fontSize: "13px",
            fontWeight: "600", cursor: "pointer", border: "1.5px solid #667eea",
            background: showHow ? "#667eea" : "#fff",
            color: showHow ? "#fff" : "#667eea",
          }}
        >
          {showHow ? "Hide" : "How is it calculated? 📊"}
        </button>
      </div>

      {/* ── How it's calculated panel ── */}
      {showHow && (
        <div style={{
          background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "12px",
          padding: "20px", marginBottom: "20px",
        }}>
          <h3 style={{ margin: "0 0 16px", color: "#1e293b", fontSize: "15px" }}>
            📊 How Performance Score is Calculated
          </h3>

          <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#475569" }}>
            Each employee gets a score out of <strong>100 points</strong> based on 4 things from the last 30 days:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            {[
              {
                icon: "📅", title: "Attendance Rate", pts: "40 pts",
                color: "#3b82f6",
                desc: "How many days the employee came to work vs total working days (excluding approved leave).",
                formula: "Score = (Present + Half-Day×0.5) ÷ Working Days × 40",
              },
              {
                icon: "⏰", title: "Punctuality", pts: "20 pts",
                color: "#8b5cf6",
                desc: "How often the employee checked in on time (by 9:15 AM) on days they were present.",
                formula: "Score = On-Time Days ÷ Present Days × 20",
              },
              {
                icon: "⌛", title: "Hours Worked", pts: "20 pts",
                color: "#f59e0b",
                desc: "Average hours worked per day based on check-in and check-out times. Target is 9 hours.",
                formula: "Score = Avg Hours ÷ 9 × 20   (max 20)",
              },
              {
                icon: "⭐", title: "Manual Review Score", pts: "20 pts",
                color: "#ec4899",
                desc: "Score given by admin during performance reviews. Based on last 3 reviews.",
                formula: "Score = Avg Review Score ÷ 10 × 20",
              },
            ].map((item) => (
              <div key={item.title} style={{
                display: "flex", gap: "14px", padding: "12px 14px",
                background: "#f8fafc", borderRadius: "10px",
                borderLeft: `4px solid ${item.color}`,
              }}>
                <span style={{ fontSize: "22px", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "13px", color: "#1e293b" }}>{item.title}</strong>
                    <span style={{
                      background: item.color + "22", color: item.color,
                      fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px",
                    }}>{item.pts}</span>
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#475569" }}>{item.desc}</p>
                  <code style={{ fontSize: "11px", color: "#64748b", background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px" }}>
                    {item.formula}
                  </code>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: "#f1f5f9", borderRadius: "8px", padding: "12px 14px",
            fontSize: "13px", color: "#475569",
          }}>
            <strong>Final Rating:</strong>
            {" "}<span style={{ color: PERF_COLOR.Excellent, fontWeight: "700" }}>Excellent ≥ 85</span>
            {" · "}<span style={{ color: PERF_COLOR.Good, fontWeight: "700" }}>Good ≥ 65</span>
            {" · "}<span style={{ color: PERF_COLOR.Average, fontWeight: "700" }}>Average ≥ 45</span>
            {" · "}<span style={{ color: PERF_COLOR.Poor, fontWeight: "700" }}>Poor &lt; 45</span>
          </div>
        </div>
      )}

      {/* Summary cards (admin) */}
      {!isEmployee && (
        <div className="stats-row">
          {RATINGS.map((r) => (
            <div key={r} className="info-card" style={{ borderLeft: `4px solid ${PERF_COLOR[r]}` }}>
              <p className="info-label" style={{ color: PERF_COLOR[r] }}>{r}</p>
              <p className="info-value">{employees.filter((e) => e.calculatedRating === r).length} employees</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading-state">Calculating performance scores…</div>
        ) : (
          <table className="emp-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Rating</th>
                <th>Score / 100</th>
                <th>Attendance</th>
                <th>Punctuality</th>
                <th>Avg Hours</th>
                {!isEmployee && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan="8" className="empty-state">No data found.</td></tr>
              ) : visible.map((emp) => {
                const bd = emp.breakdown || {};
                const color = scoreColor(emp.calculatedScore ?? 0);
                return (
                  <tr key={emp._id}>
                    <td>
                      <div className="emp-name-cell">
                        <div className="emp-avatar">{emp.avatar}</div>
                        {emp.name}
                      </div>
                    </td>
                    <td><span className="dept-badge">{emp.department}</span></td>
                    <td>
                      <span className="perf-badge" style={{
                        background: color + "22", color, fontWeight: "700",
                      }}>
                        {emp.calculatedRating}
                      </span>
                    </td>
                    <td>
                      {/* Simple score bar */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                          width: "80px", height: "8px", background: "#e2e8f0",
                          borderRadius: "99px", overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%", width: `${emp.calculatedScore ?? 0}%`,
                            background: color, borderRadius: "99px",
                          }} />
                        </div>
                        <span style={{ fontWeight: "700", fontSize: "13px", color }}>
                          {emp.calculatedScore ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: "600", fontSize: "13px",
                        color: (bd.attendanceRate ?? 100) >= 90 ? "#22c55e"
                             : (bd.attendanceRate ?? 100) >= 75 ? "#3b82f6" : "#ef4444" }}>
                        {bd.attendanceRate ?? "—"}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: "600", fontSize: "13px",
                        color: (bd.punctualityRate ?? 100) >= 90 ? "#22c55e"
                             : (bd.punctualityRate ?? 100) >= 70 ? "#eab308" : "#ef4444" }}>
                        {bd.punctualityRate ?? "—"}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: "600", fontSize: "13px", color: "#475569" }}>
                        {bd.avgHoursPerDay ?? "—"}h
                      </span>
                    </td>
                    {!isEmployee && (
                      <td>
                        <button className="btn-edit" onClick={() => {
                          setRatingModal(emp);
                          setForm({ rating: "Good", score: 7, comment: "", reviewedBy: user?.name || "Admin" });
                        }}>
                          ⭐ Rate
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <div className="modal-overlay" onClick={() => setRatingModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <h2 className="modal-title">Rate Employee</h2>
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              marginBottom: "20px", padding: "12px",
              background: "#f8fafc", borderRadius: "10px",
            }}>
              <div className="emp-avatar" style={{
                width: "44px", height: "44px", fontSize: "16px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg,#667eea,#764ba2)",
                color: "#fff", fontWeight: "700", borderRadius: "50%",
              }}>
                {ratingModal.avatar}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: "700", color: "#1e293b" }}>{ratingModal.name}</p>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{ratingModal.department}</p>
              </div>
            </div>

            <div className="modal-fields">
              <label>
                Rating
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value, score: RATING_SCORES[e.target.value] })}
                >
                  {RATINGS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </label>
              <label>
                Score (1–10)
                <input
                  type="range" min="1" max="10" value={form.score}
                  onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                  style={{ cursor: "pointer" }}
                />
                <div style={{ textAlign: "center", fontWeight: "700", color: PERF_COLOR[form.rating], fontSize: "18px" }}>
                  {form.score}/10
                </div>
              </label>
              <label>
                Comment (optional)
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Add a comment..."
                  rows={3}
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                />
              </label>
              <label>
                Reviewed By
                <input
                  value={form.reviewedBy}
                  onChange={(e) => setForm({ ...form, reviewedBy: e.target.value })}
                  placeholder="Your name"
                />
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setRatingModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={submitRating} disabled={saving}>
                {saving ? "Saving…" : "Submit Rating"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
