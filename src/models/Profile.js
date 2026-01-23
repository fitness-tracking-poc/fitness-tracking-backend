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
    },
    // Personalized RDA (Recommended Daily Allowance)
    personalizedRDA: {
        calories: { type: Number, default: 2000 },
        bmr: { type: Number },
        tdee: { type: Number },
        macros: {
            protein: { type: Number, default: 50 },
            carbohydrates: { type: Number, default: 300 },
            fats: { type: Number, default: 65 },
            fiber: { type: Number, default: 28 },
            sugar: { type: Number, default: 50 },
            saturatedFat: { type: Number, default: 20 },
            transFat: { type: Number, default: 0 },
            cholesterol: { type: Number, default: 300 }
        },
        vitamins: {
            vitaminA: { type: Number, default: 900 },
            vitaminC: { type: Number, default: 90 },
            vitaminD: { type: Number, default: 15 },
            vitaminE: { type: Number, default: 15 },
            vitaminK: { type: Number, default: 120 },
            vitaminB1: { type: Number, default: 1.2 },
            vitaminB2: { type: Number, default: 1.3 },
            vitaminB3: { type: Number, default: 16 },
            vitaminB6: { type: Number, default: 1.3 },
            vitaminB12: { type: Number, default: 2.4 },
            folate: { type: Number, default: 400 }
        },
        minerals: {
            calcium: { type: Number, default: 1000 },
            iron: { type: Number, default: 8 },
            magnesium: { type: Number, default: 400 },
            phosphorus: { type: Number, default: 700 },
            potassium: { type: Number, default: 3400 },
            sodium: { type: Number, default: 2300 },
            zinc: { type: Number, default: 11 },
            copper: { type: Number, default: 0.9 },
            manganese: { type: Number, default: 2.3 },
            selenium: { type: Number, default: 55 }
        },
        calculatedAt: { type: Date },
        basedOn: {
            age: Number,
            gender: String,
            weight: Number,
            height: Number,
            activityLevel: String,
            fitnessGoal: String
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', ProfileSchema);
