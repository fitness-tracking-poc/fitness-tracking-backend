const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const {
    createGoal,
    getGoals,
    getActiveGoals,
    getGoal,
    updateGoal,
    updateGoalProgress,
    addMilestone,
    deleteGoal,
    getProgressHistory,
    getGoalsDashboard,
    updateGoalStatus
} = require('../controllers/goal.controller');
const { protect } = require('../middleware/auth');

// Validation middleware
const createGoalValidation = [
    body('goalType')
        .notEmpty()
        .withMessage('Goal type is required')
        .isIn([
            'weight_loss', 'weight_gain', 'muscle_gain', 'body_fat_reduction',
            'distance_running', 'exercise_duration', 'exercise_frequency',
            'steps_daily', 'water_intake', 'sleep_hours', 'calorie_intake',
            'strength_milestone', 'custom'
        ])
        .withMessage('Invalid goal type'),
    body('title')
        .notEmpty()
        .withMessage('Goal title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),
    body('targetValue')
        .notEmpty()
        .withMessage('Target value is required')
        .isNumeric()
        .withMessage('Target value must be a number'),
    body('unit')
        .notEmpty()
        .withMessage('Unit is required')
        .isIn(['kg', 'lbs', 'km', 'miles', 'minutes', 'hours', 'times', 'steps', 'liters', 'calories', 'percentage', 'custom'])
        .withMessage('Invalid unit'),
    body('targetDate')
        .notEmpty()
        .withMessage('Target date is required')
        .isISO8601()
        .withMessage('Invalid date format')
];

const updateProgressValidation = [
    body('currentValue')
        .notEmpty()
        .withMessage('Current value is required')
        .isNumeric()
        .withMessage('Current value must be a number')
];

const addMilestoneValidation = [
    body('title')
        .notEmpty()
        .withMessage('Milestone title is required'),
    body('targetValue')
        .notEmpty()
        .withMessage('Target value is required')
        .isNumeric()
        .withMessage('Target value must be a number')
];

// Routes
router.route('/')
    .get(protect, getGoals)
    .post(protect, ...createGoalValidation, createGoal);

router.route('/active')
    .get(protect, getActiveGoals);

router.route('/dashboard')
    .get(protect, getGoalsDashboard);

router.route('/:id')
    .get(protect, getGoal)
    .put(protect, updateGoal)
    .delete(protect, deleteGoal);

router.route('/:id/progress')
    .put(protect, ...updateProgressValidation, updateGoalProgress);

router.route('/:id/status')
    .put(protect, updateGoalStatus);

router.route('/:id/milestones')
    .post(protect, ...addMilestoneValidation, addMilestone);

router.route('/:id/history')
    .get(protect, getProgressHistory);

module.exports = router;
