const testService = require('../services/testService');
const Test = require('../models/Test');
const riskEngine = require('../services/risk/riskEngine');
const { generateRecommendations } = require('../services/risk/recommendationEngine');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');


// ============================================================
// START TEST
// ============================================================

const startTest = asyncHandler(async (req, res) => {

  const { cowId } = req.body;

  const test = await testService.startTest(
    req.user.userId,
    cowId
  );

  return sendSuccess(res, { test }, 201);
});


// ============================================================
// GET TEST STATUS
// ============================================================

const getTestStatus = asyncHandler(async (req, res) => {

  const statusData = await testService.getTestProgress(
    req.params.testId,
    req.user.userId
  );

  return sendSuccess(res, statusData);
});


// ============================================================
// SUBMIT FARMER OBSERVATIONS
// ============================================================

const submitObservations = asyncHandler(async (req, res) => {

  const { answers } = req.body;

  const test = await testService.submitObservations(
    req.params.testId,
    req.user.userId,
    answers
  );

  return sendSuccess(res, { test });
});


// ============================================================
// START SENSOR TEST
// ============================================================

const startSensorTest = asyncHandler(async (req, res) => {

  const test = await testService.readyForDevice(
    req.params.testId,
    req.user.userId
  );

  return sendSuccess(res, { test });
});


// ============================================================
// GET FINAL TEST RESULT
// ============================================================

const getTestResult = asyncHandler(async (req, res) => {

  // ----------------------------------------------------------
  // 1. FETCH TEST
  // ----------------------------------------------------------

  const test = await Test.findOne({
    testId: req.params.testId,
    farmerId: req.user.userId
  }).populate(
    'cowId',
    'name cowId breed age penNumber'
  );


  if (!test) {

    throw new ApiError(
      'Test not found',
      404,
      'TEST_NOT_FOUND'
    );
  }


  if (test.status !== 'COMPLETED') {

    throw new ApiError(
      'Test is not yet completed',
      400,
      'TEST_INCOMPLETE'
    );
  }


  // ----------------------------------------------------------
  // 2. RECALCULATE RISK BREAKDOWN
  // ----------------------------------------------------------

  /*
   * IMPORTANT:
   *
   * Final risk consists of ONLY THREE components:
   *
   * ML calibrated SCC     × 0.33
   * CMT score              × 0.33
   * Farmer questions       × 0.33
   *
   * Sensors are NOT independently scored.
   */

  const riskProfile =
    riskEngine.calculateFinalRisk(test);


  // ----------------------------------------------------------
  // 3. RAW SENSOR VALUES
  // ----------------------------------------------------------

  /*
   * pH, temperature and conductivity are ML INPUTS.
   *
   * They are displayed here for transparency.
   * They are NOT independently converted into risk scores.
   */

  const sensorData = test.sensorData || {};


  const ph =
    sensorData.ph ?? null;

  const temperature =
    sensorData.temperature ?? null;

  const conductivity =
    sensorData.conductivity ?? null;


  // ----------------------------------------------------------
  // 4. FARMER OBSERVATIONS
  // ----------------------------------------------------------

  const observations =
    test.observations || {};

  const positiveFlags =
    observations.positiveFlags || 0;


  // ----------------------------------------------------------
  // 5. CONTRIBUTING FACTORS
  // ----------------------------------------------------------

  const contributingFactors = [];


  // Farmer observations

  if (positiveFlags > 0) {

    contributingFactors.push(
      `${positiveFlags} abnormal physical observation(s) flagged`
    );
  }


  // ML component

  const mlComponent =
    riskProfile.components.ml;


  if (test.mlResult?.prediction !== undefined) {

    contributingFactors.push(
      `AI model calibrated severity score: ${(
        mlComponent.calibratedSCC * 100
      ).toFixed(1)}%`
    );
  }


  // CMT component

  const cmtScore =
    test.cmtData?.score ?? 0;


  if (cmtScore > 0) {

    contributingFactors.push(
      `CMT score contributed ${(cmtScore * 100).toFixed(1)}%`
    );
  }


  // ----------------------------------------------------------
  // 6. RECOMMENDATIONS
  // ----------------------------------------------------------

  /*
   * Sensor factors are intentionally NOT passed here.
   *
   * The new architecture does not independently score
   * pH, temperature or conductivity.
   */

  const recommendedActions =
    generateRecommendations(
      test.riskResult.level,
      [],
      positiveFlags
    );


  // ----------------------------------------------------------
  // 7. ML DATA
  // ----------------------------------------------------------

  const mlData = {

    // Raw regression output from ML model
    rawPrediction:
      test.mlResult?.prediction ?? null,

    // Normalized 0–1 severity
    calibratedSCC:
      mlComponent.calibratedSCC,

    // 0–1 weighted contribution
    contribution:
      mlComponent.contribution,

    // Contribution expressed as percentage points
    contributionPoints:
      mlComponent.contributionPoints,

    // Kept for frontend compatibility
    probability:
      test.mlResult?.probability ?? 0,

    confidence:
      test.mlResult?.confidence ?? 0,

    modelVersion:
      test.modelVersion
  };


  // ----------------------------------------------------------
  // 8. RETURN MASTER RESPONSE
  // ----------------------------------------------------------

  return sendSuccess(res, {

    testId:
      test.testId,

    timestamp:
      test.completedAt,

    cow:
      test.cowId,


    // ========================================================
    // FINAL RISK
    // ========================================================

    risk: {

      score:
        test.riskResult.score,

      percentage:
        test.riskResult.score,

      level:
        test.riskResult.level,

      trend:
        test.riskResult.trend || 'STABLE'
    },


    // ========================================================
    // FARMER OBSERVATIONS
    // ========================================================

    observations:
      observations,


    // ========================================================
    // SENSOR MEASUREMENTS
    // ========================================================

    /*
     * IMPORTANT:
     *
     * Keep the "value" structure because your existing
     * frontend appears to expect:
     *
     * sensors.ph.value
     * sensors.temperature.value
     * sensors.conductivity.value
     */

    sensors: {

      ph: {
        value: ph
      },

      temperature: {
        value: temperature
      },

      conductivity: {
        value: conductivity
      }
    },


    // ========================================================
    // CMT
    // ========================================================

    cmt:
      test.cmtData || {
        score: 0
      },


    // ========================================================
    // ML ANALYSIS
    // ========================================================

    ml:
      mlData,


    // ========================================================
    // COMPLETE RISK BREAKDOWN
    // ========================================================

    riskComponents:
      riskProfile.components,


    // ========================================================
    // EXPLANATIONS
    // ========================================================

    contributingFactors,


    // ========================================================
    // RECOMMENDED ACTIONS
    // ========================================================

    recommendedActions,


    // ========================================================
    // DISCLAIMER
    // ========================================================

    disclaimer:
      'This system provides a risk assessment based on sensor data, machine learning, CMT results and farmer observations. It does not replace a definitive veterinary diagnosis.'
  });
});


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

  startTest,

  getTestStatus,

  submitObservations,

  startSensorTest,

  getTestResult
};