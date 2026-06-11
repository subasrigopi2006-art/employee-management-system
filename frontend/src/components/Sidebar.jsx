import React from "react";

const adminNav = [
  { id: "dashboard",   label: "Dashboard",   icon: "⊞" },
  { id: "employees",   label: "Employees",   icon: "👥" },
  { id: "departments", label: "Departments", icon: "🏢" },
  { id: "attendance",  label: "Attendance",  icon: "📅" },
  { id: "salaries",    label: "Salaries",    icon: "💰" },
  { id: "performance", label: "Performance", icon: "📊" },
];

const employeeNav = [
  { id: "dashboard",   label: "My Profile",  icon: "👤" },
  { id: "employees",   label: "My Details",  icon: "📋" },
  { id: "attendance",  label: "Attendance",  icon: "📅" },
  { id: "salaries",    label: "My Salary",   icon: "💰" },
  { id: "performance", label: "My Performance", icon: "📊" },
];

export default function Sidebar({ active, onNav, onLogout, user }) {
  const navItems = user?.role === "employee" ? employeeNav : adminNav;

  return (
    <aside className="sidebar">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${active === item.id ? "nav-active" : ""}`}
          onClick={() => onNav(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
      <div className="sidebar-spacer" />
      <button className="nav-item logout-btn" onClick={onLogout}>
        <span className="nav-icon">🚪</span>
        <span className="nav-label">Logout</span>
      </button>
    </aside>
  );
}
