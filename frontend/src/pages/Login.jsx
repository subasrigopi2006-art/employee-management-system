import React, { useState } from "react";
import { loginUser } from "../api/employeeApi";

const ADMIN_ACCOUNTS = {
  "magesh":     { password: "1408", name: "Magesh",     role: "admin", department: "Admin", avatar: "MK" },
  "dhanasekar": { password: "1234", name: "Dhanasekar", role: "admin", department: "Admin", avatar: "DK" },
  "subasri":    { password: "0413", name: "Subasri",    role: "admin", department: "Admin", avatar: "SB" },
};

export default function Login({ onLogin }) {
  const [panel, setPanel]       = useState("signin");
  const [tab, setTab]           = useState("admin");
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    if (tab === "admin") {
      if (!username.trim() || !password.trim()) { setMessage("Please enter username and password."); return; }
      const key = username.trim().toLowerCase();
      const adminUser = ADMIN_ACCOUNTS[key];
      if (adminUser && adminUser.password === password.trim()) {
        onLogin({ ...adminUser, email: key + "@admin.com" });
      } else {
        setMessage("Invalid username or password.");
      }
      return;
    }
    if (!email.trim() || !password.trim()) { setMessage("Please enter email and password."); return; }
    setLoading(true);
    try {
      const data = await loginUser(email.trim(), password.trim());
      if (data.user.role === "admin") {
        setMessage("This is an admin account. Please use Admin Login.");
      } else {
        onLogin(data.user);
      }
    } catch (err) {
      setMessage(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => { setTab(t); setMessage(""); setUsername(""); setEmail(""); setPassword(""); };
  const switchPanel = (p) => { setPanel(p); setMessage(""); setUsername(""); setEmail(""); setPassword(""); };

  const isSignIn = panel === "signin";

  const inputStyle = {
    width: "100%", padding: "11px 14px", marginBottom: "12px",
    border: "1.5px solid #dde3ef", borderRadius: "8px", outline: "none",
    boxSizing: "border-box", fontSize: "13px", color: "#1e293b",
    background: "#f8fafc", display: "block",
  };

  const tabBtnStyle = (t) => ({
    flex: 1, padding: "8px", border: "none", borderRadius: "7px",
    fontWeight: "700", fontSize: "12px", cursor: "pointer",
    background: tab === t ? "linear-gradient(135deg,#667eea,#764ba2)" : "transparent",
    color: tab === t ? "#fff" : "#94a3b8", transition: "all 0.2s",
  });

  const ghostBtn = {
    padding: "10px 36px", border: "2px solid #fff", borderRadius: "24px",
    background: "transparent", color: "#fff", fontWeight: "700",
    fontSize: "13px", cursor: "pointer", letterSpacing: "1px",
  };

  const submitBtn = {
    width: "100%", padding: "12px", border: "none", borderRadius: "10px",
    background: loading ? "#94a3b8" : "linear-gradient(135deg,#667eea,#764ba2)",
    color: "#fff", fontSize: "14px", fontWeight: "700",
    cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.3px",
    display: "block", boxSizing: "border-box",
  };

  const signupBtn = {
    width: "100%", padding: "12px", border: "none", borderRadius: "10px",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "#fff", fontSize: "14px", fontWeight: "700",
    cursor: "pointer", letterSpacing: "0.3px",
    display: "block", boxSizing: "border-box",
  };

  const socialIcon = (icon) => (
    <div key={icon} style={{
      width: "36px", height: "36px", borderRadius: "8px",
      border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: "12px", fontWeight: "700",
      color: "#475569", cursor: "pointer", flexShrink: 0,
    }}>{icon}</div>
  );

  return (
    <div style={{
      height: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
      background: "linear-gradient(135deg,#e8ecff 0%,#f0e8ff 50%,#e0f0ff 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Card */}
      <div style={{
        position: "relative",
        width: "820px",
        height: "520px",
        background: "#fff",
        borderRadius: "22px",
        boxShadow: "0 24px 72px rgba(102,126,234,0.18)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
      }}>

        {/* ── LEFT PANEL: Sign In form — always occupies left 50% ── */}
        <div style={{
          width: "50%",
          height: "100%",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 44px",
          boxSizing: "border-box",
          background: "#fff",
        }}>
          <div style={{ width: "100%" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", marginBottom: "4px", marginTop: 0, textAlign: "center" }}>
              Sign In
            </h2>

            <div style={{ display: "flex", gap: "8px", justifyContent: "center", margin: "12px 0 8px" }}>
              {["G+", "f", "Q", "in"].map(socialIcon)}
            </div>

            <p style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", marginBottom: "12px", marginTop: 0 }}>
              or use your email password
            </p>

            <div style={{
              display: "flex", gap: "4px", marginBottom: "12px",
              background: "#f1f5f9", padding: "4px", borderRadius: "9px",
            }}>
              <button type="button" style={tabBtnStyle("admin")}    onClick={() => switchTab("admin")}>🔑 Admin</button>
              <button type="button" style={tabBtnStyle("employee")} onClick={() => switchTab("employee")}>👤 Employee</button>
            </div>

            <form onSubmit={handleLogin} style={{ width: "100%" }}>
              {tab === "admin" ? (
                <>
                  <input type="text"     placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} autoComplete="off" />
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
                </>
              ) : (
                <>
                  <input type="email"    placeholder="Employee Email" value={email}    onChange={(e) => setEmail(e.target.value)}    style={inputStyle} />
                  <input type="password" placeholder="Password"       value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
                </>
              )}

              <p style={{ fontSize: "11px", color: "#667eea", textAlign: "right", margin: "-4px 0 12px", cursor: "pointer" }}>
                Forgot Your Password?
              </p>

              <button type="submit" disabled={loading} style={submitBtn}>
                {loading ? "Logging in…" : `Sign In as ${tab === "admin" ? "Admin" : "Employee"}`}
              </button>

              {message && (
                <p style={{ marginTop: "10px", color: "#ef4444", fontWeight: "600", fontSize: "12px", textAlign: "center" }}>
                  ⚠️ {message}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ── RIGHT PANEL: Sign Up form — always occupies right 50% ── */}
        <div style={{
          width: "50%",
          height: "100%",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 44px",
          boxSizing: "border-box",
          background: "#fff",
        }}>
          <div style={{ width: "100%" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", marginBottom: "4px", marginTop: 0, textAlign: "center" }}>
              Create Account
            </h2>

            <div style={{ display: "flex", gap: "8px", justifyContent: "center", margin: "12px 0 8px" }}>
              {["G+", "f", "Q", "in"].map(socialIcon)}
            </div>

            <p style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", marginBottom: "12px", marginTop: 0 }}>
              or use your email for registration
            </p>

            <input type="text"     placeholder="Full Name" style={inputStyle} />
            <input type="email"    placeholder="Email"     style={inputStyle} />
            <input type="password" placeholder="Password"  style={inputStyle} />

            <button type="button" style={signupBtn}>Sign Up</button>
          </div>
        </div>

        {/* ── SLIDING OVERLAY (slides over the forms) ── */}
        <div style={{
          position: "absolute",
          top: 0,
          left: isSignIn ? "50%" : "0%",
          width: "50%",
          height: "100%",
          background: "linear-gradient(135deg,#667eea 0%,#764ba2 60%,#4f46e5 100%)",
          borderRadius: isSignIn ? "0 22px 22px 0" : "22px 0 0 22px",
          transition: "left 0.6s cubic-bezier(0.77,0,0.175,1), border-radius 0.5s",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 40px",
          boxSizing: "border-box",
          textAlign: "center",
        }}>
          {isSignIn ? (
            <>
              <h2 style={{ color: "#fff", fontSize: "26px", fontWeight: "800", marginBottom: "10px", marginTop: 0 }}>
                Hello, Friend!
              </h2>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", lineHeight: "1.7", marginBottom: "28px", maxWidth: "240px" }}>
                Register with your personal details to use all of site features
              </p>
              <button type="button" style={ghostBtn} onClick={() => switchPanel("signup")}>
                SIGN UP
              </button>
            </>
          ) : (
            <>
              <h2 style={{ color: "#fff", fontSize: "26px", fontWeight: "800", marginBottom: "10px", marginTop: 0 }}>
                Welcome Back!
              </h2>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", lineHeight: "1.7", marginBottom: "28px", maxWidth: "240px" }}>
                Enter your personal details to use all of site features
              </p>
              <button type="button" style={ghostBtn} onClick={() => switchPanel("signin")}>
                SIGN IN
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}