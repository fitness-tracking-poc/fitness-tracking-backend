const express = require('express');
const router = express.Router();
const { generateDietPlan, suggestFoods, healthCheck } = require('../controllers/ai.controller');

// @route   POST /api/generate-plan
// @desc    Generate personalized diet plan using AI
// @access  Public (add auth middleware if needed)
router.post('/generate-plan', generateDietPlan);

// @route   POST /api/suggest-foods
// @desc    Get AI food suggestions based on nutrition gaps
// @access  Public (add auth middleware if needed)
router.post('/suggest-foods', suggestFoods);

// @route   GET /api/health
// @desc    Health check for AI Gateway
// @access  Public
router.get('/health', healthCheck);

module.exports = router;
