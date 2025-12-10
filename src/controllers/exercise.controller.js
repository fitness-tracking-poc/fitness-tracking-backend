const Exercise = require('../models/Exercise');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @desc    Add an exercise
 * @route   POST /api/exercises
 * @access  Private
 */
exports.addExercise = asyncHandler(async (req, res, next) => {
    const { exerciseName, duration, sets, reps, weight, distance, date, notes } = req.body;

    if (!exerciseName) {
        return next(new ErrorResponse('Please provide exercise name', 400));
    }

    const exercise = await Exercise.create({
        user: req.userId,
        exerciseName,
        duration,
        sets,
        reps,
        weight,
        distance,
        date: date || new Date(),
        notes
    });

    res.status(201).json({
        success: true,
        message: 'Exercise added successfully',
        data: exercise
    });
});

/**
 * @desc    Get all exercises
 * @route   GET /api/exercises
 * @access  Private
 */
exports.getExercises = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    let query = { user: req.userId };

    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const exercises = await Exercise.find(query).sort({ date: -1 });

    res.status(200).json({
        success: true,
        count: exercises.length,
        data: exercises
    });
});

/**
 * @desc    Get today's exercises
 * @route   GET /api/exercises/today
 * @access  Private
 */
exports.getTodayExercises = asyncHandler(async (req, res, next) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const exercises = await Exercise.find({
        user: req.userId,
        date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ date: -1 });

    res.status(200).json({
        success: true,
        count: exercises.length,
        data: exercises
    });
});

/**
 * @desc    Get exercise by ID
 * @route   GET /api/exercises/:id
 * @access  Private
 */
exports.getExercise = asyncHandler(async (req, res, next) => {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
        return next(new ErrorResponse('Exercise not found', 404));
    }

    // Check ownership
    if (exercise.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to access this exercise', 403));
    }

    res.status(200).json({
        success: true,
        data: exercise
    });
});

/**
 * @desc    Update an exercise
 * @route   PUT /api/exercises/:id
 * @access  Private
 */
exports.updateExercise = asyncHandler(async (req, res, next) => {
    let exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
        return next(new ErrorResponse('Exercise not found', 404));
    }

    // Check ownership
    if (exercise.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to update this exercise', 403));
    }

    exercise = await Exercise.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
        message: 'Exercise updated successfully',
        data: exercise
    });
});

/**
 * @desc    Delete an exercise
 * @route   DELETE /api/exercises/:id
 * @access  Private
 */
exports.deleteExercise = asyncHandler(async (req, res, next) => {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
        return next(new ErrorResponse('Exercise not found', 404));
    }

    // Check ownership
    if (exercise.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to delete this exercise', 403));
    }

    await exercise.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Exercise deleted successfully'
    });
});
