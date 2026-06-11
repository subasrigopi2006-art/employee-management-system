import React from "react";

export default function Topbar({ user, onLogout }) {
  const initials = user?.email ? user.email[0].toUpperCase() : "A";
  const displayName = user?.email ? user.email.split("@")[0] : "Admin";

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="brand-icon">🏢</div>
        <span className="brand-title">Employee Management System</span>
      </div>
      <div className="topbar-admin" onClick={onLogout} title="Click to logout">
        <div className="admin-avatar">
          <span>{initials}</span>
        </div>
        <span className="admin-name">{displayName}</span>
        <span className="admin-caret">▾</span>
      </div>
    </header>
  );
}
