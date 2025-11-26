const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

/**
 * User Schema
 * Handles authentication via mobile number and OTP
 */
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    mobileNumber: {
        type: String,
        required: [true, 'Please provide a mobile number'],
        unique: true,
        trim: true,
        match: [
            /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
            'Please provide a valid mobile number'
        ]
    },
    otp: {
        type: String,
        select: false // Don't return OTP by default
    },
    otpExpiry: {
        type: Date,
        select: false // Don't return OTP expiry by default
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate for profile
UserSchema.virtual('profile', {
    ref: 'Profile',
    localField: '_id',
    foreignField: 'user',
    justOne: true
});

// Method to generate JWT token
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

module.exports = mongoose.model('User', UserSchema);
