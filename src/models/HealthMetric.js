const mongoose = require('mongoose');

/**
 * HealthMetric Schema
 * Generic health metrics tracking system
 */
const HealthMetricSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    metric_type: {
        type: String,
        required: [true, 'Please specify metric type'],
        enum: ['blood_pressure', 'heart_rate', 'weight', 'blood_sugar', 'steps', 'sleep_hours', 'water_intake', 'body_fat_percentage', 'muscle_mass', 'bmi']
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // JSON object that varies by metric_type
        required: [true, 'Please provide metric value']
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    measured_at: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
HealthMetricSchema.index({ user: 1, metric_type: 1, measured_at: -1 });

// Validation for value object based on metric_type
HealthMetricSchema.pre('save', function(next) {
    const validMetricTypes = {
        blood_pressure: ['systolic', 'diastolic'],
        heart_rate: ['bpm'],
        weight: ['kg'],
        blood_sugar: ['mg_dL'],
        steps: ['count'],
        sleep_hours: ['hours'],
        water_intake: ['glasses'],
        body_fat_percentage: ['percentage'],
        muscle_mass: ['kg'],
        bmi: ['value']
    };

    const requiredFields = validMetricTypes[this.metric_type];
    if (!requiredFields) {
        return next(new Error(`Invalid metric type: ${this.metric_type}`));
    }

    // Check if value is an object and has required fields
    if (typeof this.value !== 'object' || this.value === null) {
        return next(new Error('Value must be an object'));
    }

    for (const field of requiredFields) {
        if (!(field in this.value)) {
            return next(new Error(`Missing required field '${field}' for metric type '${this.metric_type}'`));
        }
        if (typeof this.value[field] !== 'number') {
            return next(new Error(`Field '${field}' must be a number`));
        }
    }

    next();
});

module.exports = mongoose.model('HealthMetric', HealthMetricSchema);
// const mongoose = require('mongoose');

// /**
//  * HealthMetric Schema
//  * Generic health metrics tracking system
//  */
// const HealthMetricSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     metric_type: {
//         type: String,
//         required: [true, 'Please specify metric type'],
//         enum: [
//             'blood_pressure',
//             'heart_rate',
//             'weight',
//             'blood_sugar',
//             'steps',
//             'sleep_hours',
//             'water_intake',
//             'body_fat_percentage',
//             'muscle_mass',
//             'bmi'
//         ]
//     },
//     value: {
//         type: mongoose.Schema.Types.Mixed, // JSON object that varies by metric_type
//         required: [true, 'Please provide metric value']
//     },
//     measured_at: {
//         type: Date,
//         default: Date.now,
//         required: true
//     },
//     // 🔹 NEW: optional note for history entries (water/sleep/steps etc.)
//     note: {
//         type: String,
//         trim: true,
//         maxlength: [300, 'Note cannot exceed 300 characters']
//     }
// }, {
//     timestamps: true
// });

// // Index for faster queries
// HealthMetricSchema.index({ user: 1, metric_type: 1, measured_at: -1 });

// // Validation for value object based on metric_type
// HealthMetricSchema.pre('save', function(next) {
//     const validMetricTypes = {
//         blood_pressure: ['systolic', 'diastolic'],
//         heart_rate: ['bpm'],
//         weight: ['kg'],
//         blood_sugar: ['mg_dL'],
//         steps: ['count'],
//         sleep_hours: ['hours'],
//         water_intake: ['glasses'],
//         body_fat_percentage: ['percentage'],
//         muscle_mass: ['kg'],
//         bmi: ['value']
//     };

//     const requiredFields = validMetricTypes[this.metric_type];
//     if (!requiredFields) {
//         return next(new Error(`Invalid metric type: ${this.metric_type}`));
//     }

//     // Check if value is an object and has required fields
//     if (typeof this.value !== 'object' || this.value === null) {
//         return next(new Error('Value must be an object'));
//     }

//     for (const field of requiredFields) {
//         if (!(field in this.value)) {
//             return next(new Error(
//                 `Missing required field '${field}' for metric type '${this.metric_type}'`
//             ));
//         }
//         if (typeof this.value[field] !== 'number') {
//             return next(new Error(`Field '${field}' must be a number`));
//         }
//     }

//     next();
// });

// module.exports = mongoose.model('HealthMetric', HealthMetricSchema);
