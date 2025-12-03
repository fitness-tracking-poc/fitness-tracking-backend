const Goal = require('../models/Goal');
const { Streak, Achievement } = require('../models/Achievement');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @desc    Create a new goal
 * @route   POST /api/goals
 * @access  Private
 */
exports.createGoal = asyncHandler(async (req, res, next) => {
    // Add user to request body
    req.body.user = req.userId;

    // Validate target date is in the future
    if (new Date(req.body.targetDate) <= new Date()) {
        return next(new ErrorResponse('Target date must be in the future', 400));
    }

    // Set start value if not provided
    if (req.body.startValue === undefined) {
        req.body.startValue = req.body.currentValue || 0;
    }

    const goal = await Goal.create(req.body);

    res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        data: goal
    });
});

/**
 * @desc    Get all goals for logged in user
 * @route   GET /api/goals
 * @access  Private
 */
exports.getGoals = asyncHandler(async (req, res, next) => {
    const { status, goalType, category, priority } = req.query;

    // Build query
    const query = { user: req.userId };

    if (status) {
        query.status = status;
    }
    if (goalType) {
        query.goalType = goalType;
    }
    if (category) {
        query.category = category;
    }
    if (priority) {
        query.priority = priority;
    }

    const goals = await Goal.find(query)
        .sort({ priority: -1, targetDate: 1 });

    // Calculate statistics
    const stats = {
        total: goals.length,
        active: goals.filter(g => g.status === 'active').length,
        completed: goals.filter(g => g.status === 'completed').length,
        paused: goals.filter(g => g.status === 'paused').length,
        abandoned: goals.filter(g => g.status === 'abandoned').length
    };

    res.status(200).json({
        success: true,
        count: goals.length,
        stats,
        data: goals
    });
});

/**
 * @desc    Get active goals for logged in user
 * @route   GET /api/goals/active
 * @access  Private
 */
exports.getActiveGoals = asyncHandler(async (req, res, next) => {
    const goals = await Goal.find({
        user: req.userId,
        status: 'active'
    }).sort({ priority: -1, targetDate: 1 });

    res.status(200).json({
        success: true,
        count: goals.length,
        data: goals
    });
});

/**
 * @desc    Get single goal
 * @route   GET /api/goals/:id
 * @access  Private
 */
exports.getGoal = asyncHandler(async (req, res, next) => {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
        return next(new ErrorResponse('Goal not found', 404));
    }

    // Make sure user owns the goal
    if (goal.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to access this goal', 403));
    }

    res.status(200).json({
        success: true,
        data: goal
    });
});

/**
 * @desc    Update goal
 * @route   PUT /api/goals/:id
 * @access  Private
 */
exports.updateGoal = asyncHandler(async (req, res, next) => {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
        return next(new ErrorResponse('Goal not found', 404));
    }

    // Make sure user owns the goal
    if (goal.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to update this goal', 403));
    }

    // Don't allow updating certain fields
    delete req.body.user;
    delete req.body.progressHistory;

    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        message: 'Goal updated successfully',
        data: goal
    });
});

/**
 * @desc    Update goal progress
 * @route   PUT /api/goals/:id/progress
 * @access  Private
 */
exports.updateGoalProgress = asyncHandler(async (req, res, next) => {
    const { currentValue, note } = req.body;

    if (currentValue === undefined) {
        return next(new ErrorResponse('Please provide current value', 400));
    }

    let goal = await Goal.findById(req.params.id);

    if (!goal) {
        return next(new ErrorResponse('Goal not found', 404));
    }

    // Make sure user owns the goal
    if (goal.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to update this goal', 403));
    }

    // Update progress using model method
    await goal.updateProgress(currentValue, note);

    // Update streak if goal is active
    if (goal.status === 'active') {
        let streak = await Streak.findOne({ user: req.userId });
        if (!streak) {
            streak = await Streak.create({ user: req.userId });
        }
        await streak.checkAndUpdateStreak();
        
        // Check for streak milestones and award badges
        const milestones = Streak.checkStreakMilestones(streak.currentStreak.count);
        if (milestones.length > 0) {
            await awardStreakBadges(req.userId, milestones);
        }
    }

    // Check if goal was just completed and award badge
    if (goal.status === 'completed' && !goal.completedDate) {
        await awardGoalCompletionBadge(req.userId, goal);
    }

    res.status(200).json({
        success: true,
        message: 'Progress updated successfully',
        data: goal
    });
});

/**
 * @desc    Add milestone to goal
 * @route   POST /api/goals/:id/milestones
 * @access  Private
 */
exports.addMilestone = asyncHandler(async (req, res, next) => {
    const { title, targetValue } = req.body;

    if (!title || targetValue === undefined) {
        return next(new ErrorResponse('Please provide title and target value', 400));
    }

    let goal = await Goal.findById(req.params.id);

    if (!goal) {
        return next(new ErrorResponse('Goal not found', 404));
    }

    // Make sure user owns the goal
    if (goal.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to update this goal', 403));
    }

    await goal.addMilestone(title, targetValue);

    res.status(200).json({
        success: true,
        message: 'Milestone added successfully',
        data: goal
    });
});

/**
 * @desc    Delete goal
 * @route   DELETE /api/goals/:id
 * @access  Private
 */
exports.deleteGoal = asyncHandler(async (req, res, next) => {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
        return next(new ErrorResponse('Goal not found', 404));
    }

    // Make sure user owns the goal
    if (goal.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to delete this goal', 403));
    }

    await goal.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Goal deleted successfully'
    });
});

/**
 * @desc    Get goal progress history
 * @route   GET /api/goals/:id/history
 * @access  Private
 */
exports.getProgressHistory = asyncHandler(async (req, res, next) => {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
        return next(new ErrorResponse('Goal not found', 404));
    }

    // Make sure user owns the goal
    if (goal.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to access this goal', 403));
    }

    res.status(200).json({
        success: true,
        data: {
            goalId: goal._id,
            title: goal.title,
            progressHistory: goal.progressHistory,
            currentProgress: goal.progressPercentage
        }
    });
});

/**
 * @desc    Get goals dashboard summary
 * @route   GET /api/goals/dashboard
 * @access  Private
 */
exports.getGoalsDashboard = asyncHandler(async (req, res, next) => {
    const goals = await Goal.find({ user: req.userId });

    // Calculate statistics
    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');
    
    const stats = {
        totalGoals: goals.length,
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        pausedGoals: goals.filter(g => g.status === 'paused').length,
        abandonedGoals: goals.filter(g => g.status === 'abandoned').length,
        averageProgress: activeGoals.length > 0 
            ? activeGoals.reduce((sum, g) => sum + g.progressPercentage, 0) / activeGoals.length 
            : 0,
        goalsNearCompletion: activeGoals.filter(g => g.progressPercentage >= 80).length,
        overdueGoals: activeGoals.filter(g => new Date(g.targetDate) < new Date()).length
    };

    // Get upcoming milestones
    const upcomingMilestones = [];
    activeGoals.forEach(goal => {
        goal.milestones.forEach(milestone => {
            if (!milestone.achieved) {
                upcomingMilestones.push({
                    goalId: goal._id,
                    goalTitle: goal.title,
                    milestoneTitle: milestone.title,
                    targetValue: milestone.targetValue,
                    currentValue: goal.currentValue,
                    progressToMilestone: ((goal.currentValue / milestone.targetValue) * 100).toFixed(2)
                });
            }
        });
    });

    // Get streak information
    const streak = await Streak.findOne({ user: req.userId });

    res.status(200).json({
        success: true,
        data: {
            stats,
            activeGoals: activeGoals.slice(0, 5), // Top 5 active goals
            recentlyCompleted: completedGoals
                .sort((a, b) => b.completedDate - a.completedDate)
                .slice(0, 3),
            upcomingMilestones: upcomingMilestones.slice(0, 5),
            streak: streak ? {
                currentStreak: streak.currentStreak.count,
                longestStreak: streak.longestStreak.count,
                totalActiveDays: streak.totalActiveDays
            } : null
        }
    });
});

/**
 * @desc    Pause/Resume goal
 * @route   PUT /api/goals/:id/status
 * @access  Private
 */
exports.updateGoalStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;

    if (!status || !['active', 'paused', 'abandoned'].includes(status)) {
        return next(new ErrorResponse('Please provide valid status (active, paused, abandoned)', 400));
    }

    let goal = await Goal.findById(req.params.id);

    if (!goal) {
        return next(new ErrorResponse('Goal not found', 404));
    }

    // Make sure user owns the goal
    if (goal.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to update this goal', 403));
    }

    goal.status = status;
    await goal.save();

    res.status(200).json({
        success: true,
        message: `Goal ${status === 'active' ? 'resumed' : status}`,
        data: goal
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

    for (const milestone of milestones) {
        const badgeDef = badgeDefinitions[milestone];
        if (badgeDef) {
            const badgeId = `streak_${milestone}`;
            
            // Check if badge already exists
            const existingBadge = await Achievement.findOne({ user: userId, badgeId });
            
            if (!existingBadge) {
                await Achievement.create({
                    user: userId,
                    badgeId,
                    badgeType: 'streak_milestone',
                    name: badgeDef.name,
                    description: `Maintained a ${milestone}-day activity streak`,
                    icon: badgeDef.icon,
                    tier: badgeDef.tier,
                    criteriaValue: milestone
                });
            }
        }
    }
}

// Helper function to award goal completion badge
async function awardGoalCompletionBadge(userId, goal) {
    const badgeId = `goal_completed_${goal._id}`;
    
    // Check if badge already exists
    const existingBadge = await Achievement.findOne({ user: userId, badgeId });
    
    if (!existingBadge) {
        await Achievement.create({
            user: userId,
            badgeId,
            badgeType: 'goal_completion',
            name: `${goal.title} - Completed!`,
            description: `Successfully completed the goal: ${goal.title}`,
            icon: '🎯',
            tier: 'gold',
            criteriaValue: goal.targetValue,
            relatedGoalId: goal._id
        });
    }
}
