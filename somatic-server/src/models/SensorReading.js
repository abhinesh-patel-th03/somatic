const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema(
  {
    testId: {
      type: String,
      required: true,
      index: true,
    },

    cowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cow',
      required: true,
      index: true,
    },

    deviceId: {
      type: String,
      default: null,
    },

    timestamp: {
      type: Date,
      required: true,
    },

    ph: {
      type: Number,
      required: true,
    },

    temperature: {
      type: Number,
      required: true,
    },

    conductivity: {
      type: Number,
      required: true,
    },

    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    validationStatus: {
      type: String,
      enum: ['VALID', 'FLAGGED', 'REJECTED'],
      default: 'VALID',
    }
  },
  { timestamps: true }
);
// Compound index to ensure idempotency. 
// A device should never send two completely different readings for the exact same test at the exact same millisecond.
sensorReadingSchema.index({ testId: 1, timestamp: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model('SensorReading', sensorReadingSchema);