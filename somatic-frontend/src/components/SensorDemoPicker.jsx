
import React, { useState } from "react";
import { Radio, Send } from "lucide-react";
import { sendDemoSensorReading } from "../api/iotService";

const LEVELS = [
  { value: "low", label: "Low Risk" },
  { value: "medium", label: "Medium Risk" },
  { value: "high", label: "High Risk" },
  { value: "very_high", label: "Very High Risk" },
];

export default function SensorDemoPicker({ onSent }) {
  const [level, setLevel] = useState("low");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    setSending(true);
    setError("");

    try {
      await sendDemoSensorReading(level);
      setSent(true);
      onSent?.(level);
    } catch (err) {
      setError(
        err.message ||
          "Could not send the demo reading. Please try again in a moment."
      );
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    const chosen = LEVELS.find((l) => l.value === level);
    return (
      <section className="panel sensor-demo-panel sensor-demo-sent">
        <Radio size={16} />
        <span>
          Demo sensor reading (<strong>{chosen?.label}</strong>) sent.
          Waiting for the result...
        </span>
      </section>
    );
  }

  return (
    <section className="panel sensor-demo-panel">
      <div className="panel-head">
        <h2>Simulate Sensor Reading</h2>
      </div>

      <p className="muted">
        No hardware is connected to this device yet. Pick a risk level below
        to feed a sample sensor reading into this test.
      </p>

      {error && <div className="error-box">{error}</div>}

      <div className="sensor-demo-row">
        <select
          className="sensor-demo-select"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          disabled={sending}
        >
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="primary-btn inline-btn"
          onClick={send}
          disabled={sending}
        >
          <Send size={15} />
          {sending ? "Sending..." : "Send Reading"}
        </button>
      </div>
    </section>
  );
}