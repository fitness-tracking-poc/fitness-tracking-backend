// const Meal = require('../models/Meal');
// const asyncHandler = require('../utils/asyncHandler');
// const ErrorResponse = require('../utils/ErrorResponse');

// /**
//  * @desc    Add a meal
//  * @route   POST /api/meals
//  * @access  Private
//  */
// exports.addMeal = asyncHandler(async (req, res, next) => {
//     const { mealType, foodItems, calories, date, notes } = req.body;

//     if (!mealType) {
//         return next(new ErrorResponse('Please specify meal type', 400));
//     }

//     if (!foodItems || foodItems.length === 0) {
//         return next(new ErrorResponse('Please add at least one food item', 400));
//     }

//     // Validate meal type time restrictions
//     const mealDate = date ? new Date(date) : new Date();
//     const hour = mealDate.getHours();
//     const today = new Date();
//     const isToday = mealDate.toDateString() === today.toDateString();

//     let validTime = false;
//     // Only enforce strict time windows for today's meals
//     // Allow more flexibility for logging past meals
//     if (isToday) {
//         switch (mealType.toLowerCase()) {
//             case 'breakfast':
//                 validTime = hour >= 6 && hour <= 11;
//                 break;
//             case 'brunch':
//                 validTime = hour >= 10 && hour <= 14;
//                 break;
//             case 'lunch':
//                 validTime = hour >= 11 && hour <= 15;
//                 break;
//             case 'dinner':
//                 validTime = hour >= 17 && hour <= 23;
//                 break;
//             case 'snack':
//                 validTime = true;
//                 break;
//             default:
//                 return next(new ErrorResponse('Invalid meal type. Must be breakfast, brunch, lunch, dinner, or snack', 400));
//         }
//     } else {
//         // For past meals, allow any reasonable time (6 AM - 11 PM)
//         validTime = hour >= 6 && hour <= 23;
//     }

//     if (!validTime) {
//         const timeRanges = {
//             breakfast: '6:00 AM to 11:00 AM',
//             brunch: '10:00 AM to 2:00 PM',
//             lunch: '11:00 AM to 3:00 PM',
//             dinner: '5:00 PM to 11:00 PM',
//             snack: 'anytime'
//         };
//         const mealTypeKey = mealType.toLowerCase();
//         const range = isToday ? timeRanges[mealTypeKey] : '6:00 AM to 11:00 PM (past meals)';
//         return next(new ErrorResponse(`${mealType} can only be logged between ${range}`, 400));
//     }

//     const meal = await Meal.create({
//         user: req.userId,
//         mealType,
//         foodItems,
//         calories,
//         date: mealDate,
//         notes
//     });

//     res.status(201).json({
//         success: true,
//         message: 'Meal added successfully',
//         data: meal
//     });
// });

// /**
//  * @desc    Get all meals
//  * @route   GET /api/meals
//  * @access  Private
//  */
// exports.getMeals = asyncHandler(async (req, res, next) => {
//     const { startDate, endDate } = req.query;

//     let query = { user: req.userId };

//     if (startDate && endDate) {
//         query.date = {
//             $gte: new Date(startDate),
//             $lte: new Date(endDate)
//         };
//     }

//     const meals = await Meal.find(query).sort({ date: -1 });

//     res.status(200).json({
//         success: true,
//         count: meals.length,
//         data: meals
//     });
// });

// /**
//  * @desc    Get today's meals
//  * @route   GET /api/meals/today
//  * @access  Private
//  */
// exports.getTodayMeals = asyncHandler(async (req, res, next) => {
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     const meals = await Meal.find({
//         user: req.userId,
//         date: { $gte: startOfDay, $lte: endOfDay }
//     }).sort({ date: -1 });

//     const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

//     res.status(200).json({
//         success: true,
//         count: meals.length,
//         data: {
//             meals,
//             totalCalories
//         }
//     });
// });

// /**
//  * @desc    Get meal by ID
//  * @route   GET /api/meals/:id
//  * @access  Private
//  */
// exports.getMeal = asyncHandler(async (req, res, next) => {
//     const meal = await Meal.findById(req.params.id);

//     if (!meal) {
//         return next(new ErrorResponse('Meal not found', 404));
//     }

//     // Check ownership
//     if (meal.user.toString() !== req.userId) {
//         return next(new ErrorResponse('Not authorized to access this meal', 403));
//     }

//     res.status(200).json({
//         success: true,
//         data: meal
//     });
// });

// /**
//  * @desc    Update a meal
//  * @route   PUT /api/meals/:id
//  * @access  Private
//  */
// exports.updateMeal = asyncHandler(async (req, res, next) => {
//     let meal = await Meal.findById(req.params.id);

//     if (!meal) {
//         return next(new ErrorResponse('Meal not found', 404));
//     }

//     // Check ownership
//     if (meal.user.toString() !== req.userId) {
//         return next(new ErrorResponse('Not authorized to update this meal', 403));
//     }

//     meal = await Meal.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         {
//             new: true,
//             runValidators: true
//         }
//     );

//     res.status(200).json({
//         success: true,
//         message: 'Meal updated successfully',
//         data: meal
//     });
// });

// /**
//  * @desc    Delete a meal
//  * @route   DELETE /api/meals/:id
//  * @access  Private
//  */
// exports.deleteMeal = asyncHandler(async (req, res, next) => {
//     const meal = await Meal.findById(req.params.id);

//     if (!meal) {
//         return next(new ErrorResponse('Meal not found', 404));
//     }

//     // Check ownership
//     if (meal.user.toString() !== req.userId) {
//         return next(new ErrorResponse('Not authorized to delete this meal', 403));
//     }

//     await meal.deleteOne();

//     res.status(200).json({
//         success: true,
//         message: 'Meal deleted successfully'
//     });
// });

const Meal = require('../models/Meal');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

const IST_OFFSET_MINUTES = 330; // UTC + 5:30

exports.addMeal = asyncHandler(async (req, res, next) => {
    const { mealType, foodItems, calories, date, notes } = req.body;

    if (!mealType) {
        return next(new ErrorResponse('Please specify meal type', 400));
    }

    if (!foodItems || foodItems.length === 0) {
        return next(new ErrorResponse('Please add at least one food item', 400));
    }

    let mealDate;

    // ✅ Step 1: Validate date (allow past and today, block future)
    if (date) {
        mealDate = new Date(date);

        if (isNaN(mealDate.getTime())) {
            return next(new ErrorResponse('Invalid date format', 400));
        }

        const now = new Date();
        const mealDay = new Date(mealDate.getFullYear(), mealDate.getMonth(), mealDate.getDate());
        const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (mealDay > todayDay) {
            return next(new ErrorResponse('Meal date cannot be in the future', 400));
        }
    } else {
        mealDate = new Date();
    }

    // ✅ Step 2: Get IST hour properly (convert UTC → IST safely)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const utcTime = mealDate.getTime(); // what JS thinks is UTC
    const istTime = utcTime + istOffset;
    const mealDateIST = new Date(istTime);

    const nowIST = new Date(Date.now() + istOffset);
    const hour = mealDateIST.getHours();
    const isToday = mealDateIST.toDateString() === nowIST.toDateString();

    // ✅ Step 3: Validate time ranges (IST based)
    let validTime = false;

    if (isToday) {
        switch (mealType.toLowerCase()) {
            case 'breakfast':
                validTime = hour >= 6 && hour <= 11;
                break;
            case 'brunch':
                validTime = hour >= 10 && hour <= 14;
                break;
            case 'lunch':
                validTime = hour >= 11 && hour <= 15;
                break;
            case 'dinner':
                validTime = hour >= 17 && hour <= 23;
                break;
            case 'snack':
                validTime = true;
                break;
            default:
                return next(
                    new ErrorResponse(
                        'Invalid meal type. Must be breakfast, brunch, lunch, dinner, or snack',
                        400
                    )
                );
        }
    } else {
        validTime = hour >= 6 && hour <= 23;
    }

    if (!validTime) {
        const timeRanges = {
            breakfast: '6:00 AM to 11:00 AM',
            brunch: '10:00 AM to 2:00 PM',
            lunch: '11:00 AM to 3:00 PM',
            dinner: '5:00 PM to 11:00 PM',
            snack: 'anytime',
        };
        const mealTypeKey = mealType.toLowerCase();
        const range = isToday ? timeRanges[mealTypeKey] : '6:00 AM to 11:00 PM (past meals)';
        return next(new ErrorResponse(`${mealType} can only be logged between ${range}`, 400));
    }

    // ✅ Step 4: Store the original date (for consistency)
    const meal = await Meal.create({
        user: req.userId,
        mealType,
        foodItems,
        calories,
        date: mealDate,
        notes,
    });

    res.status(201).json({
        success: true,
        message: 'Meal added successfully',
        data: meal,
    });
});



exports.getMeals = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    let query = { user: req.userId };

    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const meals = await Meal.find(query).sort({ date: -1 });

    res.status(200).json({
        success: true,
        count: meals.length,
        data: meals
    });
});

exports.getTodayMeals = asyncHandler(async (req, res, next) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
        user: req.userId,
        date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ date: -1 });

    const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

    res.status(200).json({
        success: true,
        count: meals.length,
        data: {
            meals,
            totalCalories
        }
    });
});

exports.getMeal = asyncHandler(async (req, res, next) => {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
        return next(new ErrorResponse('Meal not found', 404));
    }

    if (meal.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to access this meal', 403));
    }

    res.status(200).json({
        success: true,
        data: meal
    });
});

exports.updateMeal = asyncHandler(async (req, res, next) => {
    let meal = await Meal.findById(req.params.id);

    if (!meal) {
        return next(new ErrorResponse('Meal not found', 404));
    }

    if (meal.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to update this meal', 403));
    }

    // Validate date if user is trying to change it (current or past DATE only)
    if (req.body.date) {
        const newDate = new Date(req.body.date);

        if (isNaN(newDate.getTime())) {
            return next(new ErrorResponse('Invalid date format', 400));
        }

        const now = new Date();

        const mealDay = new Date(
            newDate.getFullYear(),
            newDate.getMonth(),
            newDate.getDate()
        );
        const todayDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        if (mealDay > todayDay) {
            return next(new ErrorResponse('Meal date cannot be in the future', 400));
        }
    }

    meal = await Meal.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
        message: 'Meal updated successfully',
        data: meal
    });
});

exports.deleteMeal = asyncHandler(async (req, res, next) => {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
        return next(new ErrorResponse('Meal not found', 404));
    }

    if (meal.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to delete this meal', 403));
    }

    await meal.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Meal deleted successfully'
    });
});
