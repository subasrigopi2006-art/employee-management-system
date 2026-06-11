import React, { useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Attendance from "./pages/Attendance";
import { Salaries } from "./pages/OtherPages";
import Performance from "./pages/Performance";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import "./styles.css";

export default function App() {
  const [screen, setScreen]     = useState("login");
  const [activePage, setActivePage] = useState("dashboard");
  const [user, setUser]         = useState(null);

  if (screen === "login") {
    return (
      <Login
        onLogin={(u) => {
          setUser(u);
          setScreen("app");
          setActivePage("dashboard");
        }}
      />
    );
  }

  if (screen === "logout") {
    return (
      <Logout
        user={user}
        onConfirmLogout={() => { setUser(null); setActivePage("dashboard"); setScreen("login"); }}
        onCancel={() => setScreen("app")}
      />
    );
  }

  const PAGES = {
    dashboard:   <Dashboard   user={user} />,
    employees:   <Employees   user={user} />,
    departments: <Departments user={user} />,
    attendance:  <Attendance  user={user} />,
    salaries:    <Salaries    user={user} />,
    performance: <Performance user={user} />,
  };

  return (
    <div className="app">
      <Topbar user={user} onLogout={() => setScreen("logout")} />
      <div className="app-body">
        <Sidebar
          active={activePage}
          onNav={setActivePage}
          onLogout={() => setScreen("logout")}
          user={user}
        />
        <main className="content">{PAGES[activePage]}</main>
      </div>
    </div>
  );
}
