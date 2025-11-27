const Meal = require('../models/Meal');
const Exercise = require('../models/Exercise');
const Profile = require('../models/Profile');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @desc    Get daily summary
 * @route   GET /api/summary/daily
 * @access  Private
 */
exports.getDailySummary = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const date = req.query.date ? new Date(req.query.date) : new Date();

    // Set date range for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get meals for the day
    const meals = await Meal.find({
        user: userId,
        date: { $gte: startOfDay, $lte: endOfDay }
    });

    // Get exercises for the day
    const exercises = await Exercise.find({
        user: userId,
        date: { $gte: startOfDay, $lte: endOfDay }
    });

    // Calculate totals
    const totalCaloriesConsumed = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const totalExerciseDuration = exercises.reduce((sum, exercise) => sum + (exercise.duration || 0), 0);

    // Simple calorie burn estimation (rough calculation)
    // This is a basic estimation: 5 calories per minute for moderate activity
    const estimatedCaloriesBurned = totalExerciseDuration * 5;

    // Get user profile for goals
    const profile = await Profile.findOne({ user: userId });

    // Calculate net calories (consumed - burned)
    const netCalories = totalCaloriesConsumed - estimatedCaloriesBurned;

    const summary = {
        date: date.toISOString().split('T')[0],
        meals: {
            count: meals.length,
            totalCalories: totalCaloriesConsumed,
            breakdown: meals.reduce((acc, meal) => {
                acc[meal.mealType] = (acc[meal.mealType] || 0) + (meal.calories || 0);
                return acc;
            }, {})
        },
        exercises: {
            count: exercises.length,
            totalDuration: totalExerciseDuration,
            estimatedCaloriesBurned: estimatedCaloriesBurned,
            activities: exercises.map(ex => ({
                name: ex.exerciseName,
                duration: ex.duration || 0,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight,
                distance: ex.distance
            }))
        },
        netCalories: netCalories,
        goals: profile ? {
            fitnessGoal: profile.fitnessGoal,
            waterGoal: profile.waterGoal,
            stepsGoal: profile.stepsGoal,
            sleepGoal: profile.sleepGoal
        } : null
    };

    res.status(200).json({
        success: true,
        data: summary
    });
});

/**
 * @desc    Get weekly report
 * @route   GET /api/summary/weekly
 * @access  Private
 */
exports.getWeeklyReport = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6); // 7 days including end date

    // Set time ranges
    const startOfWeek = new Date(startDate);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(endDate);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get meals for the week
    const meals = await Meal.find({
        user: userId,
        date: { $gte: startOfWeek, $lte: endOfWeek }
    });

    // Get exercises for the week
    const exercises = await Exercise.find({
        user: userId,
        date: { $gte: startOfWeek, $lte: endOfWeek }
    });

    // Group by day
    const dailySummaries = {};
    for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
        const dayStr = d.toISOString().split('T')[0];
        const dayMeals = meals.filter(meal => meal.date.toISOString().split('T')[0] === dayStr);
        const dayExercises = exercises.filter(ex => ex.date.toISOString().split('T')[0] === dayStr);

        const caloriesConsumed = dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        const exerciseDuration = dayExercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
        const caloriesBurned = exerciseDuration * 5; // Simple estimation

        dailySummaries[dayStr] = {
            caloriesConsumed,
            caloriesBurned,
            netCalories: caloriesConsumed - caloriesBurned,
            mealsCount: dayMeals.length,
            exercisesCount: dayExercises.length,
            exerciseDuration
        };
    }

    // Weekly totals
    const weeklyTotals = {
        totalCaloriesConsumed: meals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
        totalCaloriesBurned: exercises.reduce((sum, ex) => sum + ((ex.duration || 0) * 5), 0),
        totalMeals: meals.length,
        totalExercises: exercises.length,
        totalExerciseDuration: exercises.reduce((sum, ex) => sum + (ex.duration || 0), 0),
        averageDailyCalories: 0,
        averageDailyExercise: 0
    };

    weeklyTotals.netCalories = weeklyTotals.totalCaloriesConsumed - weeklyTotals.totalCaloriesBurned;
    weeklyTotals.averageDailyCalories = Math.round(weeklyTotals.netCalories / 7);
    weeklyTotals.averageDailyExercise = Math.round(weeklyTotals.totalExerciseDuration / 7);

    const report = {
        period: {
            startDate: startOfWeek.toISOString().split('T')[0],
            endDate: endOfWeek.toISOString().split('T')[0]
        },
        weeklyTotals,
        dailySummaries
    };

    res.status(200).json({
        success: true,
        data: report
    });
});

/**
 * @desc    Get monthly report
 * @route   GET /api/summary/monthly
 * @access  Private
 */
exports.getMonthlyReport = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const month = req.query.month ? parseInt(req.query.month) : new Date().getMonth() + 1; // 1-12
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    // Get meals for the month
    const meals = await Meal.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate }
    });

    // Get exercises for the month
    const exercises = await Exercise.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate }
    });

    // Monthly totals
    const monthlyTotals = {
        totalCaloriesConsumed: meals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
        totalCaloriesBurned: exercises.reduce((sum, ex) => sum + ((ex.duration || 0) * 5), 0),
        totalMeals: meals.length,
        totalExercises: exercises.length,
        totalExerciseDuration: exercises.reduce((sum, ex) => sum + (ex.duration || 0), 0),
        averageDailyCalories: 0,
        averageDailyExercise: 0,
        activeDays: new Set([...meals.map(m => m.date.toISOString().split('T')[0]), ...exercises.map(e => e.date.toISOString().split('T')[0])]).size
    };

    monthlyTotals.netCalories = monthlyTotals.totalCaloriesConsumed - monthlyTotals.totalCaloriesBurned;
    const daysInMonth = endDate.getDate();
    monthlyTotals.averageDailyCalories = Math.round(monthlyTotals.netCalories / daysInMonth);
    monthlyTotals.averageDailyExercise = Math.round(monthlyTotals.totalExerciseDuration / daysInMonth);

    const report = {
        period: {
            month,
            year,
            daysInMonth
        },
        monthlyTotals
    };

    res.status(200).json({
        success: true,
        data: report
    });
});