const { Achievement, Streak } = require('../models/Achievement');
const Goal = require('../models/Goal');
const Exercise = require('../models/Exercise');
const Meal = require('../models/Meal');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @desc    Get all achievements for logged in user
 * @route   GET /api/achievements
 * @access  Private
 */
exports.getAchievements = asyncHandler(async (req, res, next) => {
    const { badgeType, tier } = req.query;

    // Build query
    const query = { user: req.userId };

    if (badgeType) {
        query.badgeType = badgeType;
    }
    if (tier) {
        query.tier = tier;
    }

    const achievements = await Achievement.find(query)
        .sort({ earnedAt: -1 })
        .populate('relatedGoalId', 'title goalType');

    res.status(200).json({
        success: true,
        count: achievements.length,
        data: achievements
    });
});

/**
 * @desc    Get achievement statistics
 * @route   GET /api/achievements/stats
 * @access  Private
 */
exports.getAchievementStats = asyncHandler(async (req, res, next) => {
    const achievements = await Achievement.find({ user: req.userId });

    // Count by type
    const byType = {};
    achievements.forEach(a => {
        byType[a.badgeType] = (byType[a.badgeType] || 0) + 1;
    });

    // Count by tier
    const byTier = {
        bronze: achievements.filter(a => a.tier === 'bronze').length,
        silver: achievements.filter(a => a.tier === 'silver').length,
        gold: achievements.filter(a => a.tier === 'gold').length,
        platinum: achievements.filter(a => a.tier === 'platinum').length,
        diamond: achievements.filter(a => a.tier === 'diamond').length
    };

    // Recent achievements
    const recent = achievements
        .sort((a, b) => b.earnedAt - a.earnedAt)
        .slice(0, 5);

    res.status(200).json({
        success: true,
        data: {
            total: achievements.length,
            byType,
            byTier,
            recent
        }
    });
});

/**
 * @desc    Get user streak information
 * @route   GET /api/achievements/streak
 * @access  Private
 */
exports.getStreak = asyncHandler(async (req, res, next) => {
    let streak = await Streak.findOne({ user: req.userId });

    if (!streak) {
        streak = await Streak.create({ user: req.userId });
    }

    res.status(200).json({
        success: true,
        data: streak
    });
});

/**
 * @desc    Update streak (called when user logs activity)
 * @route   POST /api/achievements/streak/update
 * @access  Private
 */
exports.updateStreak = asyncHandler(async (req, res, next) => {
    let streak = await Streak.findOne({ user: req.userId });

    if (!streak) {
        streak = await Streak.create({ user: req.userId });
    }

    const result = await streak.checkAndUpdateStreak();

    // Check for streak milestones and award badges
    const milestones = Streak.checkStreakMilestones(result.currentStreak.count);
    let newBadges = [];

    if (milestones.length > 0) {
        newBadges = await awardStreakBadges(req.userId, milestones);
    }

    res.status(200).json({
        success: true,
        message: 'Streak updated successfully',
        data: {
            streak: result,
            newBadges
        }
    });
});

/**
 * @desc    Check and award automatic badges
 * @route   POST /api/achievements/check
 * @access  Private
 */
exports.checkAndAwardBadges = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const newBadges = [];

    // Check for first goal completion
    const completedGoals = await Goal.countDocuments({ 
        user: userId, 
        status: 'completed' 
    });

    if (completedGoals === 1) {
        const badge = await awardBadge(userId, {
            badgeId: 'first_goal',
            badgeType: 'first_achievement',
            name: 'First Goal Achieved',
            description: 'Completed your first fitness goal',
            icon: '🎉',
            tier: 'bronze',
            criteriaValue: 1
        });
        if (badge) newBadges.push(badge);
    }

    // Check for exercise milestones
    const totalExercises = await Exercise.countDocuments({ user: userId });
    const exerciseMilestones = [10, 50, 100, 250, 500];
    
    for (const milestone of exerciseMilestones) {
        if (totalExercises === milestone) {
            const badge = await awardBadge(userId, {
                badgeId: `exercise_${milestone}`,
                badgeType: 'exercise_milestone',
                name: `${milestone} Workouts`,
                description: `Logged ${milestone} exercise sessions`,
                icon: '💪',
                tier: getTierByMilestone(milestone),
                criteriaValue: milestone
            });
            if (badge) newBadges.push(badge);
        }
    }

    // Check for meal logging milestones
    const totalMeals = await Meal.countDocuments({ user: userId });
    const mealMilestones = [50, 100, 250, 500, 1000];
    
    for (const milestone of mealMilestones) {
        if (totalMeals === milestone) {
            const badge = await awardBadge(userId, {
                badgeId: `meal_${milestone}`,
                badgeType: 'meal_milestone',
                name: `${milestone} Meals Logged`,
                description: `Tracked ${milestone} meals`,
                icon: '🍽️',
                tier: getTierByMilestone(milestone),
                criteriaValue: milestone
            });
            if (badge) newBadges.push(badge);
        }
    }

    // Check for early bird badge (exercises before 8 AM)
    const earlyExercises = await Exercise.countDocuments({
        user: userId,
        date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(8, 0, 0, 0))
        }
    });

    if (earlyExercises >= 7) {
        const badge = await awardBadge(userId, {
            badgeId: 'early_bird',
            badgeType: 'early_bird',
            name: 'Early Bird',
            description: 'Exercised before 8 AM for 7 days',
            icon: '🌅',
            tier: 'silver',
            criteriaValue: 7
        });
        if (badge) newBadges.push(badge);
    }

    // Check for perfectionist badge (all goals on track)
    const activeGoals = await Goal.find({ 
        user: userId, 
        status: 'active' 
    });

    const allOnTrack = activeGoals.length > 0 && activeGoals.every(goal => {
        const daysElapsed = (new Date() - new Date(goal.startDate)) / (1000 * 60 * 60 * 24);
        const totalDays = (new Date(goal.targetDate) - new Date(goal.startDate)) / (1000 * 60 * 60 * 24);
        const expectedProgress = (daysElapsed / totalDays) * 100;
        return goal.progressPercentage >= expectedProgress;
    });

    if (allOnTrack && activeGoals.length >= 3) {
        const badge = await awardBadge(userId, {
            badgeId: 'perfectionist',
            badgeType: 'perfectionist',
            name: 'Perfectionist',
            description: 'All goals on track or ahead',
            icon: '✨',
            tier: 'gold',
            criteriaValue: activeGoals.length
        });
        if (badge) newBadges.push(badge);
    }

    res.status(200).json({
        success: true,
        message: newBadges.length > 0 ? 'New badges awarded!' : 'No new badges',
        data: {
            newBadges,
            count: newBadges.length
        }
    });
});

/**
 * @desc    Get available badges (all possible badges)
 * @route   GET /api/achievements/available
 * @access  Private
 */
exports.getAvailableBadges = asyncHandler(async (req, res, next) => {
    const availableBadges = [
        // Streak badges
        { badgeType: 'streak_milestone', name: 'Week Warrior', icon: '🔥', criteriaValue: 7, tier: 'bronze' },
        { badgeType: 'streak_milestone', name: 'Two Week Champion', icon: '🌟', criteriaValue: 14, tier: 'silver' },
        { badgeType: 'streak_milestone', name: 'Monthly Master', icon: '🏆', criteriaValue: 30, tier: 'gold' },
        { badgeType: 'streak_milestone', name: 'Two Month Hero', icon: '💎', criteriaValue: 60, tier: 'gold' },
        { badgeType: 'streak_milestone', name: 'Century Club', icon: '👑', criteriaValue: 100, tier: 'platinum' },
        { badgeType: 'streak_milestone', name: 'Half Year Legend', icon: '🎖️', criteriaValue: 180, tier: 'platinum' },
        { badgeType: 'streak_milestone', name: 'Year Long Champion', icon: '🌠', criteriaValue: 365, tier: 'diamond' },
        
        // Exercise milestones
        { badgeType: 'exercise_milestone', name: '10 Workouts', icon: '💪', criteriaValue: 10, tier: 'bronze' },
        { badgeType: 'exercise_milestone', name: '50 Workouts', icon: '💪', criteriaValue: 50, tier: 'silver' },
        { badgeType: 'exercise_milestone', name: '100 Workouts', icon: '💪', criteriaValue: 100, tier: 'gold' },
        { badgeType: 'exercise_milestone', name: '250 Workouts', icon: '💪', criteriaValue: 250, tier: 'platinum' },
        { badgeType: 'exercise_milestone', name: '500 Workouts', icon: '💪', criteriaValue: 500, tier: 'diamond' },
        
        // Meal milestones
        { badgeType: 'meal_milestone', name: '50 Meals Logged', icon: '🍽️', criteriaValue: 50, tier: 'bronze' },
        { badgeType: 'meal_milestone', name: '100 Meals Logged', icon: '🍽️', criteriaValue: 100, tier: 'silver' },
        { badgeType: 'meal_milestone', name: '250 Meals Logged', icon: '🍽️', criteriaValue: 250, tier: 'gold' },
        { badgeType: 'meal_milestone', name: '500 Meals Logged', icon: '🍽️', criteriaValue: 500, tier: 'platinum' },
        { badgeType: 'meal_milestone', name: '1000 Meals Logged', icon: '🍽️', criteriaValue: 1000, tier: 'diamond' },
        
        // Special badges
        { badgeType: 'first_achievement', name: 'First Goal Achieved', icon: '🎉', criteriaValue: 1, tier: 'bronze' },
        { badgeType: 'early_bird', name: 'Early Bird', icon: '🌅', criteriaValue: 7, tier: 'silver' },
        { badgeType: 'perfectionist', name: 'Perfectionist', icon: '✨', criteriaValue: 3, tier: 'gold' }
    ];

    // Get user's earned achievements
    const earnedBadges = await Achievement.find({ user: req.userId });
    const earnedBadgeIds = new Set(earnedBadges.map(b => b.badgeId));

    // Mark which badges are earned
    const badgesWithStatus = availableBadges.map(badge => ({
        ...badge,
        earned: earnedBadgeIds.has(`${badge.badgeType}_${badge.criteriaValue}`) || earnedBadgeIds.has(badge.badgeType)
    }));

    res.status(200).json({
        success: true,
        data: {
            total: availableBadges.length,
            earned: earnedBadges.length,
            remaining: availableBadges.length - earnedBadges.length,
            badges: badgesWithStatus
        }
    });
});

/**
 * @desc    Delete achievement (admin only or for testing)
 * @route   DELETE /api/achievements/:id
 * @access  Private
 */
exports.deleteAchievement = asyncHandler(async (req, res, next) => {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
        return next(new ErrorResponse('Achievement not found', 404));
    }

    // Make sure user owns the achievement
    if (achievement.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to delete this achievement', 403));
    }

    await achievement.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Achievement deleted successfully'
    });
});

// Helper function to award streak badges
async function awardStreakBadges(userId, milestones) {
    const badgeDefinitions = {
        7: { name: 'Week Warrior', tier: 'bronze', icon: '🔥' },
        14: { name: 'Two Week Champion', tier: 'silver', icon: '🌟' },
        30: { name: 'Monthly Master', tier: 'gold', icon: '🏆' },
        60: { name: 'Two Month Hero', tier: 'gold', icon: '💎' },
        100: { name: 'Century Club', tier: 'platinum', icon: '👑' },
        180: { name: 'Half Year Legend', tier: 'platinum', icon: '🎖️' },
        365: { name: 'Year Long Champion', tier: 'diamond', icon: '🌠' }
    };

    const newBadges = [];

    for (const milestone of milestones) {
        const badgeDef = badgeDefinitions[milestone];
        if (badgeDef) {
            const badgeId = `streak_${milestone}`;
            
            // Check if badge already exists
            const existingBadge = await Achievement.findOne({ user: userId, badgeId });
            
            if (!existingBadge) {
                const badge = await Achievement.create({
                    user: userId,
                    badgeId,
                    badgeType: 'streak_milestone',
                    name: badgeDef.name,
                    description: `Maintained a ${milestone}-day activity streak`,
                    icon: badgeDef.icon,
                    tier: badgeDef.tier,
                    criteriaValue: milestone
                });
                newBadges.push(badge);
            }
        }
    }

    return newBadges;
}

// Helper function to award a badge
async function awardBadge(userId, badgeData) {
    // Check if badge already exists
    const existingBadge = await Achievement.findOne({ 
        user: userId, 
        badgeId: badgeData.badgeId 
    });
    
    if (!existingBadge) {
        return await Achievement.create({
            user: userId,
            ...badgeData
        });
    }
    
    return null;
}

// Helper function to determine tier by milestone
function getTierByMilestone(milestone) {
    if (milestone >= 500) return 'diamond';
    if (milestone >= 250) return 'platinum';
    if (milestone >= 100) return 'gold';
    if (milestone >= 50) return 'silver';
    return 'bronze';
}
