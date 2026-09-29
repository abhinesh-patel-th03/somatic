const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// NOTE: literal paths ('risk-score-guide') must be registered before the
// '/risk-score/:score' param route so Express doesn't try to match
// "guide" as a :score value.
router.get('/risk-score-guide', reportController.getRiskScoreGuide);
router.get('/risk-score/:score', reportController.getRiskScoreReport);
router.get('/tests/:testId', reportController.getTestReport);

module.exports = router;