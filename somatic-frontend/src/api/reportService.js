import client from "./client";

// Backend routes live in src/routes/reportRoutes.js and are mounted at
// /api/reports in src/app.js.
export const getTestReport = async (testId) => {
  const { data } = await client.get(`/reports/tests/${testId}`);
  return data.data;
};

// Narrative "Risk Level + Recommendation" report for a single 0-100 score.
// Does not require a saved test — useful for previews and the voice
// assistant, which both just need text for the score already on screen.
export const getRiskScoreReport = async (score) => {
  const { data } = await client.get(`/reports/risk-score/${score}`);
  return data.data;
};

// One representative report per risk band (0-20, 21-40, 41-60, 61-80,
// 81-100) — a quick reference guide.
export const getRiskScoreGuide = async () => {
  const { data } = await client.get(`/reports/risk-score-guide`);
  return data.data;
};