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
// const express = require('express');
// const router = express.Router();
// const {
//     addHealthMetric,
//     getHealthMetrics,
//     updateHealthMetric,
//     deleteHealthMetric,
//     getHealthMetricsReport
// } = require('../controllers/healthMetric.controller');
// const { protect } = require('../middleware/auth');

// // All routes are protected
// router.use(protect);

// /**
//  * @route   POST /api/health-metrics
//  *          → Add new metric log (water/sleep/steps/etc.)
//  * @route   GET /api/health-metrics
//  *          → HISTORY: list metrics with optional filters (metric_type, start, end)
//  */
// router.route('/')
//     .post(addHealthMetric)
//     .get(getHealthMetrics);

// /**
//  * @route   GET /api/health-metrics/report
//  *          → Aggregate data for charts (optional)
//  */
// router.get('/report', getHealthMetricsReport);

// /**
//  * @route   PUT /api/health-metrics/:id
//  *          → Update log (value, time, note)
//  * @route   DELETE /api/health-metrics/:id
//  *          → Delete log
//  */
// router.route('/:id')
//     .put(updateHealthMetric)
//     .delete(deleteHealthMetric);

// module.exports = router;
