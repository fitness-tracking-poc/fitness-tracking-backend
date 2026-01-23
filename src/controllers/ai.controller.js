const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const fetchWithRetry = require('../utils/fetchWithRetry');

// @desc    Generate personalized diet plan using Gemini AI
// @route   POST /api/generate-plan
// @access  Private
exports.generateDietPlan = asyncHandler(async (req, res, next) => {
    const { profile } = req.body; // User profile data from Flutter

    if (!profile) {
        return res.status(400).json({ error: "User profile data is required." });
    }

    // Construct the detailed prompt based on user data
    const userPrompt = `
You are a certified nutritionist and diet planning expert.
Based on the following user profile, generate a comprehensive 7-day personalized meal plan.

- Age: ${profile.age}
- Gender: ${profile.gender}
- Height: ${profile.height_cm} cm
- Weight: ${profile.weight_kg} kg
- Activity Level: ${profile.activity_level}
- Goal: ${profile.goal}
- Dietary Restrictions: ${profile.dietary_restrictions}

Calculate the approximate Total Daily Energy Expenditure (TDEE) needed to meet the user's goal.
The meal plan must strictly adhere to the calculated calorie target and the specified JSON schema.
`;

    // Define the required JSON schema for the model's output
    const dietPlanSchema = {
        type: "OBJECT",
        properties: {
            summary: {
                type: "OBJECT",
                properties: {
                    target_calories: { type: "INTEGER", description: "The daily calculated calorie goal." },
                    macro_breakdown: { type: "STRING", description: "The target macro percentages (e.g., P: 40%, C: 35%, F: 25%)." }
                }
            },
            meal_plan: {
                type: "ARRAY",
                description: "A list of meal plans, one object per day.",
                items: {
                    type: "OBJECT",
                    properties: {
                        day: { type: "STRING", description: "The day of the week (e.g., Monday)." },
                        meals: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    name: { type: "STRING", description: "Meal name (Breakfast, Lunch, Dinner, Snack)." },
                                    item: { type: "STRING", description: "Description of the food item or recipe." },
                                    calories: { type: "INTEGER", description: "Estimated calorie count for the meal." }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    // Placeholder for your actual API Key
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

    // Construct the payload for the Gemini API call
    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
            // Mandate JSON output
            responseMimeType: "application/json",
            responseSchema: dietPlanSchema
        },
        systemInstruction: {
            parts: [{ text: "You are a professional, helpful nutritionist AI that generates personalized, structured diet plans." }]
        }
    };

    try {
        const apiResponse = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await apiResponse.json();

        // 1. Check for errors from the Gemini API
        if (result.error) {
            console.error("Gemini API Error:", result.error.message);
            return res.status(500).json({ error: "AI service failed to generate a plan." });
        }

        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            const jsonText = candidate.content.parts[0].text;
            const parsedPlan = JSON.parse(jsonText);

            // 2. Success: Send the structured JSON plan back to Flutter
            res.json({
                success: true,
                plan: parsedPlan
            });
        } else {
            // Handle unexpected or empty response
            res.status(500).json({ error: "AI returned an unusable or empty response." });
        }
    } catch (error) {
        console.error("Backend processing error:", error);
        res.status(500).json({ error: "Internal server error during plan generation." });
    }
});

// @desc    Get AI-powered food suggestions based on nutrition gaps
// @route   POST /api/suggest-foods
// @access  Private
exports.suggestFoods = asyncHandler(async (req, res, next) => {
    const { nutritionGaps, recentMeals, userProfile } = req.body;

    if (!nutritionGaps) {
        return res.status(400).json({ error: "Nutrition gaps data is required." });
    }

    // Build context from recent meals
    const mealHistory = recentMeals?.slice(0, 20).map(meal => 
        `${meal.mealType}: ${meal.foodItems.map(f => f.name).join(', ')}`
    ).join('\n') || 'No recent meal history available.';

    // Create prompt for AI
    const userPrompt = `
You are a certified nutritionist providing personalized food recommendations.

Based on the user's nutrition gaps and eating preferences from their meal history, suggest 5-7 specific foods or meals they can eat to fill these gaps.

**User Profile:**
- Age: ${userProfile?.age || 'Not provided'}
- Gender: ${userProfile?.gender || 'Not provided'}
- Goal: ${userProfile?.goal || 'General health'}
- Dietary Restrictions: ${userProfile?.dietary_restrictions || 'None'}

**Nutrition Gaps (What they're missing today):**
${Object.entries(nutritionGaps)
    .filter(([_, value]) => value < 0)
    .map(([nutrient, deficit]) => `- ${nutrient}: ${Math.abs(deficit).toFixed(1)} short of goal`)
    .join('\n')}

**Recent Meal History (Last 20 meals):**
${mealHistory}

**Instructions:**
1. Analyze their eating patterns and preferences from meal history
2. Suggest foods they're likely to enjoy based on their history
3. Focus on filling the biggest nutrition gaps first
4. Provide practical, easy-to-find foods
5. Consider their dietary restrictions
6. Give specific portion sizes
7. Explain which nutrients each suggestion provides

Provide personalized, actionable suggestions that fit their eating style.
`;

    const suggestionSchema = {
        type: "OBJECT",
        properties: {
            summary: {
                type: "STRING",
                description: "Brief overview of main nutrition gaps"
            },
            suggestions: {
                type: "ARRAY",
                description: "List of food suggestions",
                items: {
                    type: "OBJECT",
                    properties: {
                        food: { type: "STRING", description: "Food or meal name" },
                        portion: { type: "STRING", description: "Recommended portion size" },
                        nutrients: { type: "STRING", description: "Key nutrients this food provides" },
                        calories: { type: "INTEGER", description: "Estimated calories" },
                        reason: { type: "STRING", description: "Why this food is recommended based on their history" }
                    }
                }
            },
            tip: {
                type: "STRING",
                description: "Helpful nutrition tip or encouragement"
            }
        }
    };

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: suggestionSchema
        },
        systemInstruction: {
            parts: [{ text: "You are a helpful, personalized nutritionist AI that provides practical food suggestions based on user's eating habits and nutrition gaps." }]
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
            return res.status(500).json({ error: "AI service failed to generate suggestions." });
        }

        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            const jsonText = candidate.content.parts[0].text;
            const parsedSuggestions = JSON.parse(jsonText);

            res.json({
                success: true,
                suggestions: parsedSuggestions
            });
        } else {
            res.status(500).json({ error: "AI returned an unusable response." });
        }
    } catch (error) {
        console.error("Backend processing error:", error);
        res.status(500).json({ error: "Internal server error during suggestion generation." });
    }
});

// Simple health check endpoint
exports.healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'API Gateway is running.' });
});
