import React, { useState, useEffect } from "react";
import { getEmployees, updateSalary, addPerformanceReview } from "../api/employeeApi";

// ── SALARIES PAGE (with Edit) ─────────────────────────────────────────────────
export function Salaries({ user }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editId, setEditId]       = useState(null);
  const [editSalary, setEditSalary] = useState("");
  const [saving, setSaving]       = useState(false);

  const isEmployee = user?.role === "employee";

  const fetchEmps = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch { /* offline */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmps(); }, []);

  const visibleEmps = isEmployee
    ? employees.filter((e) => e.email === user.email)
    : employees;

  const totalPayroll = employees.reduce((s, e) => s + (e.salary || 0), 0);
  const avgSalary    = employees.length
    ? Math.round(totalPayroll / employees.length)
    : 0;
  const highestSalary = employees.length
    ? Math.max(...employees.map((e) => e.salary || 0))
    : 0;

  const startEdit = (emp) => {
    setEditId(emp._id);
    setEditSalary(emp.salary);
  };

  const cancelEdit = () => { setEditId(null); setEditSalary(""); };

  const saveSalary = async (id) => {
    if (!editSalary || Number(editSalary) < 0) return;
    setSaving(true);
    try {
      const updated = await updateSalary(id, Number(editSalary));
      setEmployees(employees.map((e) => (e._id === id ? updated : e)));
      setEditId(null);
    } catch (err) {
      alert("Error updating salary: " + err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-heading">Salaries</h1>
      </div>

      {!isEmployee && (
        <div className="stats-row">
          <div className="info-card">
            <p className="info-label">Total Payroll</p>
            <p className="info-value">₹{totalPayroll.toLocaleString()}</p>
          </div>
          <div className="info-card">
            <p className="info-label">Average Salary</p>
            <p className="info-value">₹{avgSalary.toLocaleString()}</p>
          </div>
          <div className="info-card">
            <p className="info-label">Highest Salary</p>
            <p className="info-value">₹{highestSalary.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Salary Breakdown</h2>
        {loading ? (
          <div className="loading-state">Loading salary data...</div>
        ) : (
          <table className="emp-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Salary</th>
                {!isEmployee && <th>% of Avg</th>}
                {!isEmployee && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visibleEmps.length === 0 ? (
                <tr><td colSpan="5" className="empty-state">No data found.</td></tr>
              ) : (
                visibleEmps.map((emp) => {
                  const pct = avgSalary ? ((emp.salary / avgSalary) * 100).toFixed(0) : 0;
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
                        {editId === emp._id ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ color: "#64748b" }}>₹</span>
                            <input
                              type="number"
                              value={editSalary}
                              onChange={(e) => setEditSalary(e.target.value)}
                              style={{
                                width: "110px", padding: "6px 10px",
                                border: "2px solid #667eea", borderRadius: "6px",
                                fontSize: "14px", outline: "none",
                              }}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span style={{ fontWeight: "600" }}>₹{emp.salary?.toLocaleString()}</span>
                        )}
                      </td>
                      {!isEmployee && (
                        <td>
                          <div className="salary-bar-wrap">
                            <div className="salary-bar" style={{
                              width: `${Math.min(pct, 130)}%`,
                              background: pct > 100 ? "#22c55e" : "#3b82f6",
                            }} />
                            <span>{pct}%</span>
                          </div>
                        </td>
                      )}
                      {!isEmployee && (
                        <td>
                          {editId === emp._id ? (
                            <div className="action-btns">
                              <button
                                className="btn-edit"
                                onClick={() => saveSalary(emp._id)}
                                disabled={saving}
                                style={{ background: "#22c55e", color: "#fff", border: "none" }}
                              >
                                {saving ? "Saving…" : "Save"}
                              </button>
                              <button className="btn-outline" onClick={cancelEdit} style={{ padding: "5px 10px" }}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button className="btn-edit" onClick={() => startEdit(emp)}>
                              ✏️ Edit
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── PERFORMANCE PAGE (with Rating system) ────────────────────────────────────
const PERF_COLOR = { Excellent: "#22c55e", Good: "#3b82f6", Average: "#eab308", Poor: "#ef4444" };
const RATINGS = ["Excellent", "Good", "Average", "Poor"];
const RATING_SCORES = { Excellent: 9, Good: 7, Average: 5, Poor: 2 };

export function Performance({ user }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [ratingModal, setRatingModal] = useState(null); // emp being rated
  const [form, setForm] = useState({ rating: "Good", score: 7, comment: "", reviewedBy: "" });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const isEmployee = user?.role === "employee";

  useEffect(() => {
    (async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch { /* offline */ }
      finally { setLoading(false); }
    })();
  }, []);

  const visibleEmps = isEmployee
    ? employees.filter((e) => e.email === user.email)
    : employees;

  const openRatingModal = (emp) => {
    setRatingModal(emp);
    setForm({ rating: "Good", score: 7, comment: "", reviewedBy: user?.name || "Admin" });
  };

  const submitRating = async () => {
    if (!form.rating || !form.score) return;
    setSaving(true);
    try {
      const updated = await addPerformanceReview(ratingModal._id, form);
      setEmployees(employees.map((e) => (e._id === ratingModal._id ? updated : e)));
      setRatingModal(null);
    } catch (err) {
      alert("Error: " + err.message);
    } finally { setSaving(false); }
  };

  const stars = (score) =>
    Array.from({ length: 10 }, (_, i) => (
      <span key={i} style={{ color: i < score ? "#f59e0b" : "#e2e8f0", fontSize: "14px" }}>★</span>
    ));

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-heading">Performance</h1>
      </div>

      {/* Summary cards (admin only) */}
      {!isEmployee && (
        <div className="stats-row">
          {RATINGS.map((r) => {
            const count = employees.filter((e) => e.performance === r).length;
            return (
              <div key={r} className="info-card" style={{ borderLeft: `4px solid ${PERF_COLOR[r]}` }}>
                <p className="info-label" style={{ color: PERF_COLOR[r] }}>{r}</p>
                <p className="info-value">{count} employees</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading-state">Loading performance data...</div>
        ) : (
          <table className="emp-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Current Rating</th>
                <th>Score</th>
                <th>Reviews</th>
                {!isEmployee && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visibleEmps.map((emp) => {
                const lastReview = emp.performanceHistory?.slice(-1)[0];
                const score = lastReview?.score || RATING_SCORES[emp.performance];
                return (
                  <React.Fragment key={emp._id}>
                    <tr style={{ cursor: "pointer" }} onClick={() => setExpandedId(expandedId === emp._id ? null : emp._id)}>
                      <td>
                        <div className="emp-name-cell">
                          <div className="emp-avatar">{emp.avatar}</div>
                          {emp.name}
                        </div>
                      </td>
                      <td><span className="dept-badge">{emp.department}</span></td>
                      <td>
                        <span className="perf-badge" style={{
                          background: PERF_COLOR[emp.performance] + "22",
                          color: PERF_COLOR[emp.performance],
                          fontWeight: "700",
                        }}>
                          {emp.performance}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div>{stars(score)}</div>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{score}/10</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px", color: "#64748b" }}>
                          {emp.performanceHistory?.length || 0} review{emp.performanceHistory?.length !== 1 ? "s" : ""}
                          {" "}<span style={{ color: "#94a3b8" }}>{expandedId === emp._id ? "▲" : "▼"}</span>
                        </span>
                      </td>
                      {!isEmployee && (
                        <td onClick={(e) => e.stopPropagation()}>
                          <button className="btn-edit" onClick={() => openRatingModal(emp)}>
                            ⭐ Rate
                          </button>
                        </td>
                      )}
                    </tr>

                    {/* Expanded history row */}
                    {expandedId === emp._id && (
                      <tr>
                        <td colSpan={isEmployee ? 5 : 6} style={{ padding: "0 16px 16px" }}>
                          <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "16px" }}>
                            <h4 style={{ margin: "0 0 12px", color: "#475569", fontSize: "13px", fontWeight: "600" }}>
                              PERFORMANCE HISTORY
                            </h4>
                            {emp.performanceHistory?.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {[...emp.performanceHistory].reverse().map((rev, i) => (
                                  <div key={i} style={{
                                    display: "flex", alignItems: "center", gap: "16px",
                                    padding: "10px 14px", background: "#fff",
                                    borderRadius: "8px", borderLeft: `3px solid ${PERF_COLOR[rev.rating]}`,
                                  }}>
                                    <span style={{ fontWeight: "700", color: PERF_COLOR[rev.rating], minWidth: "80px" }}>{rev.rating}</span>
                                    <span style={{ fontSize: "13px", color: "#64748b" }}>{rev.score}/10</span>
                                    <span style={{ fontSize: "13px", color: "#475569", flex: 1 }}>{rev.comment || "—"}</span>
                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>By {rev.reviewedBy}</span>
                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>{new Date(rev.reviewedAt).toLocaleDateString()}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>No reviews yet.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", padding: "12px", background: "#f8fafc", borderRadius: "10px" }}>
              <div className="emp-avatar" style={{ width: "44px", height: "44px", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "#fff", fontWeight: "700", borderRadius: "50%" }}>
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
                <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value, score: RATING_SCORES[e.target.value] })}>
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
                  {form.score}/10 &nbsp; {stars(form.score)}
                </div>
              </label>
              <label>
                Comment (optional)
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Add a comment about this employee's performance..."
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
