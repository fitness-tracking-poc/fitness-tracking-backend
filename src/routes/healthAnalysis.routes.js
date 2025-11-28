const express = require('express');
const router = express.Router();
const {
    getHealthAnalysis,
    getBloodPressureAnalysis,
    getDiabetesRiskAssessment,
    getBMIAnalysis,
    getHeartRateAnalysis
} = require('../controllers/healthAnalysis.controller');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Health analysis routes
router.get('/', getHealthAnalysis);
router.get('/blood-pressure', getBloodPressureAnalysis);
router.get('/diabetes-risk', getDiabetesRiskAssessment);
router.get('/bmi', getBMIAnalysis);
router.get('/heart-rate', getHeartRateAnalysis);

module.exports = router;
