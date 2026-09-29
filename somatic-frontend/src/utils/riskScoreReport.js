/**
 * riskScoreReport.js (frontend util)
 * ---------------------------------------------------------------------------
 * The backend (riskScoreReportService.js) always returns the report text in
 * English, keyed by `band` (VERY_LOW | LOW | MODERATE | HIGH | VERY_HIGH).
 * The frontend already ships full translations for every band under the
 * "riskScoreReport" i18n namespace (see src/i18n/i18n.js), so this helper
 * swaps the English text for the translated version that matches whatever
 * language the farmer currently has selected — this is what lets the voice
 * assistant "translate" the generated report instead of always reading it
 * out in English.
 *
 * If a language is missing a translation for some reason, i18next's
 * `fallbackLng: "en"` setting means `t()` will silently return the English
 * text instead of a missing-key placeholder, so this never breaks.
 * ---------------------------------------------------------------------------
 */

/**
 * @param {object} report - the object returned by GET /reports/risk-score/:score
 * @param {function} t - the `t` function from useTranslation()
 * @returns {object} the same shape as `report`, but with report/recommendation
 *                    text swapped for the translated version
 */
export function localizeRiskScoreReport(report, t) {
  if (!report || !report.band) return report;

  const base = `riskScoreReport.${report.band}`;

  const riskLevel = t(`${base}.riskLevel`, { defaultValue: report.report?.riskLevel });
  const summary = t(`${base}.summary`, { defaultValue: report.report?.summary });
  const recommendationTitle = t(`${base}.recommendationTitle`, {
    defaultValue: report.recommendation?.title,
  });

  // i18next returns arrays fine via returnObjects, but to stay safe across
  // versions we fetch with returnObjects: true and fall back to the
  // original English array if the key isn't an array for some reason.
  const translatedActions = t(`${base}.actions`, {
    returnObjects: true,
    defaultValue: report.recommendation?.actions || [],
  });
  const actions = Array.isArray(translatedActions)
    ? translatedActions
    : report.recommendation?.actions || [];

  const clinicalNote = t(`${base}.clinicalNote`, {
    defaultValue: report.clinicalNote || "",
  });

  return {
    ...report,
    report: {
      ...report.report,
      riskLevel,
      summary,
    },
    recommendation: {
      ...report.recommendation,
      title: recommendationTitle,
      actions,
    },
    clinicalNote: clinicalNote || null,
  };
}

/**
 * Builds a single speech-ready string from a (localized) report, for the
 * VoiceAssistant component to read aloud.
 */
export function buildSpeechText(localizedReport, t) {
  if (!localizedReport) return "";

  const parts = [
    `${t("riskScoreReportGeneratedFor", { defaultValue: "Score" })} ${localizedReport.score}.`,
    `${t("riskLevel", { defaultValue: "Risk level" })}: ${localizedReport.report.riskLevel}.`,
    localizedReport.report.summary,
    `${t("recommendationTitle", { defaultValue: "Recommendation" })}: ${localizedReport.recommendation.title}.`,
    ...localizedReport.recommendation.actions,
  ];

  if (localizedReport.clinicalNote) {
    parts.push(localizedReport.clinicalNote);
  }

  return parts.filter(Boolean).join(" ");
}
