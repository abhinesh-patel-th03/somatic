import React from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getTestResult } from "../api/testService";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import RiskBandReport from "../components/RiskBandReport";
import VoiceAssistant from "../components/VoiceAssistant";
import { normalizeLang } from "../i18n/languages";
import { buildSpeechChunks, getRiskBand, getUiText } from "../data/riskReports";

export default function TestResult() {
  const { t, i18n } = useTranslation();
  const { testId } = useParams();

  // The language chosen on the login page drives the report AND the voice.
  const lang = normalizeLang(i18n.language);
  const ui = getUiText(lang);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTestResult(testId)
      .then(setResult)
      .catch((err) => setError(err.message));
  }, [testId]);

  if (!result && !error) {
    return <Loading text={t("loadingAssessmentResult")} />;
  }

  if (error) {
    return (
      <>
        <ErrorBox message={error} />

        <Link
          className="secondary-btn inline-btn"
          to="/dashboard"
        >
          <ArrowLeft size={16} />
          {t("dashboard")}
        </Link>
      </>
    );
  }

  const riskClass = String(
    result.risk?.level || "HIGH"
  ).toLowerCase();

  const getRiskLabel = (level) => {
    const normalized = String(level || "HIGH").toUpperCase();

    const riskTranslations = {
      LOW: "riskLow",
      MEDIUM: "riskMedium",
      HIGH: "riskHigh",
      CRITICAL: "riskCritical",
    };

    return t(riskTranslations[normalized] || "High");
  };

  const getTrendLabel = (trend) => {
    if (!trend) return "—";

    const trendTranslations = {
      IMPROVING: "trendImproving",
      STABLE: "trendStable",
      WORSENING: "trendWorsening",
      DECLINING: "trendWorsening",
    };

    const key = trendTranslations[String(trend).toUpperCase()];

    return key ? t(key) : trend;
  };

  // ---- score -> report band -> what the assistant says ----
  const score = Number(result.risk?.percentage ?? result.risk?.score ?? 0);
  const band = getRiskBand(score);

  const speechChunks = band
    ? buildSpeechChunks({
        lang,
        cowName: result.cow?.name,
        score,
        bandId: band.id,
        sensors: {
          ph: result.sensors?.ph?.value,
          temperature: result.sensors?.temperature?.value,
          conductivity: result.sensors?.conductivity?.value,
        },
      })
    : [];

  return (
    <>
      {/* ================= HEADER ================= */}

      <div className="result-header">
        <div>
          <span className="eyebrow">
            {t("assessmentResult")}
          </span>

          <h1>
            {result.cow?.name || t("cow")} · {testId}
          </h1>
        </div>

        <Link
          className="secondary-btn inline-btn"
          to="/dashboard"
        >
          <ArrowLeft size={16} />
          {t("dashboard")}
        </Link>
      </div>

      {/* ================= RISK SUMMARY ================= */}

      <section className={`result-hero ${riskClass}`}>
        <div>
          <span>{t("finalRiskScore")}</span>

          <strong>
            {result.risk?.percentage ??
              result.risk?.score ??
              0}
            %
          </strong>
        </div>

        <div>
          <span>{t("riskLevel")}</span>

          <strong>
            {getRiskLabel(result.risk?.level)}
          </strong>
        </div>

        <div>
          <span>{t("trend")}</span>

          <strong>
            {getTrendLabel(result.risk?.trend)}
          </strong>
        </div>
      </section>

      {/* ================= RISK SCORE REPORT (by score band) ================= */}

      <RiskBandReport score={score} lang={lang} />

      {/* ================= SENSOR + AI ================= */}

      <div className="content-grid">

        {/* SENSOR MEASUREMENTS */}

        <section className="panel">
          <div className="panel-head">
            <h2>{t("sensorMeasurements")}</h2>
          </div>

          <div className="measurement-grid">

            <Metric
              label="pH"
              value={
                result.sensors?.ph?.value ?? "—"
              }
              status={
                result.sensors?.ph?.status
              }
            />

            <Metric
              label={t("temperature")}
              value={
                result.sensors?.temperature?.value ?? "—"
              }
              suffix="°C"
              status={
                result.sensors?.temperature?.status
              }
            />

            <Metric
              label={t("conductivity")}
              value={
                result.sensors?.conductivity?.value ?? "—"
              }
              suffix=" mS"
              status={
                result.sensors?.conductivity?.status
              }
            />

          </div>
        </section>

        {/* AI ANALYSIS */}


      </div>

      {/* ================= FACTORS + ACTIONS ================= */}

      <div className="content-grid">

        

        {/* RECOMMENDED ACTIONS */}

        <section className="panel">

          <div className="panel-head">
            <h2>{t("recommendedActions")}</h2>
          </div>

          <ul className="clean-list">

            {(result.recommendedActions || []).map(
              (action, index) => (
                <li key={index}>

                  <strong>
                    {action.title}
                  </strong>

                  <p>
                    {action.description}
                  </p>

                  <small>
                    {action.reason}
                  </small>

                  <div>
                    <small>
                      {t("priority")}: {action.priority}
                    </small>
                  </div>

                </li>
              )
            )}

          </ul>

        </section>

      </div>

      {/* ================= DISCLAIMER ================= */}

      <section className="panel disclaimer">

        <strong>
          {ui.disclaimerTitle}
        </strong>

        <p>
          {ui.disclaimer}
        </p>

      </section>

      {/* ================= REPORT ================= */}

      <p className="muted report-note">

        <FileText size={15} />

        {t("reportEndpointNote")}{" "}

        <code>
          reportService.js
        </code>

        ; {t("mount")}{" "}

        <code>
          /api/reports
        </code>

        {" "}{t("beforeUsingIt")}

      </p>

      {/* keeps the last section from hiding behind the floating assistant */}
      <div className="va-spacer" />

      {/* ================= FLOATING VOICE ASSISTANT (bottom-left) ================= */}

      <VoiceAssistant chunks={speechChunks} />
    </>
  );
}

/* ================================================= */
/* METRIC COMPONENT                                  */
/* ================================================= */

function Metric({
  label,
  value,
  suffix,
  status
}) {
  return (
    <div className="metric">

      <span>
        {label}
      </span>

      <strong>
        {value}
        {suffix}
      </strong>

      <small>
        {status || "—"}
      </small>

    </div>
  );
}
