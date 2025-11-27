const express = require('express');
const router = express.Router();
const {
    addHealthMetric,
    getHealthMetrics,
    updateHealthMetric,
    deleteHealthMetric,
    getHealthMetricsReport
} = require('../controllers/healthMetric.controller');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Health metrics routes
router.route('/')
    .post(addHealthMetric)
    .get(getHealthMetrics);

router.get('/report', getHealthMetricsReport);

router.route('/:id')
    .put(updateHealthMetric)
    .delete(deleteHealthMetric);

module.exports = router;