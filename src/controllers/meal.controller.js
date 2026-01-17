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
const fetchWithRetry = require('../utils/fetchWithRetry');

/**
 * Helper function to get nutrition data from Gemini AI
 */
const getNutritionFromAI = async (foodName, quantity) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
    
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

    const userPrompt = `
You are a professional nutritionist and food database expert.
Analyze the following food item and provide detailed nutritional information:

Food Item: ${foodName}
Quantity: ${quantity}

Provide comprehensive nutritional data including all macronutrients and micronutrients.
Be as accurate as possible based on standard nutritional databases (USDA, etc.).
If the quantity is vague (e.g., "1 serving"), use standard serving sizes.
All values should be numeric (use 0 if data is not available or negligible).
`;

    const nutritionSchema = {
        type: "OBJECT",
        properties: {
            macros: {
                type: "OBJECT",
                properties: {
                    protein: { type: "NUMBER", description: "Protein in grams" },
                    carbohydrates: { type: "NUMBER", description: "Carbohydrates in grams" },
                    fats: { type: "NUMBER", description: "Total fats in grams" },
                    fiber: { type: "NUMBER", description: "Dietary fiber in grams" },
                    sugar: { type: "NUMBER", description: "Total sugars in grams" },
                    saturatedFat: { type: "NUMBER", description: "Saturated fat in grams" },
                    transFat: { type: "NUMBER", description: "Trans fat in grams" },
                    cholesterol: { type: "NUMBER", description: "Cholesterol in mg" }
                },
                required: ["protein", "carbohydrates", "fats", "fiber", "sugar", "saturatedFat", "transFat", "cholesterol"]
            },
            vitamins: {
                type: "OBJECT",
                properties: {
                    vitaminA: { type: "NUMBER", description: "Vitamin A in mcg" },
                    vitaminC: { type: "NUMBER", description: "Vitamin C in mg" },
                    vitaminD: { type: "NUMBER", description: "Vitamin D in mcg" },
                    vitaminE: { type: "NUMBER", description: "Vitamin E in mg" },
                    vitaminK: { type: "NUMBER", description: "Vitamin K in mcg" },
                    vitaminB1: { type: "NUMBER", description: "Thiamine in mg" },
                    vitaminB2: { type: "NUMBER", description: "Riboflavin in mg" },
                    vitaminB3: { type: "NUMBER", description: "Niacin in mg" },
                    vitaminB6: { type: "NUMBER", description: "Vitamin B6 in mg" },
                    vitaminB12: { type: "NUMBER", description: "Vitamin B12 in mcg" },
                    folate: { type: "NUMBER", description: "Folate in mcg" }
                },
                required: ["vitaminA", "vitaminC", "vitaminD", "vitaminE", "vitaminK", "vitaminB1", "vitaminB2", "vitaminB3", "vitaminB6", "vitaminB12", "folate"]
            },
            minerals: {
                type: "OBJECT",
                properties: {
                    calcium: { type: "NUMBER", description: "Calcium in mg" },
                    iron: { type: "NUMBER", description: "Iron in mg" },
                    magnesium: { type: "NUMBER", description: "Magnesium in mg" },
                    phosphorus: { type: "NUMBER", description: "Phosphorus in mg" },
                    potassium: { type: "NUMBER", description: "Potassium in mg" },
                    sodium: { type: "NUMBER", description: "Sodium in mg" },
                    zinc: { type: "NUMBER", description: "Zinc in mg" },
                    copper: { type: "NUMBER", description: "Copper in mg" },
                    manganese: { type: "NUMBER", description: "Manganese in mg" },
                    selenium: { type: "NUMBER", description: "Selenium in mcg" }
                },
                required: ["calcium", "iron", "magnesium", "phosphorus", "potassium", "sodium", "zinc", "copper", "manganese", "selenium"]
            },
            totalCalories: { type: "NUMBER", description: "Total calories (kcal)" },
            servingSize: { type: "STRING", description: "Standard serving size description" }
        },
        required: ["macros", "vitamins", "minerals", "totalCalories", "servingSize"]
    };

    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: nutritionSchema
        },
        systemInstruction: {
            parts: [{ text: "You are a professional nutritionist AI that provides accurate, detailed nutritional information based on standard food databases." }]
        }
    };

    try {
        const apiResponse = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await apiResponse.json();

        if (result.error) {
            console.error("Gemini API Error:", result.error.message);
            throw new Error("AI service failed to generate nutrition data");
        }

        const candidate = result.candidates?.[0];
        if (candidate && candidate.content?.parts?.[0]?.text) {
            const jsonText = candidate.content.parts[0].text;
            return JSON.parse(jsonText);
        } else {
            throw new Error("AI returned an unusable or empty response");
        }
    } catch (error) {
        console.error("Error getting nutrition from AI:", error);
        throw error;
    }
};

/**
 * Helper function to calculate total nutrition from food items
 */
const calculateTotalNutrition = (foodItems) => {
    const total = {
        macros: {
            protein: 0, carbohydrates: 0, fats: 0, fiber: 0,
            sugar: 0, saturatedFat: 0, transFat: 0, cholesterol: 0
        },
        vitamins: {
            vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
            vitaminB1: 0, vitaminB2: 0, vitaminB3: 0, vitaminB6: 0, vitaminB12: 0, folate: 0
        },
        minerals: {
            calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, potassium: 0,
            sodium: 0, zinc: 0, copper: 0, manganese: 0, selenium: 0
        },
        totalCalories: 0,
        servingSize: 'Total meal'
    };

    foodItems.forEach(item => {
        if (item.nutrition) {
            // Sum macros
            Object.keys(total.macros).forEach(key => {
                total.macros[key] += item.nutrition.macros?.[key] || 0;
            });
            // Sum vitamins
            Object.keys(total.vitamins).forEach(key => {
                total.vitamins[key] += item.nutrition.vitamins?.[key] || 0;
            });
            // Sum minerals
            Object.keys(total.minerals).forEach(key => {
                total.minerals[key] += item.nutrition.minerals?.[key] || 0;
            });
            // Sum calories
            total.totalCalories += item.nutrition.totalCalories || 0;
        }
    });

    return total;
};

/**
 * @desc    Add a meal with AI-generated nutrition data
 * @route   POST /api/meals
 * @access  Private
 */
exports.addMeal = asyncHandler(async (req, res, next) => {
    const { mealType, foodItems, date, notes } = req.body;

    if (!mealType) {
        return next(new ErrorResponse('Please specify meal type', 400));
    }

    if (!foodItems || foodItems.length === 0) {
        return next(new ErrorResponse('Please add at least one food item', 400));
    }

    let mealDate;
    if (date) {
        mealDate = new Date(date);
        if (isNaN(mealDate.getTime())) {
            return next(new ErrorResponse('Invalid date format', 400));
        }
    } else {
        mealDate = new Date();
    }

    // Get nutrition data for each food item using AI
    const enrichedFoodItems = [];
    for (const item of foodItems) {
        try {
            const nutrition = await getNutritionFromAI(item.name, item.quantity || '1 serving');
            enrichedFoodItems.push({
                name: item.name,
                quantity: item.quantity || '1 serving',
                nutrition: nutrition
            });
        } catch (error) {
            console.error(`Error getting nutrition for ${item.name}:`, error);
            return next(new ErrorResponse(`Failed to get nutrition data for ${item.name}. Please try again.`, 500));
        }
    }

    // Calculate total nutrition for the meal
    const totalNutrition = calculateTotalNutrition(enrichedFoodItems);

    const meal = await Meal.create({
        user: req.userId,
        mealType,
        foodItems: enrichedFoodItems,
        totalNutrition: totalNutrition,
        calories: totalNutrition.totalCalories,
        date: mealDate,
        notes: notes || '',
    });

    res.status(201).json({
        success: true,
        message: 'Meal added successfully with nutrition data',
        data: meal,
    });
});

/**
 * @desc    Get all meals
 * @route   GET /api/meals
 * @access  Private
 */
exports.getMeals = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    const query = { user: req.userId };

    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    }

    const meals = await Meal.find(query).sort({ date: -1 });

    res.status(200).json({
        success: true,
        count: meals.length,
        data: meals,
    });
});

/**
 * @desc    Get today's meals
 * @route   GET /api/meals/today
 * @access  Private
 */
exports.getTodayMeals = asyncHandler(async (req, res, next) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
        user: req.userId,
        date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ date: -1 });

    const totalCalories = meals.reduce(
        (sum, meal) => sum + (meal.calories || 0),
        0
    );

    res.status(200).json({
        success: true,
        count: meals.length,
        data: {
            meals,
            totalCalories,
        },
    });
});

/**
 * @desc    Get single meal by ID
 * @route   GET /api/meals/:id
 * @access  Private
 */
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
        data: meal,
    });
});

/**
 * @desc    Update a meal with AI-generated nutrition data
 * @route   PUT /api/meals/:id
 * @access  Private
 */
exports.updateMeal = asyncHandler(async (req, res, next) => {
    let meal = await Meal.findById(req.params.id);

    if (!meal) {
        return next(new ErrorResponse('Meal not found', 404));
    }

    if (meal.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to update this meal', 403));
    }

    if (req.body.date) {
        const newDate = new Date(req.body.date);
        if (isNaN(newDate.getTime())) {
            return next(new ErrorResponse('Invalid date format', 400));
        }
    }

    // If foodItems are being updated, regenerate nutrition data
    if (req.body.foodItems && req.body.foodItems.length > 0) {
        const enrichedFoodItems = [];
        for (const item of req.body.foodItems) {
            try {
                const nutrition = await getNutritionFromAI(item.name, item.quantity || '1 serving');
                enrichedFoodItems.push({
                    name: item.name,
                    quantity: item.quantity || '1 serving',
                    nutrition: nutrition
                });
            } catch (error) {
                console.error(`Error getting nutrition for ${item.name}:`, error);
                return next(new ErrorResponse(`Failed to get nutrition data for ${item.name}. Please try again.`, 500));
            }
        }

        // Calculate total nutrition
        const totalNutrition = calculateTotalNutrition(enrichedFoodItems);
        
        req.body.foodItems = enrichedFoodItems;
        req.body.totalNutrition = totalNutrition;
        req.body.calories = totalNutrition.totalCalories;
    }

    meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: 'Meal updated successfully',
        data: meal,
    });
});

/**
 * @desc    Delete a meal
 * @route   DELETE /api/meals/:id
 * @access  Private
 */
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
        message: 'Meal deleted successfully',
    });
});

/**
 * @desc    Get detailed nutrition summary for a date range
 * @route   GET /api/meals/nutrition-summary
 * @access  Private
 */
exports.getNutritionSummary = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    let query = { user: req.userId };

    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    } else {
        // Default to today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const meals = await Meal.find(query).sort({ date: -1 });

    // Calculate aggregate nutrition
    const summary = {
        macros: {
            protein: 0, carbohydrates: 0, fats: 0, fiber: 0,
            sugar: 0, saturatedFat: 0, transFat: 0, cholesterol: 0
        },
        vitamins: {
            vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
            vitaminB1: 0, vitaminB2: 0, vitaminB3: 0, vitaminB6: 0, vitaminB12: 0, folate: 0
        },
        minerals: {
            calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, potassium: 0,
            sodium: 0, zinc: 0, copper: 0, manganese: 0, selenium: 0
        },
        totalCalories: 0
    };

    meals.forEach(meal => {
        if (meal.totalNutrition) {
            // Sum macros
            Object.keys(summary.macros).forEach(key => {
                summary.macros[key] += meal.totalNutrition.macros?.[key] || 0;
            });
            // Sum vitamins
            Object.keys(summary.vitamins).forEach(key => {
                summary.vitamins[key] += meal.totalNutrition.vitamins?.[key] || 0;
            });
            // Sum minerals
            Object.keys(summary.minerals).forEach(key => {
                summary.minerals[key] += meal.totalNutrition.minerals?.[key] || 0;
            });
            summary.totalCalories += meal.totalNutrition.totalCalories || 0;
        }
    });

    res.status(200).json({
        success: true,
        data: {
            period: { startDate: query.date.$gte, endDate: query.date.$lte },
            mealsCount: meals.length,
            nutritionSummary: summary,
            meals: meals
        }
    });
});

/**
 * @desc    Regenerate nutrition data for an existing meal
 * @route   POST /api/meals/:id/regenerate-nutrition
 * @access  Private
 */
exports.regenerateNutrition = asyncHandler(async (req, res, next) => {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
        return next(new ErrorResponse('Meal not found', 404));
    }

    if (meal.user.toString() !== req.userId) {
        return next(new ErrorResponse('Not authorized to update this meal', 403));
    }

    if (!meal.foodItems || meal.foodItems.length === 0) {
        return next(new ErrorResponse('No food items to regenerate nutrition for', 400));
    }

    // Regenerate nutrition for all food items
    const enrichedFoodItems = [];
    for (const item of meal.foodItems) {
        try {
            const nutrition = await getNutritionFromAI(item.name, item.quantity || '1 serving');
            enrichedFoodItems.push({
                name: item.name,
                quantity: item.quantity || '1 serving',
                nutrition: nutrition
            });
        } catch (error) {
            console.error(`Error getting nutrition for ${item.name}:`, error);
            return next(new ErrorResponse(`Failed to get nutrition data for ${item.name}. Please try again.`, 500));
        }
    }

    // Calculate total nutrition
    const totalNutrition = calculateTotalNutrition(enrichedFoodItems);

    meal.foodItems = enrichedFoodItems;
    meal.totalNutrition = totalNutrition;
    meal.calories = totalNutrition.totalCalories;

    await meal.save();

    res.status(200).json({
        success: true,
        message: 'Nutrition data regenerated successfully',
        data: meal,
    });
});
