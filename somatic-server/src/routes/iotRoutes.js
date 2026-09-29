const express = require('express');
const iotController = require('../controllers/iotController');
const validate = require('../middleware/validationMiddleware');
const { sensorDataSchema } = require('../validators/iotValidator');

const router = express.Router();

/*
 * IoT endpoint intentionally has NO auth middleware.
 *
 * ESP32 is a telemetry-only device.
 * It does not know:
 * - farmerId
 * - cowId
 * - testId
 * - JWT
 *
 * Backend determines the active test from the test state.
 */
router.post('/sensor-data', (req, res, next) => {
  if (req.query.demo) {
    return iotController.receiveSensorData(req, res, next);
  }
  return validate(sensorDataSchema)(req, res, next);
}, iotController.receiveSensorData);

module.exports = router;