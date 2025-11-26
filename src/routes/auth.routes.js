const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTPAndRegister, verifyOTPAndLogin, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation middleware
const sendOTPValidation = [
    body('mobileNumber')
        .trim()
        .notEmpty()
        .withMessage('Mobile number is required')
        .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
        .withMessage('Please provide a valid mobile number')
];

const registerValidation = [
    body('mobileNumber')
        .trim()
        .notEmpty()
        .withMessage('Mobile number is required'),
    body('otp')
        .trim()
        .notEmpty()
        .withMessage('OTP is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required'),
    body('profile.age')
        .isInt({ min: 13, max: 120 })
        .withMessage('Please provide a valid age'),
    body('profile.gender')
        .isIn(['male', 'female', 'other'])
        .withMessage('Please select a valid gender'),
    body('profile.height')
        .isFloat({ min: 50 })
        .withMessage('Please provide a valid height in cm'),
    body('profile.weight')
        .isFloat({ min: 20 })
        .withMessage('Please provide a valid weight in kg'),
    body('profile.fitnessGoal')
        .isIn(['lose_weight', 'gain_muscle', 'maintain'])
        .withMessage('Please select a valid fitness goal')
];

const loginValidation = [
    body('mobileNumber')
        .trim()
        .notEmpty()
        .withMessage('Mobile number is required'),
    body('otp')
        .trim()
        .notEmpty()
        .withMessage('OTP is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits')
];

// Routes
router.post('/send-otp', sendOTPValidation, sendOTP);
router.post('/verify-register', registerValidation, verifyOTPAndRegister);
router.post('/verify-login', loginValidation, verifyOTPAndLogin);
router.get('/me', protect, getMe);

module.exports = router;
