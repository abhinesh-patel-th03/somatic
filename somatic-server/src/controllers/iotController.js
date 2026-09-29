const iotService = require('../services/iot/iotService');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Demo payloads (you can add more scenarios if needed)
const demoPayloads = {
  healthy: {
    ph: 6.8,
    temperature: 38.5,
    conductivity: 6.1
  },
  mastitis: {
    ph: 7.5,
    temperature: 40.2,
    conductivity: 8.3
  }
};

exports.receiveSensorData = asyncHandler(async (req, res) => {
  try {
    const demoPayloads = {
      low:       { ph: 6.7, temperature: 38.5, conductivity: 5.8,  demoType: 'low',       demoScc: 150 },
      medium:    { ph: 7.0, temperature: 39.3, conductivity: 6.8,  demoType: 'medium',    demoScc: 350 },
      high:      { ph: 7.5, temperature: 40.2, conductivity: 8.3,  demoType: 'high',      demoScc: 500 },
      very_high: { ph: 7.9, temperature: 41.0, conductivity: 10.5, demoType: 'very_high', demoScc: 700 }
    };

    const payload = req.query.demo
      ? demoPayloads[req.query.demo.toLowerCase()] || demoPayloads.low
      : req.body;
    const result = await iotService.processFinalSensorData(payload);

    return sendSuccess(
      res,
      {
        message: req.query.demo
          ? `Demo telemetry (${req.query.demo}) received`
          : "Sensor telemetry received",
        status: result.status,
        testId: result.testId,
        demo: !!req.query.demo
      },
      result.status === "SAVED" ? 201 : 200
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});



