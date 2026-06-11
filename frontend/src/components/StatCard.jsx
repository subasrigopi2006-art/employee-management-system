import React from "react";

export default function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ background: color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}
