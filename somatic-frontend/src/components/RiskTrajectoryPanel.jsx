import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { LineChart as LineChartIcon, Info } from "lucide-react";

import {
  DAYS,
  COWS,
  CLASS_AVERAGES,
  COW_OPTION_GROUPS,
} from "../data/trajectoryData";

const selectStyle = {
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 12,
  fontWeight: 600,
  color: "#1e293b",
};

export default function RiskTrajectoryPanel() {
  const [selected, setSelected] = useState("avg_all");

  const cow = useMemo(
    () => COWS.find((c) => c.id === selected) || null,
    [selected]
  );

  const chartData = useMemo(
    () =>
      DAYS.map((day, i) => {
        if (!cow) {
          return {
            day,
            low: CLASS_AVERAGES.Low[i],
            medium: CLASS_AVERAGES.Medium[i],
            high: CLASS_AVERAGES.High[i],
          };
        }
        return {
          day,
          cow: cow.trajectory[i],
          benchmark: CLASS_AVERAGES[cow.actual][i],
        };
      }),
    [cow]
  );

  return (
    <section className="panel" style={{ marginBottom: 16 }}>
      <div className="panel-head" style={{ flexWrap: "wrap" }}>
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LineChartIcon size={18} color="#2563eb" />
            20-Day Mastitis Risk Score Trajectory
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
            Historical Actual vs. Model Predicted Scores (0.0 to 1.0 Scale)
          </p>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600 }}>
          View Target:
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={selectStyle}
          >
            <option value="avg_all">All Herd Class Averages</option>
            {COW_OPTION_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.ids.map((id) => {
                  const c = COWS.find((x) => x.id === id);
                  return (
                    <option key={id} value={id}>
                      {c.name} {group.suffix(c)}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
        </label>
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={1} />
            <YAxis
              domain={[0, 1]}
              tick={{ fontSize: 11 }}
              label={{ value: "Mastitis Risk Score", angle: -90, position: "insideLeft", style: { fontSize: 11, fontWeight: 600 } }}
            />
            <Tooltip contentStyle={{ background: "#0f172a", border: 0, borderRadius: 8, color: "#fff", fontSize: 12 }} labelStyle={{ color: "#fff", fontWeight: 700 }} />
            <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />

            {!cow && (
              <>
                <Line type="monotone" dataKey="low" name="Low Risk Class Avg" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="medium" name="Medium Risk Class Avg" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="high" name="High Risk Class Avg" stroke="#ef4444" strokeWidth={2} dot={false} />
              </>
            )}

            {cow && (
              <>
                <Area type="monotone" dataKey="cow" name={`${cow.name} Actual Trajectory`} stroke="#2563eb" strokeWidth={3} fill="#2563eb" fillOpacity={0.1} dot={false} />
                <Line type="monotone" dataKey="benchmark" name={`${cow.actual} Risk Class Baseline Benchmark`} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          marginTop: 14, padding: 12, background: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: 12, display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 10, fontSize: 12, color: "#475569",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
          <Info size={15} color="#2563eb" />
          {cow
            ? `${cow.name} | Actual Tier: ${cow.actual} | Predicted Tier: ${cow.predicted} | Status: ${cow.status}`
            : "Showing average 20-day trajectories aggregated across all 25 test cows."}
        </span>
        <span
          style={{
            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap",
            background: cow && cow.status === "Misclassified" ? "#fef3c7" : "#d1fae5",
            color: cow && cow.status === "Misclassified" ? "#92400e" : "#065f46",
            border: `1px solid ${cow && cow.status === "Misclassified" ? "#fde68a" : "#a7f3d0"}`,
          }}
        >
          {!cow ? "Class Averages" : cow.status === "Correct" ? "Correctly Classified" : "Misclassified"}
        </span>
      </div>
    </section>
  );
}
