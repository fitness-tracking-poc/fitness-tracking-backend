const express = require('express');
const router = express.Router();
const {
    getDailySummary,
    getWeeklyReport,
    getMonthlyReport
} = require('../controllers/summary.controller');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Summary routes
router.get('/daily', getDailySummary);
router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);

module.exports = router;