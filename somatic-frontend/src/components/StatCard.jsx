import React from "react";
export default function StatCard({ label, value, hint, danger }) {
  return (
    <div className={`stat-card ${danger ? "danger" : ""}`}>
      <span>{label}</span>
      <strong>{value ?? "—"}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}
