const User = require('../models/User');
const Profile = require('../models/Profile');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const OTPService = require('../services/OTPService');

/**
 * @desc    Send OTP to mobile number
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
exports.sendOTP = asyncHandler(async (req, res, next) => {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
        return next(new ErrorResponse('Please provide a mobile number', 400));
    }

    // Check if user exists
    let user = await User.findOne({ mobileNumber }).select('+otp +otpExpiry');

    // Generate OTP
    const otp = OTPService.generateOTP();
    const otpExpiry = OTPService.getOTPExpiry();

    if (user) {
        // Update existing user's OTP
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
    } else {
        // Create temporary user record with OTP (will be completed during registration)
        user = await User.create({
            name: 'Temporary', // Will be updated during registration
            mobileNumber,
            otp,
            otpExpiry,
            isVerified: false
        });
    }

    // Send OTP via SMS
    const sent = await OTPService.sendOTP(mobileNumber, otp);

    if (!sent) {
        return next(new ErrorResponse('Failed to send OTP', 500));
    }

    res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: {
            mobileNumber,
            expiresIn: '10 minutes'
        }
    });
});

/**
 * @desc    Verify OTP and register user with profile
 * @route   POST /api/auth/verify-register
 * @access  Public
 */
exports.verifyOTPAndRegister = asyncHandler(async (req, res, next) => {
    const { mobileNumber, otp, name, profile } = req.body;

    // Validate required fields
    if (!mobileNumber || !otp || !name || !profile) {
        return next(new ErrorResponse('Please provide all required fields', 400));
    }

    // Validate profile required fields
    const { age, gender, birthDate, height, weight, fitnessGoal } = profile;
    if (!gender || !birthDate) {
        return next(new ErrorResponse('Please provide gender and birth date', 400));
    }

    // Find user with OTP
    const user = await User.findOne({ mobileNumber }).select('+otp +otpExpiry');

    if (!user) {
        return next(new ErrorResponse('Please request OTP first', 400));
    }

    // Verify OTP
    const isValid = OTPService.verifyOTP(user.otp, user.otpExpiry, otp);

    if (!isValid) {
        return next(new ErrorResponse('Invalid or expired OTP', 401));
    }

    // Check if user already has a profile (already registered)
    const existingProfile = await Profile.findOne({ user: user._id });
    if (existingProfile) {
        return next(new ErrorResponse('User already registered. Please login.', 400));
    }

    // Update user details
    user.name = name;
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Create profile
    const userProfile = await Profile.create({
        user: user._id,
        age,
        gender,
        height,
        weight,
        fitnessGoal,
        activityLevel: profile.activityLevel || 'moderate',
        birthDate: profile.birthDate,
        bloodType: profile.bloodType,
        dietaryPreferences: profile.dietaryPreferences,
        waterGoal: profile.waterGoal,
        stepsGoal: profile.stepsGoal,
        sleepGoal: profile.sleepGoal
    });

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
            user: {
                id: user._id,
                name: user.name,
                mobileNumber: user.mobileNumber,
                isVerified: user.isVerified
            },
            profile: userProfile,
            token
        }
    });
});

/**
 * @desc    Verify OTP and login user
 * @route   POST /api/auth/verify-login
 * @access  Public
 */
exports.verifyOTPAndLogin = asyncHandler(async (req, res, next) => {
    const { mobileNumber, otp } = req.body;

    // Validate input
    if (!mobileNumber || !otp) {
        return next(new ErrorResponse('Please provide mobile number and OTP', 400));
    }

    // Find user with OTP
    const user = await User.findOne({ mobileNumber }).select('+otp +otpExpiry');

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    // Check if user is verified (registered)
    if (!user.isVerified) {
        return next(new ErrorResponse('Please complete registration first', 400));
    }

    // Verify OTP
    const isValid = OTPService.verifyOTP(user.otp, user.otpExpiry, otp);

    if (!isValid) {
        return next(new ErrorResponse('Invalid or expired OTP', 401));
    }

    // Check if user is active
    if (!user.isActive) {
        return next(new ErrorResponse('Account is deactivated', 401));
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Get user profile
    const profile = await Profile.findOne({ user: user._id });

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user._id,
                name: user.name,
                mobileNumber: user.mobileNumber,
                isVerified: user.isVerified
            },
            profile,
            token
        }
    });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.userId).populate('profile');

    res.status(200).json({
        success: true,
        data: user
    });
});
