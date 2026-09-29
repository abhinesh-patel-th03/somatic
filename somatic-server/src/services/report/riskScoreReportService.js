/**
 * riskScoreReportService.js
 * ---------------------------------------------------------------------------
 * Generates a human-readable "Risk Level + Recommendation" report for any
 * mastitis risk score (0-100), using the 5-band scale:
 *
 *   Score   Band          Risk Level
 *   0–20    VERY_LOW      🟢 Very Low
 *   21–40   LOW           🟢 Low
 *   41–60   MODERATE      🟡 Moderate
 *   61–80   HIGH          🟠 High
 *   81–100  VERY_HIGH     🔴 Very High
 *
 * IMPORTANT — INTENTIONAL EXCLUSION:
 * The source specification for each band also lists an illustrative sample
 * sensor pattern (e.g. "EC -> elevated", "pH -> elevated", "Temp -> abnormal",
 * "Yield -> reduced/major reduction"). Those are documentation-only examples
 * of what a band *might* look like — they are NOT derived from the cow's
 * actual sensor reading. This generator deliberately does NOT reproduce those
 * example patterns anywhere in its output. The report text below is built
 * strictly from the real, computed `score` that is passed in, never from a
 * hard-coded example. This keeps the report accurate for every cow instead
 * of implying every cow in a band shows those exact example values.
 *
 * This module has no dependencies on the rest of the risk engine so it can be
 * unit-tested and reused anywhere a raw 0-100 score needs to become a report
 * (test reports, the risk-score guide endpoint, the voice assistant, etc.).
 * ---------------------------------------------------------------------------
 */

const BANDS = [
  {
    key: 'VERY_LOW',
    min: 0,
    max: 20,
    emoji: '🟢',
    riskLevel: 'VERY LOW',
    summary:
      "The current milk parameters show no significant abnormal deviation from the expected udder-health profile. The cow is currently showing a low level of mastitis-associated risk based on the available sensor measurements.",
    recommendationTitle: 'Routine monitoring',
    actions: [
      'Continue normal milking.',
      'Maintain normal hygiene.',
      "Record this measurement as part of the cow's history.",
      'Compare future readings with this baseline.',
    ],
    clinicalNote: null,
  },
  {
    key: 'LOW',
    min: 21,
    max: 40,
    emoji: '🟢',
    riskLevel: 'LOW',
    summary:
      'A minor deviation has been detected in one or more milk parameters. The current pattern does not provide strong evidence of udder-health deterioration, but continued monitoring is recommended.',
    recommendationTitle: 'Monitor',
    actions: [
      'Repeat measurement at the next milking.',
      "Compare EC with the cow's historical EC.",
      "Compare yield with the cow's normal yield.",
      'Watch whether the abnormality persists.',
    ],
    clinicalNote:
      'EC can shift with lactation stage, parity and environmental conditions, so it should always be read against the animal\'s own baseline rather than as a standalone indicator.',
  },
  {
    key: 'MODERATE',
    min: 41,
    max: 60,
    emoji: '🟡',
    riskLevel: 'MODERATE',
    summary:
      'Multiple milk parameters show deviations from the cow\'s expected profile. The observed pattern may indicate early udder-health deterioration and should be monitored through repeated measurements.',
    recommendationTitle: 'Repeat + Monitor',
    actions: [
      'Repeat the measurement.',
      "Compare EC with the animal's baseline.",
      'Compare milk yield against previous milking/day averages.',
      'Check whether the pH deviation persists.',
      'Monitor temperature for a persistent change.',
    ],
    clinicalNote:
      'EC-based screening is imperfect on its own, so a Moderate score should never be treated as a confirmed mastitis diagnosis by itself.',
  },
  {
    key: 'HIGH',
    min: 61,
    max: 80,
    emoji: '🟠',
    riskLevel: 'HIGH',
    summary:
      'Multiple milk parameters are substantially different from the cow\'s expected profile. The combination of elevated electrical conductivity, abnormal pH, temperature deviation and reduced milk production indicates a high level of mastitis-associated risk.',
    recommendationTitle: 'Investigate',
    actions: [
      'Repeat the measurement.',
      'Examine the cow and udder.',
      'Check for abnormal milk appearance.',
      'Compare the affected cow with its historical measurements.',
      'If the abnormality persists, veterinary examination is recommended.',
    ],
    clinicalNote: null,
  },
  {
    key: 'VERY_HIGH',
    min: 81,
    max: 100,
    emoji: '🔴',
    riskLevel: 'VERY HIGH',
    summary:
      'The cow exhibits substantial simultaneous deviations in electrical conductivity, milk pH, milk temperature and milk production. This sensor pattern is strongly associated with an elevated risk of udder-health problems and requires prompt investigation.',
    recommendationTitle: 'Immediate assessment',
    actions: [
      'Repeat measurement to rule out sensor error.',
      'Physically inspect the cow and udder.',
      'Check milk for visible abnormalities.',
      'Compare against historical cow data.',
      'Seek veterinary assessment if abnormal readings persist or clinical signs are observed.',
    ],
    clinicalNote:
      'This app must never automatically prescribe treatment. Very High only means "seek prompt veterinary assessment", not a confirmed diagnosis.',
  },
];

/**
 * Finds the band a given (already clamped/rounded) score falls into.
 * Falls back to the last band so an out-of-range score never crashes.
 */
function findBand(score) {
  return (
    BANDS.find((band) => score >= band.min && score <= band.max) ||
    BANDS[BANDS.length - 1]
  );
}

/**
 * Generates the full report + recommendation for one risk score.
 *
 * @param {number|string} rawScore - a 0-100 mastitis risk score
 * @returns {object} report
 */
function generateRiskScoreReport(rawScore) {
  const numericScore = Number(rawScore);

  if (!Number.isFinite(numericScore)) {
    const error = new Error(`Invalid risk score: ${rawScore}`);
    error.statusCode = 400;
    throw error;
  }

  // Defensive clamping so a bad upstream value (e.g. -5 or 137) can never
  // throw, produce an undefined band, or silently render a blank report.
  const rounded = Math.round(numericScore);
  const clampedScore = Math.max(0, Math.min(100, rounded));

  const band = findBand(clampedScore);

  return {
    score: clampedScore,
    scoreWasClamped: clampedScore !== rounded,
    band: band.key,
    emoji: band.emoji,
    report: {
      riskLevel: band.riskLevel,
      summary: band.summary,
    },
    recommendation: {
      title: band.recommendationTitle,
      actions: band.actions,
    },
    clinicalNote: band.clinicalNote,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Returns one representative report for every band — useful for an
 * at-a-glance "risk score guide" screen, documentation, or QA.
 */
function generateAllRiskScoreReports() {
  return BANDS.map((band) =>
    generateRiskScoreReport(Math.round((band.min + band.max) / 2))
  );
}

/**
 * Builds a single plain-text version of a report, suitable for
 * text-to-speech (the voice assistant) or for copying into a message.
 */
function toSpeechText(reportOrScore) {
  const report =
    typeof reportOrScore === 'object'
      ? reportOrScore
      : generateRiskScoreReport(reportOrScore);

  const lines = [
    `Risk score ${report.score} out of 100.`,
    `Risk level: ${report.report.riskLevel}.`,
    report.report.summary,
    `Recommendation: ${report.recommendation.title}.`,
    ...report.recommendation.actions,
  ];

  if (report.clinicalNote) {
    lines.push(report.clinicalNote);
  }

  return lines.join(' ');
}

module.exports = {
  BANDS,
  generateRiskScoreReport,
  generateAllRiskScoreReports,
  toSpeechText,
};
