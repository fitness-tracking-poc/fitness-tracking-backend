const HealthMetric = require('../models/HealthMetric');
const Profile = require('../models/Profile');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * Health Analysis Utilities
 */

// Blood Pressure Analysis
const analyzeBP = (systolic, diastolic) => {
    if (systolic > 180 || diastolic > 120) {
        return {
            category: 'Hypertensive Crisis',
            status: 'danger',
            interpretation: `Your blood pressure of ${systolic}/${diastolic} mmHg is dangerously high. This is a medical emergency. Seek immediate medical attention.`,
            recommendations: [
                'Seek emergency medical care immediately',
                'Do not wait to see if your pressure comes down on its own',
                'Call emergency services if experiencing chest pain, shortness of breath, or vision changes'
            ]
        };
    } else if (systolic >= 140 || diastolic >= 90) {
        return {
            category: 'Hypertension Stage 2',
            status: 'danger',
            interpretation: `Your blood pressure of ${systolic}/${diastolic} mmHg indicates Stage 2 Hypertension. This requires medical intervention.`,
            recommendations: [
                'Consult with a healthcare provider as soon as possible',
                'Medication may be necessary',
                'Reduce sodium intake to less than 1,500mg per day',
                'Exercise regularly (150 minutes per week)',
                'Limit alcohol consumption',
                'Monitor blood pressure daily'
            ]
        };
    } else if (systolic >= 130 || diastolic >= 80) {
        return {
            category: 'Hypertension Stage 1',
            status: 'warning',
            interpretation: `Your blood pressure of ${systolic}/${diastolic} mmHg indicates Stage 1 Hypertension. Lifestyle changes are recommended.`,
            recommendations: [
                'Schedule a check-up with your doctor',
                'Reduce sodium intake to less than 2,300mg per day',
                'Exercise regularly (150 minutes per week)',
                'Maintain a healthy weight',
                'Limit alcohol and quit smoking',
                'Monitor blood pressure weekly'
            ]
        };
    } else if (systolic >= 120 && diastolic < 80) {
        return {
            category: 'Elevated',
            status: 'warning',
            interpretation: `Your blood pressure of ${systolic}/${diastolic} mmHg is elevated. Take action now to prevent progression to hypertension.`,
            recommendations: [
                'Adopt heart-healthy eating habits (DASH diet)',
                'Increase physical activity',
                'Reduce sodium intake',
                'Manage stress through relaxation techniques',
                'Monitor blood pressure monthly'
            ]
        };
    } else {
        return {
            category: 'Normal',
            status: 'normal',
            interpretation: `Your blood pressure of ${systolic}/${diastolic} mmHg is in the normal range. Keep up the good work!`,
            recommendations: [
                'Maintain a healthy lifestyle',
                'Continue regular exercise',
                'Eat a balanced diet',
                'Monitor blood pressure periodically'
            ]
        };
    }
};

// Blood Sugar Analysis
const analyzeBloodSugar = (value, isFasting = true) => {
    if (isFasting) {
        if (value >= 126) {
            return {
                category: 'Diabetes',
                riskLevel: 'High',
                status: 'danger',
                interpretation: `Your fasting blood glucose level of ${value} mg/dL indicates diabetes. This requires medical attention.`,
                recommendations: [
                    'Consult with a healthcare provider immediately',
                    'Get an HbA1c test to confirm diagnosis',
                    'Discuss treatment options including medication',
                    'Monitor blood sugar regularly',
                    'Follow a diabetes-friendly diet',
                    'Exercise regularly to improve insulin sensitivity'
                ]
            };
        } else if (value >= 100) {
            return {
                category: 'Prediabetes',
                riskLevel: 'Moderate',
                status: 'warning',
                interpretation: `Your fasting blood glucose level of ${value} mg/dL falls in the prediabetes range (100-125 mg/dL). This means your blood sugar is higher than normal but not high enough to be classified as diabetes.`,
                recommendations: [
                    'Schedule an HbA1c test with your doctor',
                    'Aim for 5-10% weight loss if overweight',
                    'Exercise at least 150 minutes per week',
                    'Reduce intake of sugary foods and refined carbs',
                    'Increase fiber intake (whole grains, vegetables)',
                    'Monitor blood sugar monthly'
                ]
            };
        } else {
            return {
                category: 'Normal',
                riskLevel: 'Low',
                status: 'normal',
                interpretation: `Your fasting blood glucose level of ${value} mg/dL is in the normal range (less than 100 mg/dL).`,
                recommendations: [
                    'Maintain a balanced diet',
                    'Continue regular physical activity',
                    'Monitor blood sugar annually',
                    'Maintain a healthy weight'
                ]
            };
        }
    } else {
        // Random/non-fasting glucose
        if (value >= 200) {
            return {
                category: 'Diabetes',
                riskLevel: 'High',
                status: 'danger',
                interpretation: `Your random blood glucose level of ${value} mg/dL suggests diabetes, especially if accompanied by symptoms.`,
                recommendations: [
                    'Consult with a healthcare provider',
                    'Get a fasting glucose test for confirmation',
                    'Monitor for symptoms (increased thirst, frequent urination, fatigue)'
                ]
            };
        } else if (value >= 140) {
            return {
                category: 'Prediabetes',
                riskLevel: 'Moderate',
                status: 'warning',
                interpretation: `Your random blood glucose level of ${value} mg/dL is elevated. Consider getting a fasting glucose test.`,
                recommendations: [
                    'Schedule a fasting glucose test',
                    'Reduce sugar and refined carb intake',
                    'Increase physical activity'
                ]
            };
        } else {
            return {
                category: 'Normal',
                riskLevel: 'Low',
                status: 'normal',
                interpretation: `Your random blood glucose level of ${value} mg/dL appears normal.`,
                recommendations: [
                    'Maintain healthy eating habits',
                    'Continue regular exercise'
                ]
            };
        }
    }
};

// BMI Analysis
const analyzeBMI = (bmi) => {
    if (bmi >= 40) {
        return {
            category: 'Obese Class III (Severe)',
            status: 'danger',
            interpretation: `Your BMI of ${bmi} indicates severe obesity. This significantly increases health risks.`,
            recommendations: [
                'Consult with a healthcare provider about weight management',
                'Consider medical weight loss programs',
                'Discuss bariatric surgery options if appropriate',
                'Work with a registered dietitian',
                'Start with low-impact exercises (walking, swimming)',
                'Address underlying health conditions'
            ]
        };
    } else if (bmi >= 35) {
        return {
            category: 'Obese Class II',
            status: 'danger',
            interpretation: `Your BMI of ${bmi} indicates Class II obesity. Significant health risks are present.`,
            recommendations: [
                'Consult with a healthcare provider',
                'Create a structured weight loss plan',
                'Aim for gradual weight loss (1-2 lbs per week)',
                'Increase physical activity gradually',
                'Focus on portion control and nutrient-dense foods'
            ]
        };
    } else if (bmi >= 30) {
        return {
            category: 'Obese Class I',
            status: 'warning',
            interpretation: `Your BMI of ${bmi} indicates Class I obesity. Health risks are elevated.`,
            recommendations: [
                'Set realistic weight loss goals (5-10% of body weight)',
                'Exercise at least 150 minutes per week',
                'Reduce calorie intake by 500-750 calories per day',
                'Keep a food diary to track eating habits',
                'Consider working with a nutritionist'
            ]
        };
    } else if (bmi >= 25) {
        return {
            category: 'Overweight',
            status: 'warning',
            interpretation: `Your BMI of ${bmi} indicates you are overweight. Small lifestyle changes can help.`,
            recommendations: [
                'Aim for 5% weight loss as an initial goal',
                'Increase daily physical activity',
                'Choose whole foods over processed foods',
                'Practice portion control',
                'Stay hydrated and get adequate sleep'
            ]
        };
    } else if (bmi >= 18.5) {
        return {
            category: 'Normal Weight',
            status: 'normal',
            interpretation: `Your BMI of ${bmi} is in the healthy range. Maintain your current lifestyle.`,
            recommendations: [
                'Continue balanced eating habits',
                'Maintain regular physical activity',
                'Monitor weight periodically',
                'Focus on overall health, not just weight'
            ]
        };
    } else {
        return {
            category: 'Underweight',
            status: 'warning',
            interpretation: `Your BMI of ${bmi} indicates you are underweight. This may pose health risks.`,
            recommendations: [
                'Consult with a healthcare provider',
                'Increase calorie intake with nutrient-dense foods',
                'Eat more frequent, smaller meals',
                'Include healthy fats and proteins',
                'Rule out underlying medical conditions'
            ]
        };
    }
};

// Heart Rate Analysis
const analyzeHeartRate = (bpm) => {
    if (bpm <= 60) {
        return {
            category: 'Athlete/Excellent',
            status: 'normal',
            interpretation: `Your resting heart rate of ${bpm} bpm is excellent, typical of well-trained athletes.`,
            recommendations: [
                'Maintain your fitness routine',
                'Continue cardiovascular exercise',
                'Monitor for any sudden changes'
            ]
        };
    } else if (bpm <= 65) {
        return {
            category: 'Excellent',
            status: 'normal',
            interpretation: `Your resting heart rate of ${bpm} bpm is excellent.`,
            recommendations: [
                'Keep up your healthy lifestyle',
                'Continue regular exercise'
            ]
        };
    } else if (bpm <= 70) {
        return {
            category: 'Good',
            status: 'normal',
            interpretation: `Your resting heart rate of ${bpm} bpm is good.`,
            recommendations: [
                'Maintain regular cardiovascular exercise',
                'Continue healthy habits'
            ]
        };
    } else if (bpm <= 75) {
        return {
            category: 'Average',
            status: 'normal',
            interpretation: `Your resting heart rate of ${bpm} bpm is average.`,
            recommendations: [
                'Consider increasing cardiovascular exercise',
                'Aim for 150 minutes of moderate activity per week'
            ]
        };
    } else if (bpm <= 80) {
        return {
            category: 'Below Average',
            status: 'warning',
            interpretation: `Your resting heart rate of ${bpm} bpm is below average. Improving cardiovascular fitness could help.`,
            recommendations: [
                'Increase aerobic exercise (walking, jogging, cycling)',
                'Start slowly and build up gradually',
                'Aim for 30 minutes of activity most days'
            ]
        };
    } else {
        return {
            category: 'Poor',
            status: 'warning',
            interpretation: `Your resting heart rate of ${bpm} bpm is higher than ideal. This may indicate poor cardiovascular fitness or other issues.`,
            recommendations: [
                'Consult with a healthcare provider if consistently high',
                'Start a regular exercise program',
                'Reduce stress through relaxation techniques',
                'Limit caffeine and alcohol',
                'Ensure adequate sleep (7-9 hours)'
            ]
        };
    }
};

// Body Fat Percentage Analysis
const analyzeBodyFat = (percentage, gender) => {
    if (gender === 'male') {
        if (percentage < 6) {
            return {
                category: 'Essential Fat',
                status: 'warning',
                interpretation: `Your body fat percentage of ${percentage}% is very low. This may not be sustainable or healthy long-term.`,
                recommendations: ['Consult with a healthcare provider', 'Ensure adequate nutrition']
            };
        } else if (percentage <= 13) {
            return {
                category: 'Athletes',
                status: 'normal',
                interpretation: `Your body fat percentage of ${percentage}% is in the athletic range.`,
                recommendations: ['Maintain your fitness routine', 'Ensure adequate nutrition for performance']
            };
        } else if (percentage <= 17) {
            return {
                category: 'Fitness',
                status: 'normal',
                interpretation: `Your body fat percentage of ${percentage}% is in the fitness range.`,
                recommendations: ['Maintain healthy habits', 'Continue regular exercise']
            };
        } else if (percentage <= 24) {
            return {
                category: 'Average',
                status: 'normal',
                interpretation: `Your body fat percentage of ${percentage}% is average.`,
                recommendations: ['Consider increasing exercise', 'Focus on strength training']
            };
        } else {
            return {
                category: 'Above Average',
                status: 'warning',
                interpretation: `Your body fat percentage of ${percentage}% is above average.`,
                recommendations: ['Increase physical activity', 'Focus on both cardio and strength training', 'Review dietary habits']
            };
        }
    } else {
        // Female
        if (percentage < 14) {
            return {
                category: 'Essential Fat',
                status: 'warning',
                interpretation: `Your body fat percentage of ${percentage}% is very low. This may affect hormonal balance.`,
                recommendations: ['Consult with a healthcare provider', 'Ensure adequate nutrition']
            };
        } else if (percentage <= 20) {
            return {
                category: 'Athletes',
                status: 'normal',
                interpretation: `Your body fat percentage of ${percentage}% is in the athletic range.`,
                recommendations: ['Maintain your fitness routine', 'Ensure adequate nutrition']
            };
        } else if (percentage <= 24) {
            return {
                category: 'Fitness',
                status: 'normal',
                interpretation: `Your body fat percentage of ${percentage}% is in the fitness range.`,
                recommendations: ['Maintain healthy habits', 'Continue regular exercise']
            };
        } else if (percentage <= 31) {
            return {
                category: 'Average',
                status: 'normal',
                interpretation: `Your body fat percentage of ${percentage}% is average.`,
                recommendations: ['Consider increasing exercise', 'Focus on strength training']
            };
        } else {
            return {
                category: 'Above Average',
                status: 'warning',
                interpretation: `Your body fat percentage of ${percentage}% is above average.`,
                recommendations: ['Increase physical activity', 'Focus on both cardio and strength training', 'Review dietary habits']
            };
        }
    }
};

/**
 * @desc    Get comprehensive health analysis
 * @route   GET /api/health-analysis
 * @access  Private
 */
exports.getHealthAnalysis = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const days = parseInt(req.query.days) || 30;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get latest metrics for each type
    const metricTypes = ['blood_pressure', 'blood_sugar', 'bmi', 'heart_rate', 'weight', 'body_fat_percentage'];
    const latestMetrics = {};

    for (const type of metricTypes) {
        const metric = await HealthMetric.findOne({
            user: userId,
            metric_type: type
        }).sort({ measured_at: -1 });

        if (metric) {
            latestMetrics[type] = metric;
        }
    }

    // Get user profile for gender (needed for body fat analysis)
    const profile = await Profile.findOne({ user: userId });

    // Analyze each metric
    const analysis = {
        analyzedAt: new Date(),
        period: {
            days,
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        },
        metrics: {}
    };

    let warningCount = 0;
    let dangerCount = 0;

    // Blood Pressure
    if (latestMetrics.blood_pressure) {
        const bp = latestMetrics.blood_pressure.value;
        const bpAnalysis = analyzeBP(bp.systolic, bp.diastolic);
        analysis.metrics.bloodPressure = {
            latest: bp,
            measuredAt: latestMetrics.blood_pressure.measured_at,
            ...bpAnalysis
        };
        if (bpAnalysis.status === 'warning') warningCount++;
        if (bpAnalysis.status === 'danger') dangerCount++;
    }

    // Blood Sugar
    if (latestMetrics.blood_sugar) {
        const bs = latestMetrics.blood_sugar.value;
        const bsAnalysis = analyzeBloodSugar(bs.mg_dL, true); // Assume fasting by default
        analysis.metrics.bloodSugar = {
            latest: bs,
            measuredAt: latestMetrics.blood_sugar.measured_at,
            ...bsAnalysis
        };
        if (bsAnalysis.status === 'warning') warningCount++;
        if (bsAnalysis.status === 'danger') dangerCount++;
    }

    // BMI
    if (latestMetrics.bmi) {
        const bmi = latestMetrics.bmi.value.value;
        const bmiAnalysis = analyzeBMI(bmi);
        analysis.metrics.bmi = {
            latest: { value: bmi },
            measuredAt: latestMetrics.bmi.measured_at,
            ...bmiAnalysis
        };
        if (bmiAnalysis.status === 'warning') warningCount++;
        if (bmiAnalysis.status === 'danger') dangerCount++;
    }

    // Heart Rate
    if (latestMetrics.heart_rate) {
        const hr = latestMetrics.heart_rate.value;
        const hrAnalysis = analyzeHeartRate(hr.bpm);
        analysis.metrics.heartRate = {
            latest: hr,
            measuredAt: latestMetrics.heart_rate.measured_at,
            ...hrAnalysis
        };
        if (hrAnalysis.status === 'warning') warningCount++;
        if (hrAnalysis.status === 'danger') dangerCount++;
    }

    // Body Fat Percentage
    if (latestMetrics.body_fat_percentage && profile && profile.gender) {
        const bf = latestMetrics.body_fat_percentage.value;
        const bfAnalysis = analyzeBodyFat(bf.percentage, profile.gender);
        analysis.metrics.bodyFat = {
            latest: bf,
            measuredAt: latestMetrics.body_fat_percentage.measured_at,
            ...bfAnalysis
        };
        if (bfAnalysis.status === 'warning') warningCount++;
        if (bfAnalysis.status === 'danger') dangerCount++;
    }

    // Overall status
    if (dangerCount > 0) {
        analysis.overallStatus = 'danger';
        analysis.summary = `${dangerCount} critical metric${dangerCount > 1 ? 's' : ''} need immediate attention. Please consult a healthcare provider.`;
    } else if (warningCount > 0) {
        analysis.overallStatus = 'warning';
        analysis.summary = `${warningCount} metric${warningCount > 1 ? 's' : ''} need attention. Consider lifestyle modifications.`;
    } else {
        analysis.overallStatus = 'normal';
        analysis.summary = 'All monitored metrics are in healthy ranges. Keep up the good work!';
    }

    res.status(200).json({
        success: true,
        data: analysis
    });
});

/**
 * @desc    Get blood pressure analysis
 * @route   GET /api/health-analysis/blood-pressure
 * @access  Private
 */
exports.getBloodPressureAnalysis = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const days = parseInt(req.query.days) || 30;
    const includeHistory = req.query.includeHistory === 'true';

    // Get latest reading
    const latest = await HealthMetric.findOne({
        user: userId,
        metric_type: 'blood_pressure'
    }).sort({ measured_at: -1 });

    if (!latest) {
        return next(new ErrorResponse('No blood pressure data found', 404));
    }

    const analysis = analyzeBP(latest.value.systolic, latest.value.diastolic);

    const response = {
        latestReading: {
            systolic: latest.value.systolic,
            diastolic: latest.value.diastolic,
            measuredAt: latest.measured_at
        },
        ...analysis
    };

    // Add trend analysis if requested
    if (includeHistory) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const history = await HealthMetric.find({
            user: userId,
            metric_type: 'blood_pressure',
            measured_at: { $gte: startDate }
        }).sort({ measured_at: 1 });

        if (history.length > 0) {
            const systolicValues = history.map(h => h.value.systolic);
            const diastolicValues = history.map(h => h.value.diastolic);

            response.trend = {
                readings: history.length,
                systolic: {
                    average: Math.round(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length),
                    highest: Math.max(...systolicValues),
                    lowest: Math.min(...systolicValues)
                },
                diastolic: {
                    average: Math.round(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length),
                    highest: Math.max(...diastolicValues),
                    lowest: Math.min(...diastolicValues)
                },
                history: history.map(h => ({
                    systolic: h.value.systolic,
                    diastolic: h.value.diastolic,
                    measuredAt: h.measured_at
                }))
            };
        }
    }

    res.status(200).json({
        success: true,
        data: response
    });
});

/**
 * @desc    Get diabetes risk assessment
 * @route   GET /api/health-analysis/diabetes-risk
 * @access  Private
 */
exports.getDiabetesRiskAssessment = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const days = parseInt(req.query.days) || 30;
    const includeHistory = req.query.includeHistory === 'true';

    // Get latest reading
    const latest = await HealthMetric.findOne({
        user: userId,
        metric_type: 'blood_sugar'
    }).sort({ measured_at: -1 });

    if (!latest) {
        return next(new ErrorResponse('No blood sugar data found', 404));
    }

    const isFasting = req.query.type === 'fasting' || true; // Default to fasting
    const analysis = analyzeBloodSugar(latest.value.mg_dL, isFasting);

    const response = {
        latestReading: {
            value: latest.value.mg_dL,
            measuredAt: latest.measured_at,
            type: isFasting ? 'fasting' : 'random'
        },
        ...analysis
    };

    // Add trend analysis if requested
    if (includeHistory) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const history = await HealthMetric.find({
            user: userId,
            metric_type: 'blood_sugar',
            measured_at: { $gte: startDate }
        }).sort({ measured_at: 1 });

        if (history.length > 0) {
            const values = history.map(h => h.value.mg_dL);
            const avgValue = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

            // Determine trend direction
            let direction = 'stable';
            if (history.length >= 2) {
                const recent = values.slice(-3);
                const older = values.slice(0, 3);
                const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
                const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

                if (recentAvg > olderAvg + 5) direction = 'increasing';
                else if (recentAvg < olderAvg - 5) direction = 'decreasing';
            }

            response.trend = {
                average: avgValue,
                readings: history.length,
                direction,
                history: history.map(h => ({
                    value: h.value.mg_dL,
                    measuredAt: h.measured_at
                }))
            };
        }
    }

    res.status(200).json({
        success: true,
        data: response
    });
});

/**
 * @desc    Get BMI analysis
 * @route   GET /api/health-analysis/bmi
 * @access  Private
 */
exports.getBMIAnalysis = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const days = parseInt(req.query.days) || 30;
    const includeHistory = req.query.includeHistory === 'true';

    // Get latest BMI reading
    const latest = await HealthMetric.findOne({
        user: userId,
        metric_type: 'bmi'
    }).sort({ measured_at: -1 });

    if (!latest) {
        return next(new ErrorResponse('No BMI data found', 404));
    }

    const bmiValue = latest.value.value;
    const analysis = analyzeBMI(bmiValue);

    const response = {
        latestReading: {
            value: bmiValue,
            measuredAt: latest.measured_at
        },
        ...analysis
    };

    // Add weight trend if available
    if (includeHistory) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const weightHistory = await HealthMetric.find({
            user: userId,
            metric_type: 'weight',
            measured_at: { $gte: startDate }
        }).sort({ measured_at: 1 });

        if (weightHistory.length > 0) {
            const weights = weightHistory.map(w => w.value.kg);
            const avgWeight = Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10;

            // Determine trend
            let direction = 'stable';
            if (weightHistory.length >= 2) {
                const firstWeight = weights[0];
                const lastWeight = weights[weights.length - 1];
                const change = lastWeight - firstWeight;

                if (change > 1) direction = 'increasing';
                else if (change < -1) direction = 'decreasing';
            }

            response.weightTrend = {
                average: avgWeight,
                readings: weightHistory.length,
                direction,
                change: weights.length >= 2 ? Math.round((weights[weights.length - 1] - weights[0]) * 10) / 10 : 0,
                history: weightHistory.map(w => ({
                    weight: w.value.kg,
                    measuredAt: w.measured_at
                }))
            };
        }
    }

    res.status(200).json({
        success: true,
        data: response
    });
});

/**
 * @desc    Get heart rate analysis
 * @route   GET /api/health-analysis/heart-rate
 * @access  Private
 */
exports.getHeartRateAnalysis = asyncHandler(async (req, res, next) => {
    const userId = req.userId;
    const days = parseInt(req.query.days) || 30;
    const includeHistory = req.query.includeHistory === 'true';

    // Get latest reading
    const latest = await HealthMetric.findOne({
        user: userId,
        metric_type: 'heart_rate'
    }).sort({ measured_at: -1 });

    if (!latest) {
        return next(new ErrorResponse('No heart rate data found', 404));
    }

    const bpm = latest.value.bpm;
    const analysis = analyzeHeartRate(bpm);

    const response = {
        latestReading: {
            bpm,
            measuredAt: latest.measured_at
        },
        ...analysis
    };

    // Add trend analysis if requested
    if (includeHistory) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const history = await HealthMetric.find({
            user: userId,
            metric_type: 'heart_rate',
            measured_at: { $gte: startDate }
        }).sort({ measured_at: 1 });

        if (history.length > 0) {
            const values = history.map(h => h.value.bpm);
            const avgBpm = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

            response.trend = {
                average: avgBpm,
                readings: history.length,
                highest: Math.max(...values),
                lowest: Math.min(...values),
                history: history.map(h => ({
                    bpm: h.value.bpm,
                    measuredAt: h.measured_at
                }))
            };
        }
    }

    res.status(200).json({
        success: true,
        data: response
    });
});
