const mongoose = require('mongoose');

/**
 * Exercise Schema
 * Simple exercise recording
 */
const ExerciseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exerciseName: {
        type: String,
        required: [true, 'Please provide exercise name'],
        trim: true
    },
    duration: {
        type: Number, // in minutes
        min: [1, 'Duration must be at least 1 minute']
        // Optional
    },
    sets: {
        type: Number,
        min: [1, 'Sets must be at least 1']
        // Optional
    },
    reps: {
        type: Number,
        min: [1, 'Reps must be at least 1']
        // Optional
    },
    weight: {
        type: Number, // in kg
        min: [0, 'Weight cannot be negative']
        // Optional
    },
    distance: {
        type: Number, // in km
        min: [0, 'Distance cannot be negative']
        // Optional
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Index for faster queries
ExerciseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Exercise', ExerciseSchema);
