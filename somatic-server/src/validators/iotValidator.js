const { z } = require('zod');

/**
 * ESP32 sends measurements only.
 *
 * Example:
 * {
 *   ph: 8,
 *   temperature: 40,
 *   conductivity: 7
 * }
 *
 * Test/cow/farmer context is resolved by the backend.
 */
const sensorDataSchema = z.object({
  ph: z.number()
    .min(0)
    .max(14),

  temperature: z.number()
    .min(0)
    .max(50),

  conductivity: z.number()
    .min(0)
    .max(50),
}).strict();

module.exports = { sensorDataSchema };