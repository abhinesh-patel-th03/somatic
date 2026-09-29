const riskConfig = require('../../config/riskConfig');
const { logStage } = require('../../utils/logger');


// ============================================================
// ML SCC CALIBRATION
// ============================================================

function calibrateMLPrediction(rawPrediction) {

  const x = Number(rawPrediction);

  if (!Number.isFinite(x)) {
    throw new Error(
      `Invalid ML prediction: ${rawPrediction}`
    );
  }

  const points = riskConfig.mlCalibration.points;

  if (!Array.isArray(points) || points.length < 2) {
    throw new Error(
      'ML calibration points are not configured correctly'
    );
  }

  // Below minimum calibration value
  if (x <= points[0].value) {
    return points[0].score;
  }

  // Above maximum calibration value
  if (x >= points[points.length - 1].value) {
    return points[points.length - 1].score;
  }

  // Linear interpolation
  for (let i = 0; i < points.length - 1; i++) {

    const x1 = points[i].value;
    const y1 = points[i].score;

    const x2 = points[i + 1].value;
    const y2 = points[i + 1].score;

    if (x >= x1 && x <= x2) {

      const score =
        y1 +
        ((x - x1) * (y2 - y1)) /
        (x2 - x1);

      return Number(
        Math.max(
          0,
          Math.min(1, score)
        ).toFixed(4)
      );
    }
  }

  return 1;
}


// ============================================================
// DYNAMIC ML WEIGHT
// ============================================================

function getDynamicMLWeight(positiveQuestions) {

  /*
   * ONLY THREE CASES:
   *
   * 0 YES → ML = 80%
   * 1 YES → ML = 60%
   * 2+ YES → ML = 33%
   */

  if (positiveQuestions === 0) {
    return 0.80;
  }

  if (positiveQuestions === 1) {
    return 0.60;
  }

  return 0.33;
}


// ============================================================
// ML COMPONENT
// ============================================================

function calculateMLComponent(
  test,
  positiveQuestions
) {

  if (
    !test.mlResult ||
    test.mlResult.prediction === undefined ||
    test.mlResult.prediction === null
  ) {

    throw new Error(
      'ML prediction is missing'
    );
  }

  const rawPrediction =
    Number(test.mlResult.prediction);

  if (!Number.isFinite(rawPrediction)) {

    throw new Error(
      `Invalid ML prediction: ${test.mlResult.prediction}`
    );
  }

  // Raw ML prediction → calibrated 0–1
  const calibratedSCC =
    calibrateMLPrediction(rawPrediction);

  // Dynamic ML weight
  const weight =
    getDynamicMLWeight(
      positiveQuestions
    );

  // ML contribution
  const contribution =
    calibratedSCC * weight;

  return {

    rawPrediction,

    calibratedSCC,

    weight,

    contribution,

    contributionPoints:
      contribution * 100
  };
}


// ============================================================
// FARMER QUESTION COMPONENT
// ============================================================

function calculateFarmerQuestionComponent(test) {

  const answers =
    test.observations?.answers || [];

  const questionWeights =
    riskConfig.farmerQuestions.questionWeights;

  if (!Array.isArray(questionWeights)) {

    throw new Error(
      'Farmer question weights are not configured correctly'
    );
  }

  if (questionWeights.length !== 4) {

    throw new Error(
      'Exactly 4 farmer question weights are required'
    );
  }

  let farmerScore = 0;

  let positiveQuestions = 0;

  const questionDetails = [];


  // ==========================================================
  // PROCESS 4 QUESTIONS
  // ==========================================================

  for (let i = 0; i < 4; i++) {

    const answer =
      answers[i];

    let questionScore =
      Number(answer?.score ?? 0);

    // Normalize score to 0–1
    questionScore =
      Math.max(
        0,
        Math.min(
          1,
          questionScore
        )
      );

    // Count YES answers
    if (questionScore > 0) {
      positiveQuestions++;
    }

    const weight =
      questionWeights[i];

    const contribution =
      questionScore * weight;

    farmerScore += contribution;

    questionDetails.push({

      question:
        i + 1,

      score:
        questionScore,

      weight,

      contribution
    });
  }


  // Normalize farmer score
  farmerScore =
    Math.max(
      0,
      Math.min(
        1,
        farmerScore
      )
    );


  // ==========================================================
  // FARMER BASE RISK
  // ==========================================================

  let baseRisk = 0;

  let vetRecommendation = false;

  let riskMessage = '';


  switch (positiveQuestions) {

    // --------------------------------------------------------
    // 0 YES
    // --------------------------------------------------------

    case 0:

      baseRisk = 0;

      riskMessage =
        'No abnormal farmer observations reported.';

      break;


    // --------------------------------------------------------
    // 1 YES
    // --------------------------------------------------------

    case 1:

      baseRisk = 30;

      riskMessage =
        'One abnormal farmer observation reported.';

      break;


    // --------------------------------------------------------
    // 2 YES
    // --------------------------------------------------------

    case 2:

      baseRisk = 65;

      vetRecommendation = true;

      riskMessage =
        'Two abnormal farmer observations reported. Consider calling a veterinarian.';

      break;


    // --------------------------------------------------------
    // 3 YES
    // --------------------------------------------------------

    case 3:

      baseRisk = 75;

      vetRecommendation = true;

      riskMessage =
        'Three abnormal farmer observations reported. Consider calling a veterinarian.';

      break;


    // --------------------------------------------------------
    // 4 YES
    // --------------------------------------------------------

    case 4:

      baseRisk = 75;

      vetRecommendation = true;

      riskMessage =
        'All four abnormal farmer observations reported. Consider calling a veterinarian.';

      break;
  }


  return {

    score:
      Number(
        farmerScore.toFixed(4)
      ),

    positiveQuestions,

    baseRisk,

    vetRecommendation,

    riskMessage,

    questions:
      questionDetails
  };
}


// ============================================================
// CMT COMPONENT
// ============================================================

function calculateCMTComponent(test) {

  let cmtScore =
    Number(
      test.cmtData?.score ?? 0
    );

  // Normalize CMT score
  cmtScore =
    Math.max(
      0,
      Math.min(
        1,
        cmtScore
      )
    );

  const weight =
    riskConfig.weights.cmt;

  const contribution =
    cmtScore * weight;

  return {

    score:
      cmtScore,

    weight,

    contribution,

    contributionPoints:
      contribution * 100
  };
}


// ============================================================
// FINAL RISK CALCULATION
// ============================================================

function calculateFinalRisk(test) {

  logStage(
    'RISK_CALCULATION_STARTED',
    {
      testId: test.testId
    }
  );


  // ==========================================================
  // 1. FARMER QUESTIONS
  // ==========================================================

  const farmerQuestions =
    calculateFarmerQuestionComponent(test);

  const positiveQuestions =
    farmerQuestions.positiveQuestions;


  // ==========================================================
  // 2. ML
  // ==========================================================

  const ml =
    calculateMLComponent(
      test,
      positiveQuestions
    );


  // ==========================================================
  // 3. CMT
  // ==========================================================

  const cmt =
    calculateCMTComponent(test);


  // ==========================================================
  // 4. CALCULATE CONTRIBUTIONS
  // ==========================================================

  const farmerBaseRisk =
    farmerQuestions.baseRisk;

  const mlPoints =
    ml.contribution * 100;

  const cmtPoints =
    cmt.contribution * 100;


  // ==========================================================
  // 5. FINAL RISK
  // ==========================================================

  /*
   * FINAL FORMULA:
   *
   * Farmer Base Risk
   * +
   * Calibrated ML × Dynamic ML Weight
   * +
   * CMT × CMT Weight
   */

  let finalScore =
    farmerBaseRisk +
    mlPoints +
    cmtPoints;


  // Clamp between 0 and 100

  finalScore =
    Math.round(
      Math.max(
        0,
        Math.min(
          100,
          finalScore
        )
      )
    );


  // ==========================================================
  // 6. VET THRESHOLD
  // ==========================================================

  /*
   * If final risk is ABOVE 40%,
   * recommend veterinary consultation.
   */

  const riskAboveVetThreshold =
    finalScore > 40;

  const vetRecommendation =
    farmerQuestions.vetRecommendation ||
    riskAboveVetThreshold;


  // ==========================================================
  // 7. RISK LEVEL
  // ==========================================================

  let riskLevel = 'UNKNOWN';

  const labels =
    riskConfig.riskLabels;


  if (
    finalScore <=
    labels.LOW.max
  ) {

    riskLevel = 'LOW';

  } else if (
    finalScore <=
    labels.MEDIUM.max
  ) {

    riskLevel = 'MEDIUM';

  } else if (
    finalScore <=
    labels.HIGH.max
  ) {

    riskLevel = 'HIGH';

  } else {

    riskLevel = 'VERY_HIGH';
  }


  // ==========================================================
  // 8. LOGGING
  // ==========================================================

  logStage(
    'RISK_CALCULATION_COMPLETED',
    {

      testId:
        test.testId,

      finalScore,

      riskLevel,


      // Farmer

      positiveFarmerQuestions:
        positiveQuestions,

      farmerBaseRisk,


      // ML

      mlRawPrediction:
        ml.rawPrediction,

      mlCalibratedSCC:
        ml.calibratedSCC,

      dynamicMLWeight:
        ml.weight,

      mlContribution:
        Number(
          mlPoints.toFixed(2)
        ),


      // CMT

      cmtContribution:
        Number(
          cmtPoints.toFixed(2)
        ),


      // Vet

      vetRecommendation
    }
  );


  // ==========================================================
  // 9. RETURN RESULT
  // ==========================================================

  return {

    score:
      finalScore,

    percentage:
      finalScore,

    level:
      riskLevel,

    trend:
      'STABLE',

    vetRecommendation,


    components: {

      // ======================================================
      // ML
      // ======================================================

      ml: {

        rawPrediction:
          ml.rawPrediction,

        calibratedSCC:
          ml.calibratedSCC,

        weight:
          ml.weight,

        contribution:
          ml.contribution,

        contributionPoints:
          Number(
            mlPoints.toFixed(2)
          )
      },


      // ======================================================
      // CMT
      // ======================================================

      cmt: {

        score:
          cmt.score,

        weight:
          cmt.weight,

        contribution:
          cmt.contribution,

        contributionPoints:
          Number(
            cmtPoints.toFixed(2)
          )
      },


      // ======================================================
      // FARMER QUESTIONS
      // ======================================================

      farmerQuestions: {

        score:
          farmerQuestions.score,

        positiveQuestions:
          positiveQuestions,

        baseRisk:
          farmerBaseRisk,

        vetRecommendation:
          farmerQuestions.vetRecommendation,

        riskMessage:
          farmerQuestions.riskMessage,

        questions:
          farmerQuestions.questions
      },


      // ======================================================
      // FINAL CALCULATION
      // ======================================================

      finalCalculation: {

        farmerBaseRisk,

        mlWeight:
          ml.weight,

        mlContribution:
          Number(
            mlPoints.toFixed(2)
          ),

        cmtContribution:
          Number(
            cmtPoints.toFixed(2)
          ),

        finalScore,

        vetThreshold:
          40,

        vetRecommendation,

        formula:
          'Farmer Base Risk + (Calibrated ML SCC × Dynamic ML Weight × 100) + (CMT × CMT Weight × 100)'
      }
    }
  };
}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

  calculateFinalRisk,

  calculateMLComponent,

  calculateCMTComponent,

  calculateFarmerQuestionComponent,

  calibrateMLPrediction,

  getDynamicMLWeight
};