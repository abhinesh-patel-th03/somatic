import React from "react";
import { getReportContent, getRiskBand, getUiText } from "../data/riskReports";

export default function RiskBandReport({ score, lang }) {
  const band = getRiskBand(score);
  if (!band) return null;

  const ui = getUiText(lang);
  const content = getReportContent(lang, band.id);

  return (
    <section className={`panel risk-band risk-band--${band.id}`}>
      <div className="panel-head">
        <h2>{ui.reportTitle}</h2>
        <span className="risk-band__range">
          {ui.scoreRange}: {band.min}–{band.max}%
        </span>
      </div>

      <h3 className="risk-band__title">{content.title}</h3>

      <ol className="risk-band__list">
        {content.points.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ol>
    </section>
  );
}
