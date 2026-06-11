import React from "react";

export default function Logout({ user, onConfirmLogout, onCancel }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "15px",
          textAlign: "center",
          width: "350px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontSize: "60px" }}>🚪</div>

        <h2 style={{ marginTop: "10px", color: "#333" }}>
          Logout
        </h2>

        <p style={{ color: "#666", margin: "15px 0" }}>
          Are you sure you want to logout,
          <br />
          <b>{user?.name || "Admin"}</b> ?
        </p>

        <button
          onClick={onConfirmLogout}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            border: "none",
            borderRadius: "8px",
            background: "#e53935",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>

        <button
          onClick={onCancel}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: "#4caf50",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}