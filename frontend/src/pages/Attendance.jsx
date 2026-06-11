import React, { useState, useEffect, useCallback } from "react";
import { getAttendance, markBulkAttendance } from "../api/employeeApi";

const STATUS_OPTIONS = ["Present", "Absent", "Half Day", "Leave"];

const STATUS_STYLE = {
  Present:  { bg: "#dcfce7", color: "#16a34a" },
  Absent:   { bg: "#fee2e2", color: "#dc2626" },
  "Half Day": { bg: "#fef9c3", color: "#ca8a04" },
  Leave:    { bg: "#ede9fe", color: "#7c3aed" },
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Attendance() {
  const [date, setDate]         = useState(todayStr());
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");

  const load = useCallback(async (d) => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const data = await getAttendance(d);
      setRows(data);
    } catch (err) {
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(date); }, [date, load]);

  const handleStatusChange = (employeeId, newStatus) => {
    setRows((prev) =>
      prev.map((r) =>
        r.employeeId === employeeId || r.employeeId?._id === employeeId || String(r.employeeId) === String(employeeId)
          ? { ...r, status: newStatus }
          : r
      )
    );
    setSaved(false);
  };

  const handleTimeChange = (employeeId, field, val) => {
    setRows((prev) =>
      prev.map((r) =>
        String(r.employeeId) === String(employeeId) || (r.employeeId?._id && String(r.employeeId._id) === String(employeeId))
          ? { ...r, [field]: val }
          : r
      )
    );
    setSaved(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const records = rows.map((r) => ({
        employeeId:   String(r.employeeId?._id || r.employeeId),
        employeeName: r.employeeName,
        department:   r.department,
        status:       r.status,
        checkIn:      r.checkIn  || "",
        checkOut:     r.checkOut || "",
      }));
      await markBulkAttendance(date, records);
      setSaved(true);
    } catch (err) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status) => {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
    setSaved(false);
  };

  // Summary counts
  const counts = rows.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; },
    {}
  );

  const filtered = rows.filter(
    (r) =>
      r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-heading">Attendance</h1>
        <div className="page-actions">
          <input
            type="date"
            className="search-input"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: 160 }}
          />
          <input
            className="search-input"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-primary" onClick={handleSaveAll} disabled={saving || loading}>
            {saving ? "Saving…" : "Save Attendance"}
          </button>
        </div>
      </div>

      {saved && (
        <div style={{
          background: "#dcfce7", color: "#15803d", borderRadius: 8,
          padding: "10px 16px", marginBottom: 16, fontWeight: 600,
        }}>
          ✅ Attendance saved successfully for {date}!
        </div>
      )}

      {error && (
        <div className="db-error-banner">⚠️ {error}</div>
      )}

      {/* Summary Cards */}
      {!loading && rows.length > 0 && (
        <div className="stats-row" style={{ marginBottom: 20 }}>
          {STATUS_OPTIONS.map((s) => (
            <div
              key={s}
              className="stat-card"
              style={{
                background: STATUS_STYLE[s].bg,
                color: STATUS_STYLE[s].color,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              onClick={() => markAll(s)}
              title={`Mark all as ${s}`}
            >
              <span style={{ fontSize: 28 }}>
                {s === "Present" ? "✅" : s === "Absent" ? "❌" : s === "Half Day" ? "🕐" : "📋"}
              </span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{counts[s] || 0}</div>
                <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.8 }}>{s}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Actions */}
      {!loading && rows.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: "#64748b", alignSelf: "center" }}>Mark all as:</span>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => markAll(s)}
              style={{
                padding: "5px 14px", borderRadius: 6, border: "1px solid",
                borderColor: STATUS_STYLE[s].color,
                background: STATUS_STYLE[s].bg,
                color: STATUS_STYLE[s].color,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div className="loading-state">Loading attendance data…</div>
        ) : filtered.length === 0 ? (
          <div className="loading-state">No employees found.</div>
        ) : (
          <table className="emp-table" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ width: "24%" }}>Employee</th>
                <th style={{ width: "15%" }}>Department</th>
                <th style={{ width: "18%" }}>Status</th>
                <th style={{ width: "15%" }}>Check In</th>
                <th style={{ width: "15%" }}>Check Out</th>
                <th style={{ width: "13%" }}>Hours</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const empId = String(row.employeeId?._id || row.employeeId);
                const hours = calcHours(row.checkIn, row.checkOut);
                const isPresent = row.status === "Present" || row.status === "Half Day";
                return (
                  <tr key={empId}>
                    <td>
                      <div className="emp-name-cell">
                        <div className="emp-avatar" style={{ fontSize: 13 }}>
                          {row.employeeName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        {row.employeeName}
                      </div>
                    </td>
                    <td><span className="dept-badge">{row.department}</span></td>
                    <td>
                      <select
                        value={row.status}
                        onChange={(e) => handleStatusChange(empId, e.target.value)}
                        style={{
                          padding: "4px 10px", borderRadius: 6, border: "1.5px solid",
                          borderColor: STATUS_STYLE[row.status].color,
                          background: STATUS_STYLE[row.status].bg,
                          color: STATUS_STYLE[row.status].color,
                          fontWeight: 600, fontSize: 13, cursor: "pointer", outline: "none",
                          width: "100%",
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        type="time"
                        value={row.checkIn || ""}
                        disabled={!isPresent}
                        onChange={(e) => handleTimeChange(empId, "checkIn", e.target.value)}
                        style={{
                          padding: "4px 8px", borderRadius: 6, border: "1px solid #e2e8f0",
                          fontSize: 13, width: "100%", opacity: isPresent ? 1 : 0.4,
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={row.checkOut || ""}
                        disabled={!isPresent}
                        onChange={(e) => handleTimeChange(empId, "checkOut", e.target.value)}
                        style={{
                          padding: "4px 8px", borderRadius: 6, border: "1px solid #e2e8f0",
                          fontSize: 13, width: "100%", opacity: isPresent ? 1 : 0.4,
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: 600, color: "#475569", textAlign: "center" }}>
                      {isPresent && hours ? hours : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ marginTop: 12, fontSize: 12, color: "#94a3b8", textAlign: "right" }}>
        💡 Click a summary card or bulk button to mark all employees at once
      </p>
    </div>
  );
}

function calcHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "";
  try {
    const [ih, im] = checkIn.split(":").map(Number);
    const [oh, om] = checkOut.split(":").map(Number);
    const diff = (oh * 60 + om) - (ih * 60 + im);
    if (diff <= 0) return "";
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  } catch {
    return "";
  }
}
