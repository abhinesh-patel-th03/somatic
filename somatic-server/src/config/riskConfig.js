/**
 * Global Risk Configuration
 *
 * Three independent components:
 *
 * 1. ML calibrated SCC
 * 2. CMT Kit
 * 3. Farmer Questions
 *
 * Each component has equal weight = 0.33
 *
 * Farmer component:
 * 4 questions × 0.25 = 1.00
 */

module.exports = {

    version: 'v2.0.0',


    // =====================================================
    // COMPONENT WEIGHTS
    // =====================================================

    weights: {

        ml: 0.33,

        cmt: 0.33,

        farmerQuestions: 0.33
    },


    // =====================================================
    // ML SCC CALIBRATION
    // =====================================================
    //
    // IMPORTANT:
    // These are NOT clinical SCC values.
    //
    // They convert the raw ML model output into
    // a normalized severity score from 0–1.
    //
    // pH itself is NEVER flagged here.
    //
    // pH, temperature and conductivity are only inputs
    // to the ML model.
    // =====================================================

    mlCalibration: {

        points: [

            { value: 140, score: 0.15 },

            { value: 250, score: 0.15 },

            { value: 275, score: 0.25 },

            { value: 300, score: 0.35 },

            { value: 336, score: 0.40 },

            { value: 410, score: 0.60 },

            { value: 450, score: 0.69 },

            { value: 500, score: 0.80 },

            { value: 550, score: 0.87 },

            { value: 650, score: 0.94 },

            { value: 764, score: 1.00 }
        ]
    },


    // =====================================================
    // FARMER QUESTION WEIGHTS
    // =====================================================
    //
    // Four questions.
    //
    // Each question contributes 25%.
    //
    // 4 × 0.25 = 1.00
    // =====================================================

    farmerQuestions: {

        questionWeights: [

            0.25,
            0.25,
            0.25,
            0.25
        ]
    },


    // =====================================================
    // FINAL RISK LEVELS
    // =====================================================

    riskLabels: {

        LOW: {
            min: 0,
            max: 24
        },

        MEDIUM: {
            min: 25,
            max: 49
        },

        HIGH: {
            min: 50,
            max: 74
        },

        VERY_HIGH: {
            min: 75,
            max: 100
        }
    }
};