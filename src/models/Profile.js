const mongoose = require('mongoose');

/**
 * Profile Schema
 * Stores user's fitness profile and health data
 */
const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Basic Information
    age: {
        type: Number,
        min: [13, 'Age must be at least 13'],
        max: [120, 'Please provide a valid age']
    },
    birthDate: {
        type: Date,
        required: [true, 'Please provide your birth date']
    },
    gender: {
        type: String,
        required: [true, 'Please select your gender'],
        enum: ['male', 'female', 'other']
    },
    sex: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    height: {
        type: Number,
        min: [50, 'Please provide a valid height']
    },
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    weight: {
        type: Number,
        min: [20, 'Please provide a valid weight']
    },
    fitnessGoal: {
        type: String,
        enum: ['lose_weight', 'gain_muscle', 'maintain']
    },
    activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
        default: 'moderate'
    },
    // Additional preferences
    dietaryPreferences: {
        type: [String],
        enum: ['vegetarian', 'vegan', 'keto', 'paleo', 'none'],
        default: ['none']
    },
    waterGoal: {
        type: Number,
        default: 8 // 8 glasses per day
    },
    stepsGoal: {
        type: Number,
        default: 10000
    },
    sleepGoal: {
        type: Number,
        default: 8 // 8 hours
    },
    // Insurance Information
    insurance: {
        provider: String,
        policyNumber: String,
        groupNumber: String,
        memberID: String
    },
    // Health Tracking Scores
    preventionScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    monitoringScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    actionScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', ProfileSchema);
