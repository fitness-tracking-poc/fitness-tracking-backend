const HealthMetric = require('../models/HealthMetric');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @desc    Add a health metric
 * @route   POST /api/health-metrics
 * @access  Private
 */
exports.addHealthMetric = asyncHandler(async (req, res, next) => {
    const { metric_type, value, measured_at } = req.body;

    if (!metric_type) {
        return next(new ErrorResponse('Please specify metric type', 400));
    }

    if (!value) {
        return next(new ErrorResponse('Please provide metric value', 400));
    }

    const healthMetric = await HealthMetric.create({
        user: req.userId,
        metric_type,
        value,
        measured_at: measured_at ? new Date(measured_at) : new Date(),
        notes: notes
    });

    res.status(201).json({
        success: true,
        message: 'Health metric added successfully',
        data: healthMetric
    });
});
/**
 * @desc    Get history for a specific metric (Like getMeals)
 * @route   GET /api/health-metrics/history/:type
 * @access  Private
 */
exports.getMetricHistory = asyncHandler(async (req, res, next) => {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let query = { 
        user: req.userId,
        metric_type: type 
    };

    // Date filtering (Same logic as your Meals code)
    if (startDate && endDate) {
        query.measured_at = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const history = await HealthMetric.find(query).sort({ measured_at: -1 });

    res.status(200).json({
        success: true,
        count: history.length,
        data: history
    });
});

/**
 * @desc    Get today's summary for a specific metric (Like getTodayMeals)
 * @route   GET /api/health-metrics/today/:type
 * @access  Private
 */
exports.getTodayMetric = asyncHandler(async (req, res, next) => {
    const { type } = req.params;
    
    // Calculate start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const metrics = await HealthMetric.find({
        user: req.userId,
        metric_type: type,
        measured_at: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ measured_at: -1 });

    let total = 0;

   
    metrics.forEach(metric => {
        if (type === 'steps' && metric.value.count) {
            total += metric.value.count;
        } else if (type === 'water_intake' && metric.value.glasses) {
            total += metric.value.glasses;
        } else if (type === 'sleep_hours' && metric.value.hours) {
            total += metric.value.hours;
        }
    });

    res.status(200).json({
        success: true,
        count: metrics.length,
        data: {
            metrics,  
            total      
        }
    });
});
/**
 * @desc    Get health metrics
 * @route   GET /api/health-metrics
 * @access  Private
 */
exports.getHealthMetrics = asyncHandler(async (req, res, next) => {
    const { metric_type, start, end } = req.query;

    let query = { user: req.userId };

    if (metric_type) {
        query.metric_type = metric_type;
    }

    if (start || end) {
        query.measured_at = {};
        if (start) query.measured_at.$gte = new Date(start);
        if (end) {
            const endDate = new Date(end);
            endDate.setHours(23, 59, 59, 999);
            query.measured_at.$lte = endDate;
        }

    
        if (start && end && new Date(start) > new Date(end)) {
            return next(new ErrorResponse('Start date cannot be after end date', 400));
        }
    }

    const metrics = await HealthMetric.find(query).sort({ measured_at: -1 });

    res.status(200).json({
        success: true,
        count: metrics.length,
        data: metrics
    });
});

/**
 * @desc    Update health metric
 * @route   PUT /api/health-metrics/:id
 * @access  Private
 */
exports.updateHealthMetric = asyncHandler(async (req, res, next) => {
    const { metric_type, value, measured_at } = req.body;

    let metric = await HealthMetric.findById(req.params.id);

    if (!metric) {
        return next(new ErrorResponse('Health metric not found', 404));
    }

 
    if (metric.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to update this metric', 403));
    }

    if (metric_type) metric.metric_type = metric_type;
    if (value) metric.value = value;
    if (measured_at) metric.measured_at = new Date(measured_at);

    await metric.save();

    res.status(200).json({
        success: true,
        message: 'Health metric updated successfully',
        data: metric
    });
});

/**
 * @desc    Delete health metric
 * @route   DELETE /api/health-metrics/:id
 * @access  Private
 */
exports.deleteHealthMetric = asyncHandler(async (req, res, next) => {
    const metric = await HealthMetric.findById(req.params.id);

    if (!metric) {
        return next(new ErrorResponse('Health metric not found', 404));
    }

  
    if (metric.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to delete this metric', 403));
    }

    await metric.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Health metric deleted successfully'
    });
});

/**
 * @desc    Get health metrics report
 * @route   GET /api/health-metrics/report
 * @access  Private
 */
exports.getHealthMetricsReport = asyncHandler(async (req, res, next) => {
    const { metric_type, range } = req.query;

    if (!metric_type) {
        return next(new ErrorResponse('Please specify metric_type', 400));
    }

    if (!range || !['daily', 'weekly', 'monthly'].includes(range)) {
        return next(new ErrorResponse('Please specify range as daily, weekly, or monthly', 400));
    }

  
    const now = new Date();
    let startDate;
    let endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999); // End of current day

    switch (range) {
        case 'daily':
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'weekly':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 6); // Last 7 days including today
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'monthly':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 29); // Last 30 days including today
            startDate.setHours(0, 0, 0, 0);
            break;
    }


    const metrics = await HealthMetric.find({
        user: req.userId,
        metric_type,
        measured_at: { $gte: startDate, $lte: endDate }
    }).sort({ measured_at: 1 });

    if (metrics.length === 0) {
        return res.status(200).json({
            success: true,
            data: {
                period: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                    range
                },
                summary: {
                    count: 0,
                    message: 'No data available for this period'
                }
            }
        });
    }


    let summary = {
        count: metrics.length,
        dataPoints: metrics.map(m => ({
            id: m._id,
            value: m.value,
            measured_at: m.measured_at
        }))
    };

    if (metric_type === 'blood_pressure') {
      
        const systolicValues = metrics.map(m => m.value.systolic);
        const diastolicValues = metrics.map(m => m.value.diastolic);

        summary.systolic = {
            average: Math.round(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length),
            highest: Math.max(...systolicValues),
            lowest: Math.min(...systolicValues)
        };

        summary.diastolic = {
            average: Math.round(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length),
            highest: Math.max(...diastolicValues),
            lowest: Math.min(...diastolicValues)
        };
    } else {
        
        const fieldName = Object.keys(metrics[0].value)[0];
        const values = metrics.map(m => m.value[fieldName]);

        summary[fieldName] = {
            average: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
            highest: Math.max(...values),
            lowest: Math.min(...values)
        };
    }

    res.status(200).json({
        success: true,
        data: {
            period: {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                range
            },
            summary
        }
    });
});
// const HealthMetric = require('../models/HealthMetric');
// const asyncHandler = require('../utils/asyncHandler');
// const ErrorResponse = require('../utils/ErrorResponse');

// /**
//  * @desc    Add a health metric (water, sleep, steps, etc.)
//  * @route   POST /api/health-metrics
//  * @access  Private
//  */
// exports.addHealthMetric = asyncHandler(async (req, res, next) => {
//     const { metric_type, value, measured_at, note } = req.body;

//     if (!metric_type) {
//         return next(new ErrorResponse('Please specify metric type', 400));
//     }

//     if (!value) {
//         return next(new ErrorResponse('Please provide metric value', 400));
//     }

//     const healthMetric = await HealthMetric.create({
//         user: req.userId,
//         metric_type,
//         value,
//         measured_at: measured_at ? new Date(measured_at) : new Date(),
//         note: note || undefined
//     });

//     res.status(201).json({
//         success: true,
//         message: 'Health metric added successfully',
//         data: healthMetric
//     });
// });

// /**
//  * @desc    Get health metrics (HISTORY LIST)
//  *          Supports filters: metric_type, start, end
//  * @route   GET /api/health-metrics
//  * @access  Private
//  *
//  * Example:
//  *  /api/health-metrics?metric_type=water_intake&start=2025-01-01&end=2025-01-31
//  */
// exports.getHealthMetrics = asyncHandler(async (req, res, next) => {
//     const { metric_type, start, end } = req.query;

//     let query = { user: req.userId };

//     if (metric_type) {
//         query.metric_type = metric_type;
//     }

//     if (start || end) {
//         query.measured_at = {};
//         if (start) query.measured_at.$gte = new Date(start);
//         if (end) {
//             const endDate = new Date(end);
//             endDate.setHours(23, 59, 59, 999); // Include the entire end day
//             query.measured_at.$lte = endDate;
//         }

//         // Validate date range
//         if (start && end && new Date(start) > new Date(end)) {
//             return next(new ErrorResponse('Start date cannot be after end date', 400));
//         }
//     }

//     const metrics = await HealthMetric.find(query).sort({ measured_at: -1 });

//     res.status(200).json({
//         success: true,
//         count: metrics.length,
//         data: metrics
//     });
// });

// /**
//  * @desc    Update health metric (e.g. edit note, value, time)
//  * @route   PUT /api/health-metrics/:id
//  * @access  Private
//  */
// exports.updateHealthMetric = asyncHandler(async (req, res, next) => {
//     const { metric_type, value, measured_at, note } = req.body;

//     let metric = await HealthMetric.findById(req.params.id);

//     if (!metric) {
//         return next(new ErrorResponse('Health metric not found', 404));
//     }

//     // Check ownership
//     if (metric.user.toString() !== req.userId) {
//         return next(new ErrorResponse('Not authorized to update this metric', 403));
//     }

//     // Update fields
//     if (metric_type) metric.metric_type = metric_type;
//     if (value) metric.value = value;
//     if (measured_at) metric.measured_at = new Date(measured_at);
//     if (note !== undefined) metric.note = note; // allow clearing note too

//     await metric.save();

//     res.status(200).json({
//         success: true,
//         message: 'Health metric updated successfully',
//         data: metric
//     });
// });

// /**
//  * @desc    Delete health metric
//  * @route   DELETE /api/health-metrics/:id
//  * @access  Private
//  */
// exports.deleteHealthMetric = asyncHandler(async (req, res, next) => {
//     const metric = await HealthMetric.findById(req.params.id);

//     if (!metric) {
//         return next(new ErrorResponse('Health metric not found', 404));
//     }

//     // Check ownership
//     if (metric.user.toString() !== req.userId) {
//         return next(new ErrorResponse('Not authorized to delete this metric', 403));
//     }

//     await metric.deleteOne();

//     res.status(200).json({
//         success: true,
//         message: 'Health metric deleted successfully'
//     });
// });

// /**
//  * @desc    Get health metrics report (for charts/aggregates)
//  * @route   GET /api/health-metrics/report
//  * @access  Private
//  */
// exports.getHealthMetricsReport = asyncHandler(async (req, res, next) => {
//     const { metric_type, range } = req.query;

//     if (!metric_type) {
//         return next(new ErrorResponse('Please specify metric_type', 400));
//     }

//     if (!range || !['daily', 'weekly', 'monthly'].includes(range)) {
//         return next(new ErrorResponse('Please specify range as daily, weekly, or monthly', 400));
//     }

//     // Calculate date range
//     const now = new Date();
//     let startDate;
//     let endDate = new Date(now);
//     endDate.setHours(23, 59, 59, 999); // End of current day

//     switch (range) {
//         case 'daily':
//             startDate = new Date(now);
//             startDate.setHours(0, 0, 0, 0);
//             break;
//         case 'weekly':
//             startDate = new Date(now);
//             startDate.setDate(now.getDate() - 6); // Last 7 days including today
//             startDate.setHours(0, 0, 0, 0);
//             break;
//         case 'monthly':
//             startDate = new Date(now);
//             startDate.setDate(now.getDate() - 29); // Last 30 days including today
//             startDate.setHours(0, 0, 0, 0);
//             break;
//     }

//     // Get metrics for the period
//     const metrics = await HealthMetric.find({
//         user: req.userId,
//         metric_type,
//         measured_at: { $gte: startDate, $lte: endDate }
//     }).sort({ measured_at: 1 });

//     if (metrics.length === 0) {
//         return res.status(200).json({
//             success: true,
//             data: {
//                 period: {
//                     start: startDate.toISOString(),
//                     end: endDate.toISOString(),
//                     range
//                 },
//                 summary: {
//                     count: 0,
//                     message: 'No data available for this period'
//                 }
//             }
//         });
//     }

//     // Calculate aggregates based on metric type
//     let summary = {
//         count: metrics.length,
//         dataPoints: metrics.map(m => ({
//             id: m._id,
//             value: m.value,
//             measured_at: m.measured_at,
//             note: m.note
//         }))
//     };

//     if (metric_type === 'blood_pressure') {
//         // Calculate systolic and diastolic stats
//         const systolicValues = metrics.map(m => m.value.systolic);
//         const diastolicValues = metrics.map(m => m.value.diastolic);

//         summary.systolic = {
//             average: Math.round(
//                 systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length
//             ),
//             highest: Math.max(...systolicValues),
//             lowest: Math.min(...systolicValues)
//         };

//         summary.diastolic = {
//             average: Math.round(
//                 diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length
//             ),
//             highest: Math.max(...diastolicValues),
//             lowest: Math.min(...diastolicValues)
//         };
//     } else {
//         // For single-value metrics
//         const fieldName = Object.keys(metrics[0].value)[0];
//         const values = metrics.map(m => m.value[fieldName]);

//         summary[fieldName] = {
//             average: Math.round(
//                 (values.reduce((a, b) => a + b, 0) / values.length) * 100
//             ) / 100,
//             highest: Math.max(...values),
//             lowest: Math.min(...values)
//         };
//     }

//     res.status(200).json({
//         success: true,
//         data: {
//             period: {
//                 start: startDate.toISOString(),
//                 end: endDate.toISOString(),
//                 range
//             },
//             summary
//         }
//     });
// });
