// const mongoose = require('mongoose');

// /**
//  * Exercise Schema
//  * Simple exercise recording
//  */
// const ExerciseSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     exerciseName: {
//         type: String,
//         required: [true, 'Please provide exercise name'],
//         trim: true
//     },
//     duration: {
//         type: Number, // in minutes
//         min: [1, 'Duration must be at least 1 minute']
//         // Optional
//     },
//     sets: {
//         type: Number,
//         min: [1, 'Sets must be at least 1']
//         // Optional
//     },
//     reps: {
//         type: Number,
//         min: [1, 'Reps must be at least 1']
//         // Optional
//     },
//     weight: {
//         type: Number, // in kg
//         min: [0, 'Weight cannot be negative']
//         // Optional
//     },
//     distance: {
//         type: Number, // in km
//         min: [0, 'Distance cannot be negative']
//         // Optional
//     },
//     date: {
//         type: Date,
//         default: Date.now
//     },
//     notes: {
//         type: String,
//         maxlength: [500, 'Notes cannot exceed 500 characters']
//     }
// }, {
//     timestamps: true
// });

// // Index for faster queries
// ExerciseSchema.index({ user: 1, date: -1 });

// module.exports = mongoose.model('Exercise', ExerciseSchema);

const mongoose = require('mongoose');

/**
 * Exercise Schema
 * Supports both cardio and strength exercises.
 * (Flexible & error-free version)
 */
const ExerciseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Exercise name (mandatory)
    exerciseName: {
        type: String,
        required: [true, 'Please provide exercise name'],
        trim: true
    },

    // Optional: Duration of workout (in minutes)
    duration: {
        type: Number,
        default: 0,
        min: [0, 'Duration cannot be negative']
    },

    // Optional: Number of sets (for strength training)
    sets: {
        type: Number,
        default: 0,
        min: [0, 'Sets cannot be negative']
    },

    // Optional: Number of reps (for strength training)
    reps: {
        type: Number,
        default: 0,
        min: [0, 'Reps cannot be negative']
    },

    // Optional: Weight used (in kilograms)
    weight: {
        type: Number,
        default: 0,
        min: [0, 'Weight cannot be negative']
    },

    // Optional: Distance covered (in kilometers)
    distance: {
        type: Number,
        default: 0,
        min: [0, 'Distance cannot be negative']
    },

    // Workout date (defaults to current)
    date: {
        type: Date,
        default: Date.now
    },

    // Optional notes for exercise
    notes: {
        type: String,
        default: '',
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true // adds createdAt and updatedAt automatically
});

// Index for faster user/date queries
ExerciseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Exercise', ExerciseSchema);
