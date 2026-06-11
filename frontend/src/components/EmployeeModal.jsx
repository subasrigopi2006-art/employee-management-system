import React, { useState, useEffect } from "react";

const DEPTS = ["HR", "IT", "Finance", "Marketing", "Operations", "Legal", "R&D", "Support"];
const PERF  = ["Excellent", "Good", "Average", "Poor"];

export default function EmployeeModal({ employee, onSave, onClose }) {
  const [form, setForm] = useState({
    name: "", email: "", department: "HR", salary: "", performance: "Good", password: "",
  });

  useEffect(() => {
    if (employee) setForm({ ...employee, password: employee.password || "" });
  }, [employee]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = () => {
    if (!form.name || !form.email || !form.salary) {
      alert("Name, email, and salary are required.");
      return;
    }
    onSave({
      ...form,
      salary: Number(form.salary),
      avatar: form.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{employee ? "Edit Employee" : "Add Employee"}</h2>
        <div className="modal-fields">
          <label>
            Name
            <input name="name" value={form.name} onChange={handle} placeholder="Full Name" />
          </label>
          <label>
            Email ID
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="email@company.com" />
          </label>
          <label>
            Department
            <select name="department" value={form.department} onChange={handle}>
              {DEPTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label>
            Salary (₹)
            <input name="salary" type="number" value={form.salary} onChange={handle} placeholder="65000" />
          </label>
          <label>
            Performance
            <select name="performance" value={form.performance} onChange={handle}>
              {PERF.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label>
            Password {employee ? "(leave blank to keep)" : ""}
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="Set login password" />
          </label>
        </div>
        <div className="modal-actions">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}>
            {employee ? "Save Changes" : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}
