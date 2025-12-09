// const mongoose = require('mongoose');

// /**
//  * Meal Schema
//  * Simple meal recording with manual calorie entry
//  */
// const MealSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     mealType: {
//         type: String,
//         required: [true, 'Please specify meal type'],
//         enum: ['breakfast', 'brunch', 'lunch', 'dinner', 'snack']
//     },
//     foodItems: [{
//         name: {
//             type: String,
//             required: [true, 'Please provide food name']
//         },
//         quantity: {
//             type: String, // e.g., "1 bowl", "2 pieces", "100g"
//             default: '1 serving'
//         }
//     }],
//     calories: {
//         type: Number,
//         min: [0, 'Calories cannot be negative']
//         // Optional - manually entered by user
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
// MealSchema.index({ user: 1, date: -1 });

// module.exports = mongoose.model('Meal', MealSchema);

const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mealType: {
        type: String,
        required: [true, 'Please specify meal type'],
        enum: ['breakfast', 'brunch', 'lunch', 'dinner', 'snack']
    },
    foodItems: [{
        name: {
            type: String,
            required: [true, 'Please provide food name']
        },
        quantity: {
            type: String,
            default: '1 serving'
        }
    }],
    calories: {
        type: Number,
        min: [0, 'Calories cannot be negative']
    },
    date: {
        type: Date,
        default: Date.now,
        // Meal date must be current or past, not future
        validate: {
            validator: function (value) {
                if (!value) return true;
                const now = new Date();
                return value.getTime() <= now.getTime();
            },
            message: 'Meal date cannot be in the future'
        }
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

MealSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Meal', MealSchema);
