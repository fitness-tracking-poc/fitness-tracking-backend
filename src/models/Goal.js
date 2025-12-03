const mongoose = require('mongoose');

/**
 * Goal Schema
 * Tracks user-defined fitness goals with progress monitoring
 */
const GoalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    goalType: {
        type: String,
        required: [true, 'Please specify goal type'],
        enum: [
            'weight_loss',           // Lose X kg
            'weight_gain',           // Gain X kg
            'muscle_gain',           // Increase muscle mass
            'body_fat_reduction',    // Reduce body fat %
            'distance_running',      // Run X km total or per session
            'exercise_duration',     // Exercise X minutes per week
            'exercise_frequency',    // Exercise X times per week
            'steps_daily',           // Walk X steps per day
            'water_intake',          // Drink X liters per day
            'sleep_hours',           // Sleep X hours per night
            'calorie_intake',        // Consume X calories per day
            'strength_milestone',    // Lift X kg in specific exercise
            'custom'                 // User-defined goal
        ]
    },
    title: {
        type: String,
        required: [true, 'Please provide a goal title'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    // Target values
    targetValue: {
        type: Number,
        required: [true, 'Please specify target value']
    },
    currentValue: {
        type: Number,
        default: 0
    },
    startValue: {
        type: Number,
        default: 0
    },
    unit: {
        type: String,
        required: [true, 'Please specify unit'],
        enum: ['kg', 'lbs', 'km', 'miles', 'minutes', 'hours', 'times', 'steps', 'liters', 'calories', 'percentage', 'custom']
    },
    customUnit: {
        type: String,
        trim: true,
        maxlength: [20, 'Custom unit cannot exceed 20 characters']
    },
    // Timeline
    startDate: {
        type: Date,
        default: Date.now
    },
    targetDate: {
        type: Date,
        required: [true, 'Please specify target date']
    },
    completedDate: {
        type: Date
    },
    // Status
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned', 'paused'],
        default: 'active'
    },
    // Progress tracking
    progressPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    // Milestones
    milestones: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        targetValue: {
            type: Number,
            required: true
        },
        achieved: {
            type: Boolean,
            default: false
        },
        achievedDate: {
            type: Date
        }
    }],
    // Reminder settings
    reminderEnabled: {
        type: Boolean,
        default: true
    },
    reminderTime: {
        type: String, // Format: "HH:MM" (e.g., "09:00")
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
    },
    reminderDays: {
        type: [String],
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    // Progress history (snapshots)
    progressHistory: [{
        value: {
            type: Number,
            required: true
        },
        recordedAt: {
            type: Date,
            default: Date.now
        },
        note: String
    }],
    // Metadata
    category: {
        type: String,
        enum: ['fitness', 'nutrition', 'health', 'lifestyle'],
        default: 'fitness'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
GoalSchema.index({ user: 1, status: 1, targetDate: 1 });
GoalSchema.index({ user: 1, goalType: 1 });

// Calculate progress percentage before saving
GoalSchema.pre('save', function(next) {
    if (this.targetValue && this.startValue !== undefined && this.currentValue !== undefined) {
        const totalProgress = this.targetValue - this.startValue;
        const currentProgress = this.currentValue - this.startValue;
        
        if (totalProgress !== 0) {
            this.progressPercentage = Math.min(100, Math.max(0, (currentProgress / totalProgress) * 100));
        }
        
        // Auto-complete goal if target reached
        if (this.progressPercentage >= 100 && this.status === 'active') {
            this.status = 'completed';
            this.completedDate = new Date();
        }
    }
    next();
});

// Method to update progress
GoalSchema.methods.updateProgress = function(newValue, note = '') {
    this.currentValue = newValue;
    this.progressHistory.push({
        value: newValue,
        recordedAt: new Date(),
        note
    });
    
    // Check and update milestone achievements
    this.milestones.forEach(milestone => {
        if (!milestone.achieved && this.currentValue >= milestone.targetValue) {
            milestone.achieved = true;
            milestone.achievedDate = new Date();
        }
    });
    
    return this.save();
};

// Method to add milestone
GoalSchema.methods.addMilestone = function(title, targetValue) {
    this.milestones.push({
        title,
        targetValue,
        achieved: this.currentValue >= targetValue,
        achievedDate: this.currentValue >= targetValue ? new Date() : null
    });
    return this.save();
};

module.exports = mongoose.model('Goal', GoalSchema);
