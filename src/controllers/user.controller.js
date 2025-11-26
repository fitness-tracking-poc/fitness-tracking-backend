const Profile = require('../models/Profile');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @desc    Get user profile
 * @route   GET /api/user/profile
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
    const profile = await Profile.findOne({ user: req.userId }).populate('user', 'name email');

    if (!profile) {
        return next(new ErrorResponse('Profile not found', 404));
    }

    res.status(200).json({
        success: true,
        data: profile
    });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/user/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
    const allowedFields = [
        'age', 'birthDate', 'gender', 'height', 'weight', 'fitnessGoal', 'activityLevel',
        'dietaryPreferences', 'waterGoal', 'stepsGoal', 'sleepGoal'
    ];

    // Filter only allowed fields
    const updates = {};
    Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
            updates[key] = req.body[key];
        }
    });

    const profile = await Profile.findOneAndUpdate(
        { user: req.userId },
        updates,
        {
            new: true,
            runValidators: true
        }
    );

    if (!profile) {
        return next(new ErrorResponse('Profile not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: profile
    });
});

/**
 * @desc    Update user account info (name, email)
 * @route   PUT /api/user/account
 * @access  Private
 */
exports.updateAccount = asyncHandler(async (req, res, next) => {
    const { name, email } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Account updated successfully',
        data: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
});
