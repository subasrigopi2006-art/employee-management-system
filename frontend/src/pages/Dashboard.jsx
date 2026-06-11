import React, { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import PerformanceChart from "../components/PerformanceChart";
import EmployeeModal from "../components/EmployeeModal";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getStats } from "../api/employeeApi";
import { performanceData } from "../data/mockData";

export default function Dashboard({ user }) {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats]         = useState({ total: 0, avgSalary: 0, topPerformer: null, perfCounts: {} });
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp]     = useState(null);

  // If employee role: only show their own profile
  const isEmployee = user?.role === "employee";

  const loadData = async () => {
    setLoading(true);
    try {
      const [emps, s] = await Promise.all([getEmployees(), getStats()]);
      setEmployees(emps);
      setStats(s);
    } catch {
      // server offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const myProfile = isEmployee
    ? employees.find((e) => e.email === user.email)
    : null;

  const handleSave = async (emp) => {
    try {
      if (editEmp) {
        const updated = await updateEmployee(editEmp._id, emp);
        setEmployees(employees.map((e) => (e._id === editEmp._id ? updated : e)));
      } else {
        const created = await createEmployee(emp);
        setEmployees([created, ...employees]);
      }
      const s = await getStats();
      setStats(s);
      setShowModal(false);
      setEditEmp(null);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await deleteEmployee(id);
      setEmployees(employees.filter((e) => e._id !== id));
      const s = await getStats();
      setStats(s);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const livePerf = ["Excellent", "Good", "Average", "Poor"].map((label, i) => ({
    label, value: stats.perfCounts[label] || 0,
    color: ["#3b82f6", "#22c55e", "#eab308", "#ef4444"][i],
  }));

  // ── Employee view: personal profile ──────────────────────────────────────────
  if (isEmployee) {
    const emp = myProfile;
    const PERF_COLOR = { Excellent: "#22c55e", Good: "#3b82f6", Average: "#eab308", Poor: "#ef4444" };
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-heading">My Profile</h1>
        </div>
        {loading ? (
          <div className="loading-state">Loading your profile...</div>
        ) : emp ? (
          <div className="main-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="card" style={{ padding: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" }}>
                <div className="emp-avatar" style={{ width: "72px", height: "72px", fontSize: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "#fff", fontWeight: "700" }}>
                  {emp.avatar}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "22px", color: "#1e293b" }}>{emp.name}</h2>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>{emp.department}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  ["📧 Email", emp.email],
                  ["🏢 Department", emp.department],
                  ["💰 Salary", `₹${emp.salary?.toLocaleString()}`],
                  ["📊 Performance", emp.performance],
                  ["🗓️ Joined", new Date(emp.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ color: "#64748b", fontWeight: "500" }}>{label}</span>
                    <span style={{ color: label.includes("Performance") ? PERF_COLOR[value] : "#1e293b", fontWeight: "600" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: "28px" }}>
              <h2 className="card-title" style={{ marginBottom: "20px" }}>Performance History</h2>
              {emp.performanceHistory?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[...emp.performanceHistory].reverse().map((rev, i) => (
                    <div key={i} style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", borderLeft: `4px solid ${PERF_COLOR[rev.rating]}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontWeight: "700", color: PERF_COLOR[rev.rating] }}>{rev.rating}</span>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>{new Date(rev.reviewedAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>Score: {rev.score}/10</div>
                      {rev.comment && <div style={{ fontSize: "13px", color: "#475569", marginTop: "4px" }}>{rev.comment}</div>}
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>By: {rev.reviewedBy}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No performance reviews yet.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="db-error-banner">⚠️ Could not load your profile. Please try again.</div>
        )}
      </div>
    );
  }

  // ── Admin view ────────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="stats-row">
        <StatCard icon="👥" label="Total Employees" value={loading ? "…" : stats.total} color="linear-gradient(135deg,#3b82f6,#1d4ed8)" />
        <StatCard icon="🏢" label="Departments"      value="8"                            color="linear-gradient(135deg,#22c55e,#15803d)" />
        <StatCard icon="💰" label="Avg. Salary"      value={loading ? "…" : `₹${stats.avgSalary.toLocaleString()}`} color="linear-gradient(135deg,#f97316,#c2410c)" />
        <StatCard icon="⭐" label="Top Performer"    value={loading ? "…" : (stats.topPerformer?.name || "—")} color="linear-gradient(135deg,#a855f7,#7e22ce)" />
      </div>

      <div className="main-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Employee List</h2>
            <button className="btn-primary" onClick={() => { setEditEmp(null); setShowModal(true); }}>
              + Add Employee
            </button>
          </div>
          {loading ? (
            <div className="loading-state">Loading from database…</div>
          ) : (
            <table className="emp-table">
              <thead>
                <tr><th>Name</th><th>Department</th><th>Email ID</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {employees.slice(0, 8).map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="emp-name-cell">
                        <div className="emp-avatar">{emp.avatar}</div>
                        {emp.name}
                      </div>
                    </td>
                    <td><span className="dept-badge">{emp.department}</span></td>
                    <td style={{ fontSize: "13px", color: "#64748b" }}>{emp.email}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit"   onClick={() => { setEditEmp(emp); setShowModal(true); }}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(emp._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="right-panel">
          <div className="card">
            <h2 className="card-title">Performance Overview</h2>
            <PerformanceChart data={livePerf.some(d => d.value > 0) ? livePerf : performanceData} />
          </div>
        </div>
      </div>

      {showModal && (
        <EmployeeModal
          employee={editEmp}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditEmp(null); }}
        />
      )}
    </div>
  );
}
