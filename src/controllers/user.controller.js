const Profile = require('../models/Profile');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const { calculatePersonalizedRDA } = require('../utils/rdaCalculator');

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

    // Check if any RDA-affecting fields are being updated
    const rdaAffectingFields = ['age', 'gender', 'height', 'weight', 'fitnessGoal', 'activityLevel'];
    const shouldRecalculateRDA = rdaAffectingFields.some(field => updates.hasOwnProperty(field));

    // Get current profile to merge with updates for RDA calculation
    const currentProfile = await Profile.findOne({ user: req.userId });
    if (!currentProfile) {
        return next(new ErrorResponse('Profile not found', 404));
    }

    // Recalculate RDA if relevant fields changed
    if (shouldRecalculateRDA) {
        const profileForRDA = {
            age: updates.age || currentProfile.age,
            gender: updates.gender || currentProfile.gender,
            weight: updates.weight || currentProfile.weight,
            height: updates.height || currentProfile.height,
            fitnessGoal: updates.fitnessGoal || currentProfile.fitnessGoal,
            activityLevel: updates.activityLevel || currentProfile.activityLevel
        };
        updates.personalizedRDA = calculatePersonalizedRDA(profileForRDA);
    }

    const profile = await Profile.findOneAndUpdate(
        { user: req.userId },
        updates,
        {
            new: true,
            runValidators: true
        }
    );

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

/**
 * @desc    Get user's personalized RDA
 * @route   GET /api/user/rda
 * @access  Private
 */
exports.getRDA = asyncHandler(async (req, res, next) => {
    const profile = await Profile.findOne({ user: req.userId });

    if (!profile) {
        return next(new ErrorResponse('Profile not found', 404));
    }

    // If RDA doesn't exist, calculate it
    if (!profile.personalizedRDA || !profile.personalizedRDA.calculatedAt) {
        const newRDA = calculatePersonalizedRDA({
            age: profile.age,
            gender: profile.gender,
            weight: profile.weight,
            height: profile.height,
            fitnessGoal: profile.fitnessGoal,
            activityLevel: profile.activityLevel
        });

        profile.personalizedRDA = newRDA;
        await profile.save();
    }

    res.status(200).json({
        success: true,
        data: profile.personalizedRDA
    });
});

/**
 * @desc    Recalculate user's personalized RDA
 * @route   POST /api/user/rda/recalculate
 * @access  Private
 */
exports.recalculateRDA = asyncHandler(async (req, res, next) => {
    const profile = await Profile.findOne({ user: req.userId });

    if (!profile) {
        return next(new ErrorResponse('Profile not found', 404));
    }

    const newRDA = calculatePersonalizedRDA({
        age: profile.age,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height,
        fitnessGoal: profile.fitnessGoal,
        activityLevel: profile.activityLevel
    });

    profile.personalizedRDA = newRDA;
    await profile.save();

    res.status(200).json({
        success: true,
        message: 'RDA recalculated successfully',
        data: profile.personalizedRDA
    });
});
