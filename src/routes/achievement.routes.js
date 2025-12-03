const express = require('express');
const router = express.Router();
const {
    getAchievements,
    getAchievementStats,
    getStreak,
    updateStreak,
    checkAndAwardBadges,
    getAvailableBadges,
    deleteAchievement
} = require('../controllers/achievement.controller');
const { protect } = require('../middleware/auth');

// Routes
router.route('/')
    .get(protect, getAchievements);

router.route('/stats')
    .get(protect, getAchievementStats);

router.route('/streak')
    .get(protect, getStreak);

router.route('/streak/update')
    .post(protect, updateStreak);

router.route('/check')
    .post(protect, checkAndAwardBadges);

router.route('/available')
    .get(protect, getAvailableBadges);

router.route('/:id')
    .delete(protect, deleteAchievement);

module.exports = router;
