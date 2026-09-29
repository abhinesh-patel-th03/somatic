const axios = require('axios');
const env = require('../../config/env');
const { adaptMlResponse } = require('./mlAdapter');
const { logger, logStage } = require('../../utils/logger');

/**
 * Estimates an SCC value from raw sensor readings.
 * Only used when the real ML API is down AND the reading is not a
 * hardcoded demo. Maps pH / temperature / conductivity to a smooth
 * SCC range of roughly 150 (normal) to 750 (severe).
 */
function estimateSccFromReadings({ ph, temperature, conductivity }) {
    const severity = Math.min(1, Math.max(0,
        (
            (temperature - 38.5) / 2.5 +
            (ph - 6.7) / 1.2 +
            (conductivity - 5.8) / 4.5
        ) / 3
    ));

    return Math.round(150 + severity * 600);
}

/**
 * Communicates with the external Machine Learning API.
 *
 * Order of behaviour:
 *   1. Hardcoded demo  -> sensorData.demoScc is set, skip ML entirely.
 *   2. Real ML API     -> normal path for real ESP32 readings.
 *   3. Fallback        -> ML API failed, estimate SCC from the readings.
 */
async function getMastitisPrediction(testId, cowId, sensorData, observations) {
    logStage('ML_REQUEST_SENT', { testId, cowId });

    // ---------------------------------------------------------
    // 1. HARDCODED DEMO (low / medium / high / very_high)
    // ---------------------------------------------------------
    if (sensorData.demoScc !== undefined && sensorData.demoScc !== null) {
        logStage('ML_DEMO_HARDCODED', {
            testId,
            demoType: sensorData.demoType,
            scc: sensorData.demoScc
        });

        return adaptMlResponse({
            prediction: sensorData.demoScc,
            confidence: 0.95,
            modelVersion: 'demo-hardcoded'
        });
    }

    const payload = {
        temperature: sensorData.temperature,
        ph: sensorData.ph,
        conductivity: sensorData.conductivity
    };

    // ---------------------------------------------------------
    // 2. REAL ML API
    // ---------------------------------------------------------
    try {
        const response = await axios.post(env.ML_API_URL, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: env.ML_TIMEOUT_MS
        });

        logStage('ML_RESPONSE_RECEIVED', { testId });
        return adaptMlResponse(response.data);

    } catch (error) {
        logger.error('ML API Request Failed', {
            testId,
            message: error.message,
            code: error.code
        });

        // -----------------------------------------------------
        // 3. FALLBACK: estimate SCC from the actual readings
        // -----------------------------------------------------
        logStage('ML_FALLBACK_USED', { testId });

        return adaptMlResponse({
            prediction: estimateSccFromReadings(payload),
            confidence: 0.8,
            modelVersion: 'fallback-v2',
            fallback: true
        });
    }
}

module.exports = { getMastitisPrediction };