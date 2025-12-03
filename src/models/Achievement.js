const mongoose = require('mongoose');

/**
 * Achievement Schema
 * Tracks user achievements, badges, and streaks
 */
const AchievementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Badge information
    badgeId: {
        type: String,
        required: true
    },
    badgeType: {
        type: String,
        required: true,
        enum: [
            'streak_milestone',      // Consecutive days of activity
            'goal_completion',       // Completed a goal
            'distance_milestone',    // Total distance covered
            'exercise_milestone',    // Total exercises logged
            'meal_milestone',        // Total meals logged
            'weight_milestone',      // Weight goal achieved
            'consistency_badge',     // Regular activity over time
            'early_bird',           // Morning workouts
            'night_owl',            // Evening workouts
            'hydration_hero',       // Water intake goals
            'step_master',          // Step count achievements
            'first_achievement',    // First goal completed
            'comeback_kid',         // Returned after inactivity
            'perfectionist',        // Perfect week/month
            'custom'
        ]
    },
    name: {
        type: String,
        required: [true, 'Please provide badge name'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    icon: {
        type: String, // Emoji or icon identifier
        default: '🏆'
    },
    tier: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
        default: 'bronze'
    },
    // Achievement criteria
    criteriaValue: {
        type: Number, // e.g., 7 for 7-day streak
        required: true
    },
    earnedAt: {
        type: Date,
        default: Date.now
    },
    // Related data
    relatedGoalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Goal'
    },
    relatedData: {
        type: mongoose.Schema.Types.Mixed // Additional context data
    },
    // Display
    isVisible: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
AchievementSchema.index({ user: 1, earnedAt: -1 });
AchievementSchema.index({ user: 1, badgeType: 1 });
AchievementSchema.index({ user: 1, badgeId: 1 }, { unique: true });

/**
 * Streak Schema
 * Tracks user activity streaks
 */
const StreakSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Current streaks
    currentStreak: {
        count: {
            type: Number,
            default: 0
        },
        startDate: {
            type: Date
        },
        lastActivityDate: {
            type: Date
        }
    },
    longestStreak: {
        count: {
            type: Number,
            default: 0
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        }
    },
    // Activity tracking
    totalActiveDays: {
        type: Number,
        default: 0
    },
    // Specific streak types
    exerciseStreak: {
        current: {
            type: Number,
            default: 0
        },
        longest: {
            type: Number,
            default: 0
        },
        lastDate: {
            type: Date
        }
    },
    mealLoggingStreak: {
        current: {
            type: Number,
            default: 0
        },
        longest: {
            type: Number,
            default: 0
        },
        lastDate: {
            type: Date
        }
    },
    goalProgressStreak: {
        current: {
            type: Number,
            default: 0
        },
        longest: {
            type: Number,
            default: 0
        },
        lastDate: {
            type: Date
        }
    },
    // Milestones achieved
    streakMilestonesAchieved: [{
        days: Number,
        achievedDate: Date
    }]
}, {
    timestamps: true
});

// Method to update streak
StreakSchema.methods.checkAndUpdateStreak = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActivity = this.currentStreak.lastActivityDate 
        ? new Date(this.currentStreak.lastActivityDate) 
        : null;
    
    if (lastActivity) {
        lastActivity.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
            // Already updated today
            return { streakUpdated: false, currentStreak: this.currentStreak.count };
        } else if (daysDiff === 1) {
            // Consecutive day
            this.currentStreak.count += 1;
            this.currentStreak.lastActivityDate = today;
            this.totalActiveDays += 1;
            
            // Update longest streak if necessary
            if (this.currentStreak.count > this.longestStreak.count) {
                this.longestStreak.count = this.currentStreak.count;
                this.longestStreak.startDate = this.currentStreak.startDate;
                this.longestStreak.endDate = today;
            }
        } else {
            // Streak broken
            this.currentStreak.count = 1;
            this.currentStreak.startDate = today;
            this.currentStreak.lastActivityDate = today;
            this.totalActiveDays += 1;
        }
    } else {
        // First activity
        this.currentStreak.count = 1;
        this.currentStreak.startDate = today;
        this.currentStreak.lastActivityDate = today;
        this.totalActiveDays = 1;
        
        if (this.longestStreak.count === 0) {
            this.longestStreak.count = 1;
            this.longestStreak.startDate = today;
            this.longestStreak.endDate = today;
        }
    }
    
    return this.save();
};

// Static method to check streak milestones
StreakSchema.statics.checkStreakMilestones = function(streakCount) {
    const milestones = [7, 14, 30, 60, 100, 180, 365];
    return milestones.filter(m => m === streakCount);
};

const Achievement = mongoose.model('Achievement', AchievementSchema);
const Streak = mongoose.model('Streak', StreakSchema);

module.exports = { Achievement, Streak };
