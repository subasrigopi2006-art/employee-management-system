import React, { useState, useEffect, useCallback } from "react";
import EmployeeModal from "../components/EmployeeModal";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../api/employeeApi";

const PERF_COLOR = { Excellent: "#22c55e", Good: "#3b82f6", Average: "#eab308", Poor: "#ef4444" };

export default function Employees({ user }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp]     = useState(null);
  const [search, setSearch]       = useState("");
  const [searchTimer, setSearchTimer] = useState(null);

  const isEmployee = user?.role === "employee";

  const fetchEmployees = useCallback(async (q = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployees(q);
      setEmployees(data);
    } catch {
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => fetchEmployees(val), 400));
  };

  const handleSave = async (emp) => {
    try {
      if (editEmp) {
        const updated = await updateEmployee(editEmp._id, emp);
        setEmployees(employees.map((e) => (e._id === editEmp._id ? updated : e)));
      } else {
        const created = await createEmployee(emp);
        setEmployees([created, ...employees]);
      }
      setShowModal(false);
      setEditEmp(null);
    } catch (err) {
      alert("Error saving employee: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await deleteEmployee(id);
      setEmployees(employees.filter((e) => e._id !== id));
    } catch (err) {
      alert("Error deleting employee: " + err.message);
    }
  };

  // Employee role: only see their own record
  const visibleEmployees = isEmployee
    ? employees.filter((e) => e.email === user.email)
    : employees;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-heading">Employees</h1>
        <div className="page-actions">
          {!isEmployee && (
            <>
              <input
                className="search-input"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button className="btn-primary" onClick={() => { setEditEmp(null); setShowModal(true); }}>
                + Add Employee
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="db-error-banner">⚠️ {error}</div>}

      <div className="card">
        {loading ? (
          <div className="loading-state">Loading employees from database...</div>
        ) : (
          <table className="emp-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email ID</th>
                <th>Department</th>
                <th>Performance</th>
                {!isEmployee && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visibleEmployees.length === 0 ? (
                <tr><td colSpan="5" className="empty-state">No employees found.</td></tr>
              ) : (
                visibleEmployees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="emp-name-cell">
                        <div className="emp-avatar">{emp.avatar}</div>
                        {emp.name}
                      </div>
                    </td>
                    <td style={{ fontSize: "13px", color: "#64748b" }}>{emp.email}</td>
                    <td><span className="dept-badge">{emp.department}</span></td>
                    <td>
                      <span className="perf-badge" style={{
                        background: PERF_COLOR[emp.performance] + "22",
                        color: PERF_COLOR[emp.performance],
                      }}>
                        {emp.performance}
                      </span>
                    </td>
                    {!isEmployee && (
                      <td>
                        <div className="action-btns">
                          <button className="btn-edit" onClick={() => { setEditEmp(emp); setShowModal(true); }}>Edit</button>
                          <button className="btn-delete" onClick={() => handleDelete(emp._id)}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
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
