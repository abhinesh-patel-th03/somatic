import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getTestStatus } from "../api/testService";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import SensorDemoPicker from "../components/SensorDemoPicker";

export default function TestProgress() {
  const { t } = useTranslation();

  const { testId } = useParams();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let timer;

    const poll = async () => {
      try {
        const data = await getTestStatus(testId);
        setStatus(data);

        if (!["COMPLETED", "FAILED", "CANCELLED"].includes(data.status)) {
          timer = setTimeout(poll, 2000);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    poll();

    return () => clearTimeout(timer);
  }, [testId]);

  if (!status && !error) {
    return <Loading text={t("connectingTestSession")} />;
  }

  // Backend status → translation key
  const statusText = {
    OBSERVATION_COMPLETED: "waitingForDeviceTelemetry",
    WAITING_FOR_DEVICE: "waitingForSensorData",
    SENDING_TO_ML: "sendingToML",
    CALCULATING_RISK: "calculatingRisk",
    COMPLETED: "assessmentComplete",
    FAILED: "assessmentFailed",
    CANCELLED: "assessmentCancelled",
  };

  const currentStatusKey = statusText[status?.status] || "processing";

  return (
    <div className="progress-page">
      <span className="eyebrow">
        {t("test")} {testId}
      </span>

      <h1>{t(currentStatusKey)}</h1>

      <ErrorBox message={error} />

      <section className="panel progress-card">
        <div className="progress-track">
          <div
            style={{
              width: `${status?.progress || 0}%`,
            }}
          />
        </div>

        <div className="progress-number">
          {status?.progress || 0}%
        </div>

        <p>
          {t("backendState")}: <strong>{status?.status}</strong>
        </p>

        {status?.status === "COMPLETED" && (
          <Link
            className="primary-btn inline-btn"
            to={`/tests/${testId}/result`}
          >
            {t("viewResult")}
          </Link>
        )}

        {status?.status === "FAILED" && (
          <Link className="secondary-btn inline-btn" to="/dashboard">
            {t("returnToDashboard")}
          </Link>
        )}
      </section>

      {/* No hardware attached yet: let the tester feed in a synthetic
          sensor reading at the chosen risk level so the pipeline can run
          end-to-end (e.g. useful for a Render demo deployment). */}
      {status?.status === "WAITING_FOR_DEVICE" && (
        <SensorDemoPicker key={testId} />
      )}

      <div className="sensor-note">
        <strong>{t("hardwareIntegration")}</strong>
        <span>
          {t("hardwareIntegrationDescription")}{" "}
          <code>/api/iot/sensor-data</code> {t("usingTestId")}
        </span>
      </div>
    </div>
  );
}
