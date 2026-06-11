import React from "react";
import { departments } from "../data/mockData";

export default function Departments() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-heading">Departments</h1>
        <button className="btn-primary">+ Add Department</button>
      </div>
      <div className="dept-grid">
        {departments.map((dept) => (
          <div key={dept.id} className="dept-card">
            <div className="dept-icon">🏢</div>
            <h3 className="dept-name">{dept.name}</h3>
            <div className="dept-meta">
              <span>👤 {dept.headCount} employees</span>
              <span>Head: {dept.head}</span>
              <span>Budget: ₹{(dept.budget / 100000).toFixed(1)}L</span>
            </div>
            <div className="dept-actions">
              <button className="btn-edit">Edit</button>
              <button className="btn-delete">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
