import React from "react";
import { useTranslation } from "react-i18next";

import VoiceAssistant from "./VoiceAssistant";
import { localizeRiskScoreReport, buildSpeechText } from "../utils/riskScoreReport";

/**
 * RiskScoreReportPanel
 * ---------------------------------------------------------------------------
 * Renders the narrative "Risk Level + Recommendation" report for a single
 * 0-100 risk score (fetched from GET /api/reports/risk-score/:score), plus a
 * VoiceAssistant button that reads it aloud in Indian English (or the
 * farmer's selected Indian language).
 *
 * By design this only ever shows the score-derived Risk Level, its
 * description, and the Recommendation checklist. It never renders the
 * illustrative "EC -> elevated / pH -> elevated / Temp -> abnormal /
 * Yield -> reduced" example patterns from the source specification, because
 * those are documentation-only examples, not this cow's actual data.
 * ---------------------------------------------------------------------------
 */
export default function RiskScoreReportPanel({ report, loading, error }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <section className="panel risk-score-report-panel">
        <div className="panel-head">
          <h2>{t("riskScoreReportTitle")}</h2>
        </div>
        <p className="muted">…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel risk-score-report-panel">
        <div className="panel-head">
          <h2>{t("riskScoreReportTitle")}</h2>
        </div>
        <p className="muted">{error}</p>
      </section>
    );
  }

  if (!report) return null;

  const localized = localizeRiskScoreReport(report, t);
  const speechText = buildSpeechText(localized, t);

  return (
    <section className={`panel risk-score-report-panel risk-${String(localized.band).toLowerCase()}`}>
      <div className="panel-head">
        <h2>
          {localized.emoji} {t("riskScoreReportTitle")}
        </h2>

        <VoiceAssistant text={speechText} disabled={!speechText} />
      </div>

      <p className="risk-score-report-meta muted">
        {t("riskScoreReportGeneratedFor")} {localized.score}/100
      </p>

      <p>
        <strong>{t("riskLevel")}:</strong> {localized.report.riskLevel}
      </p>

      <p>{localized.report.summary}</p>

      <div className="risk-score-recommendation">
        <strong>
          {t("recommendationTitle")}: {localized.recommendation.title}
        </strong>

        <ul className="clean-list">
          {(localized.recommendation.actions || []).map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ul>
      </div>

      {localized.clinicalNote && (
        <p className="muted risk-score-clinical-note">
          <em>
            {t("clinicalNote")}: {localized.clinicalNote}
          </em>
        </p>
      )}
    </section>
  );
}
