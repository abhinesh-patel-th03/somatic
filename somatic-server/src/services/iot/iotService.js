const SensorReading = require('../../models/SensorReading');
const Test = require('../../models/Test');
const pipelineService = require('../pipelineService');
const { ApiError } = require('../../utils/apiResponse');
const { logStage, logger } = require('../../utils/logger');

/**
 * Processes telemetry received from the ESP32.
 *
 * ESP32 sends measurements only:
 *
 * {
 *   ph: 8,
 *   temperature: 40,
 *   conductivity: 7
 * }
 *
 * Demo requests (?demo=low|medium|high|very_high) additionally carry:
 *
 *   demoType: 'high'
 *   demoScc:  500
 *
 * The backend determines which test is currently waiting for
 * sensor data and attaches the measurements to that test.
 */
async function processFinalSensorData(payload) {
  const {
    ph,
    temperature,
    conductivity
  } = payload;

  /*
   * DEMO ARCHITECTURE:
   *
   * There is effectively one sensor test running at a time.
   *
   * The frontend starts a test and eventually moves it to:
   *
   * WAITING_FOR_DEVICE
   *
   * The ESP32 then sends telemetry without knowing anything
   * about the test.
   */
  const activeTest = await Test.findOne({
    status: 'WAITING_FOR_DEVICE'
  }).sort({ startedAt: -1 });

  if (!activeTest) {
    throw new ApiError(
      'No test is currently waiting for sensor data',
      409,
      'NO_ACTIVE_SENSOR_TEST'
    );
  }

  const testId = activeTest.testId;

  /*
   * If a sensor payload has already been accepted, don't process
   * another final payload for the same test.
   */
  if (
    ['SENDING_TO_ML', 'CALCULATING_RISK', 'COMPLETED'].includes(
      activeTest.status
    )
  ) {
    logger.debug('Duplicate sensor payload ignored', {
      testId
    });

    return {
      status: 'ALREADY_PROCESSED',
      testId
    };
  }

  /*
   * Backend generates the timestamp.
   *
   * The ESP32 does not need to maintain synchronized time.
   */
  const timestamp = new Date();

  /*
   * Store immutable sensor reading.
   *
   * All contextual information comes from the Test document.
   */
  const reading = await SensorReading.create({
    testId: activeTest.testId,
    cowId: activeTest.cowId,

    // No device identity in the current demo architecture.
    deviceId: null,

    timestamp,

    ph,
    temperature,
    conductivity,

    // Store exactly what the ESP32 sent.
    rawPayload: payload
  });

  /*
   * Lock sensor values into the Test document.
   *
   * cowId and farmerId were already associated with the test
   * when the frontend created it.
   *
   * demoType / demoScc are only set for demo requests.
   * mlService uses demoScc to skip the ML API and return a
   * hardcoded SCC. For real ESP32 data they are null.
   */
  activeTest.sensorData = {
    ph,
    temperature,
    conductivity,
    demoType: payload.demoType || null,
    demoScc: payload.demoScc ?? null
  };

  /*
   * Move the test into the ML pipeline.
   */
  activeTest.status = 'SENDING_TO_ML';

  await activeTest.save();

  logStage('SENSOR_DATA_RECEIVED', {
    testId: activeTest.testId,
    cowId: activeTest.cowId.toString()
  });

  /*
   * Start ML + risk processing in the background.
   *
   * Do not make the ESP32 wait for the complete ML pipeline.
   */
  pipelineService
    .runTestPipeline(
      activeTest.testId,
      activeTest.farmerId
    )
    .catch(err => {
      logger.error(
        'Unhandled pipeline background error',
        {
          testId: activeTest.testId,
          error: err.message
        }
      );
    });

  return {
    status: 'SAVED',
    testId: activeTest.testId,
    reading
  };
}

module.exports = {
  processFinalSensorData
};