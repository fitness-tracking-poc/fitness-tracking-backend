/**
 * RDA Calculator Utility
 * Calculates personalized Recommended Daily Allowances based on user profile
 * Based on NIH/ICMR guidelines
 */

/**
 * Activity Level Multipliers for TDEE calculation
 */
const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Hard exercise 6-7 days/week
    very_active: 1.9     // Very hard exercise & physical job
};

/**
 * Goal Adjustments for calories
 */
const GOAL_ADJUSTMENTS = {
    lose_weight: -500,   // Deficit for weight loss
    gain_muscle: 300,    // Surplus for muscle gain
    maintain: 0          // No adjustment
};

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} BMR in kcal/day
 */
function calculateBMR(weight, height, age, gender) {
    if (gender === 'male') {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level
 * @returns {number} TDEE in kcal/day
 */
function calculateTDEE(bmr, activityLevel) {
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
    return Math.round(bmr * multiplier);
}

/**
 * Calculate macro RDAs based on calorie target and goals
 * @param {number} calories - Target calories
 * @param {string} fitnessGoal - Fitness goal
 * @param {number} weight - Weight in kg
 * @returns {object} Macro targets
 */
function calculateMacroRDA(calories, fitnessGoal, weight) {
    let proteinRatio, carbsRatio, fatsRatio;

    switch (fitnessGoal) {
        case 'lose_weight':
            // Higher protein for muscle preservation during deficit
            proteinRatio = 0.30;   // 30% protein
            carbsRatio = 0.40;     // 40% carbs
            fatsRatio = 0.30;      // 30% fats
            break;
        case 'gain_muscle':
            // Higher protein and carbs for muscle building
            proteinRatio = 0.30;   // 30% protein
            carbsRatio = 0.45;     // 45% carbs
            fatsRatio = 0.25;      // 25% fats
            break;
        default: // maintain
            proteinRatio = 0.25;   // 25% protein
            carbsRatio = 0.50;     // 50% carbs
            fatsRatio = 0.25;      // 25% fats
    }

    // Calculate grams (protein/carbs = 4 cal/g, fats = 9 cal/g)
    const protein = Math.round((calories * proteinRatio) / 4);
    const carbohydrates = Math.round((calories * carbsRatio) / 4);
    const fats = Math.round((calories * fatsRatio) / 9);

    // Fiber: 14g per 1000 kcal (general recommendation)
    const fiber = Math.round((calories / 1000) * 14);

    // Sugar: max 10% of calories
    const sugar = Math.round((calories * 0.10) / 4);

    // Saturated fat: max 10% of calories
    const saturatedFat = Math.round((calories * 0.10) / 9);

    // Trans fat: as low as possible (0g target)
    const transFat = 0;

    // Cholesterol: max 300mg/day
    const cholesterol = 300;

    return {
        protein,
        carbohydrates,
        fats,
        fiber,
        sugar,
        saturatedFat,
        transFat,
        cholesterol
    };
}

/**
 * Get vitamin RDA based on age and gender
 * Values in mcg (micrograms) unless specified
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {object} Vitamin RDAs
 */
function getVitaminRDA(age, gender) {
    // Adult values (19+ years) - NIH/ICMR guidelines
    // Units: vitaminA (mcg), vitaminC (mg), vitaminD (mcg), vitaminE (mg), vitaminK (mcg)
    // B vitamins: B1/B2/B3 (mg), B6 (mg), B12 (mcg), folate (mcg)

    if (gender === 'male') {
        if (age >= 19 && age <= 50) {
            return {
                vitaminA: 900,      // mcg RAE
                vitaminC: 90,       // mg
                vitaminD: 15,       // mcg (600 IU)
                vitaminE: 15,       // mg
                vitaminK: 120,      // mcg
                vitaminB1: 1.2,     // mg (Thiamine)
                vitaminB2: 1.3,     // mg (Riboflavin)
                vitaminB3: 16,      // mg (Niacin)
                vitaminB6: 1.3,     // mg
                vitaminB12: 2.4,    // mcg
                folate: 400         // mcg DFE
            };
        } else if (age > 50) {
            return {
                vitaminA: 900,
                vitaminC: 90,
                vitaminD: 20,       // Higher for older adults
                vitaminE: 15,
                vitaminK: 120,
                vitaminB1: 1.2,
                vitaminB2: 1.3,
                vitaminB3: 16,
                vitaminB6: 1.7,     // Higher for 50+
                vitaminB12: 2.4,
                folate: 400
            };
        } else { // Under 19
            return {
                vitaminA: 700,
                vitaminC: 75,
                vitaminD: 15,
                vitaminE: 15,
                vitaminK: 75,
                vitaminB1: 1.0,
                vitaminB2: 1.0,
                vitaminB3: 12,
                vitaminB6: 1.0,
                vitaminB12: 2.4,
                folate: 300
            };
        }
    } else { // female
        if (age >= 19 && age <= 50) {
            return {
                vitaminA: 700,      // mcg RAE
                vitaminC: 75,       // mg
                vitaminD: 15,       // mcg
                vitaminE: 15,       // mg
                vitaminK: 90,       // mcg
                vitaminB1: 1.1,     // mg
                vitaminB2: 1.1,     // mg
                vitaminB3: 14,      // mg
                vitaminB6: 1.3,     // mg
                vitaminB12: 2.4,    // mcg
                folate: 400         // mcg DFE (higher if pregnant)
            };
        } else if (age > 50) {
            return {
                vitaminA: 700,
                vitaminC: 75,
                vitaminD: 20,
                vitaminE: 15,
                vitaminK: 90,
                vitaminB1: 1.1,
                vitaminB2: 1.1,
                vitaminB3: 14,
                vitaminB6: 1.5,
                vitaminB12: 2.4,
                folate: 400
            };
        } else { // Under 19
            return {
                vitaminA: 600,
                vitaminC: 65,
                vitaminD: 15,
                vitaminE: 15,
                vitaminK: 75,
                vitaminB1: 0.9,
                vitaminB2: 0.9,
                vitaminB3: 11,
                vitaminB6: 1.0,
                vitaminB12: 2.4,
                folate: 300
            };
        }
    }
}

/**
 * Get mineral RDA based on age and gender
 * Values in mg (milligrams) unless specified
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {object} Mineral RDAs
 */
function getMineralRDA(age, gender) {
    // Adult values - NIH/ICMR guidelines
    // Units: All in mg except selenium (mcg)

    if (gender === 'male') {
        if (age >= 19 && age <= 50) {
            return {
                calcium: 1000,      // mg
                iron: 8,            // mg
                magnesium: 400,     // mg
                phosphorus: 700,    // mg
                potassium: 3400,    // mg
                sodium: 2300,       // mg (max)
                zinc: 11,           // mg
                copper: 0.9,        // mg
                manganese: 2.3,     // mg
                selenium: 55        // mcg
            };
        } else if (age > 50) {
            return {
                calcium: 1000,
                iron: 8,
                magnesium: 420,
                phosphorus: 700,
                potassium: 3400,
                sodium: 2300,
                zinc: 11,
                copper: 0.9,
                manganese: 2.3,
                selenium: 55
            };
        } else { // Under 19
            return {
                calcium: 1300,      // Higher for teens
                iron: 11,
                magnesium: 360,
                phosphorus: 1250,   // Higher for teens
                potassium: 3000,
                sodium: 2300,
                zinc: 9,
                copper: 0.7,
                manganese: 1.9,
                selenium: 45
            };
        }
    } else { // female
        if (age >= 19 && age <= 50) {
            return {
                calcium: 1000,      // mg
                iron: 18,           // mg (higher for menstruating women)
                magnesium: 310,     // mg
                phosphorus: 700,    // mg
                potassium: 2600,    // mg
                sodium: 2300,       // mg (max)
                zinc: 8,            // mg
                copper: 0.9,        // mg
                manganese: 1.8,     // mg
                selenium: 55        // mcg
            };
        } else if (age > 50) {
            return {
                calcium: 1200,      // Higher post-menopause
                iron: 8,            // Lower post-menopause
                magnesium: 320,
                phosphorus: 700,
                potassium: 2600,
                sodium: 2300,
                zinc: 8,
                copper: 0.9,
                manganese: 1.8,
                selenium: 55
            };
        } else { // Under 19
            return {
                calcium: 1300,
                iron: 15,
                magnesium: 300,
                phosphorus: 1250,
                potassium: 2300,
                sodium: 2300,
                zinc: 7,
                copper: 0.7,
                manganese: 1.6,
                selenium: 45
            };
        }
    }
}

/**
 * Calculate complete personalized RDA
 * @param {object} profile - User profile
 * @returns {object} Complete RDA values
 */
function calculatePersonalizedRDA(profile) {
    const { age, gender, weight, height, fitnessGoal, activityLevel } = profile;

    // Default values if missing
    const userAge = age || 25;
    const userGender = gender || 'male';
    const userWeight = weight || 70;
    const userHeight = height || 170;
    const userGoal = fitnessGoal || 'maintain';
    const userActivity = activityLevel || 'moderate';

    // Calculate BMR and TDEE
    const bmr = calculateBMR(userWeight, userHeight, userAge, userGender);
    const tdee = calculateTDEE(bmr, userActivity);

    // Adjust for fitness goal
    const goalAdjustment = GOAL_ADJUSTMENTS[userGoal] || 0;
    const targetCalories = Math.max(1200, tdee + goalAdjustment); // Min 1200 kcal

    // Calculate macros
    const macros = calculateMacroRDA(targetCalories, userGoal, userWeight);

    // Get vitamins and minerals based on age/gender
    const vitamins = getVitaminRDA(userAge, userGender);
    const minerals = getMineralRDA(userAge, userGender);

    return {
        calories: Math.round(targetCalories),
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        macros,
        vitamins,
        minerals,
        calculatedAt: new Date(),
        basedOn: {
            age: userAge,
            gender: userGender,
            weight: userWeight,
            height: userHeight,
            activityLevel: userActivity,
            fitnessGoal: userGoal
        }
    };
}

module.exports = {
    calculatePersonalizedRDA,
    calculateBMR,
    calculateTDEE,
    calculateMacroRDA,
    getVitaminRDA,
    getMineralRDA
};
