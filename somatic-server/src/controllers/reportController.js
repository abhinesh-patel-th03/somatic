const reportService = require('../services/report/reportService');
const riskScoreReportService = require('../services/report/riskScoreReportService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Get detailed test report JSON
 * @route   GET /api/reports/tests/:testId
 * @access  Private (FARMER)
 */
exports.getTestReport = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const farmerId = req.user.userId;

    const reportData = await reportService.generateTestReport(testId, farmerId);

    return successResponse(res, reportData, 'Test report generated successfully');
});

/**
 * @desc    Get the narrative risk-level + recommendation report for one
 *          0-100 risk score (does not require a saved test).
 * @route   GET /api/reports/risk-score/:score
 * @access  Private (FARMER)
 */
exports.getRiskScoreReport = asyncHandler(async (req, res) => {
    const { score } = req.params;

    const report = riskScoreReportService.generateRiskScoreReport(score);
    const speech = riskScoreReportService.toSpeechText(report);

    return successResponse(
        res,
        { ...report, speechText: speech },
        'Risk score report generated successfully'
    );
});

/**
 * @desc    Get one representative report for every risk band (0-20, 21-40,
 *          41-60, 61-80, 81-100) — a quick reference/guide.
 * @route   GET /api/reports/risk-score-guide
 * @access  Private (FARMER)
 */
exports.getRiskScoreGuide = asyncHandler(async (req, res) => {
    const guide = riskScoreReportService.generateAllRiskScoreReports();

    return successResponse(res, guide, 'Risk score guide generated successfully');
});