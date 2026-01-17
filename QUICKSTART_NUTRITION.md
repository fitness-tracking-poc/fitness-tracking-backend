# Quick Start Guide - AI Nutrition Tracking

## Setup

1. **Ensure GEMINI_API_KEY is set** in your `.env` file:
```env
GEMINI_API_KEY=your_api_key_here
```

2. **Start the server**:
```bash
cd fitness-tracking-backend
npm start
```

## Example Usage

### 1. Simple Breakfast Entry

**Request:**
```bash
POST http://localhost:5000/api/meals
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "mealType": "breakfast",
  "foodItems": [
    {
      "name": "Oatmeal with banana and honey",
      "quantity": "1 bowl"
    },
    {
      "name": "Black coffee",
      "quantity": "1 cup"
    }
  ]
}
```

**What happens:**
1. AI analyzes "Oatmeal with banana and honey, 1 bowl"
2. AI analyzes "Black coffee, 1 cup"
3. System generates complete nutrition profile for each item
4. System calculates total nutrition for the meal
5. Returns complete data with 30+ nutrients tracked

### 2. Lunch with Multiple Items

**Request:**
```json
{
  "mealType": "lunch",
  "foodItems": [
    { "name": "Grilled chicken breast", "quantity": "150g" },
    { "name": "Caesar salad", "quantity": "1 large bowl" },
    { "name": "Olive oil dressing", "quantity": "2 tablespoons" },
    { "name": "Whole wheat bread", "quantity": "1 slice" }
  ],
  "notes": "Office lunch"
}
```

**Response includes:**
- Individual nutrition for each of 4 food items
- Total meal nutrition (sum of all 4 items)
- Detailed macros: protein, carbs, fats, fiber, sugar, etc.
- All vitamins: A, C, D, E, K, B-complex, folate
- All minerals: calcium, iron, magnesium, potassium, etc.
- Total calories (auto-calculated)

### 3. Check Today's Nutrition

**Request:**
```bash
GET http://localhost:5000/api/meals/today
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": {
    "meals": [
      {
        "mealType": "breakfast",
        "totalNutrition": { /* complete nutrition */ },
        "calories": 485,
        "foodItems": [ /* each with its own nutrition */ ]
      },
      {
        "mealType": "lunch",
        "totalNutrition": { /* complete nutrition */ },
        "calories": 650
      },
      {
        "mealType": "dinner",
        "totalNutrition": { /* complete nutrition */ },
        "calories": 720
      }
    ],
    "totalCalories": 1855
  }
}
```

### 4. Get Weekly Nutrition Summary

**Request:**
```bash
GET http://localhost:5000/api/meals/nutrition-summary?startDate=2026-01-08&endDate=2026-01-15
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2026-01-08T00:00:00.000Z",
      "endDate": "2026-01-15T23:59:59.999Z"
    },
    "mealsCount": 21,
    "nutritionSummary": {
      "macros": {
        "protein": 420.5,
        "carbohydrates": 625.3,
        "fats": 260.7
      },
      "vitamins": { /* all vitamins totaled */ },
      "minerals": { /* all minerals totaled */ },
      "totalCalories": 14250
    },
    "meals": [ /* all 21 meals */ ]
  }
}
```

## Key Features

### ✅ Automatic Nutrition Analysis
No manual entry - AI does it all!

```json
{
  "foodItems": [
    { "name": "Chicken biryani", "quantity": "1 plate" }
  ]
}
```
AI automatically generates:
- 25g protein
- 65g carbs
- 18g fats
- All vitamins and minerals
- 520 calories

### ✅ Flexible Quantities
Works with various quantity formats:
- "150g"
- "1 cup"
- "2 slices"
- "1 bowl"
- "1 serving"
- "half"
- "100ml"

### ✅ Complex Foods
Handles complex dishes:
- "Chicken tikka masala with rice"
- "Vegetable stir fry"
- "Protein shake with banana and peanut butter"
- "Homemade pizza slice"

### ✅ Per-Item Details
Each food item gets its own nutrition profile:

```json
{
  "foodItems": [
    {
      "name": "Brown rice",
      "quantity": "1 cup",
      "nutrition": {
        "macros": { "protein": 5, "carbohydrates": 45, "fats": 1.8 },
        "vitamins": { /* full vitamin breakdown */ },
        "minerals": { /* full mineral breakdown */ },
        "totalCalories": 218
      }
    },
    {
      "name": "Grilled salmon",
      "quantity": "150g",
      "nutrition": {
        "macros": { "protein": 31, "carbohydrates": 0, "fats": 12 },
        "vitamins": { /* full vitamin breakdown */ },
        "minerals": { /* full mineral breakdown */ },
        "totalCalories": 233
      }
    }
  ],
  "totalNutrition": {
    // Automatically summed from both items above
    "macros": { "protein": 36, "carbohydrates": 45, "fats": 13.8 },
    "totalCalories": 451
  }
}
```

## Real-World Examples

### Example 1: Vegetarian Day
```json
POST /api/meals

{
  "mealType": "lunch",
  "foodItems": [
    { "name": "Paneer tikka", "quantity": "200g" },
    { "name": "Dal makhani", "quantity": "1 bowl" },
    { "name": "Roti", "quantity": "2 pieces" },
    { "name": "Mixed vegetable salad", "quantity": "1 plate" }
  ]
}
```
AI generates complete nutrition for traditional Indian vegetarian meal!

### Example 2: Fitness Meal
```json
POST /api/meals

{
  "mealType": "snack",
  "foodItems": [
    { "name": "Protein shake (whey)", "quantity": "1 scoop with 300ml milk" },
    { "name": "Banana", "quantity": "1 medium" },
    { "name": "Almonds", "quantity": "10 pieces" }
  ]
}
```
Perfect for tracking post-workout nutrition!

### Example 3: Quick Snack
```json
POST /api/meals

{
  "mealType": "snack",
  "foodItems": [
    { "name": "Apple", "quantity": "1 medium" },
    { "name": "Peanut butter", "quantity": "2 tablespoons" }
  ]
}
```

## Nutrition Summary Dashboard

Get comprehensive nutrition overview for any period:

```bash
# Today
GET /api/meals/nutrition-summary

# This week
GET /api/meals/nutrition-summary?startDate=2026-01-08&endDate=2026-01-15

# Custom period
GET /api/meals/nutrition-summary?startDate=2026-01-01&endDate=2026-01-31
```

**Returns:**
- Total calories for period
- Total protein, carbs, fats consumed
- All vitamin totals
- All mineral totals
- Number of meals
- List of all meals

## Update Existing Meal

```bash
PUT /api/meals/MEAL_ID

{
  "foodItems": [
    { "name": "Grilled fish", "quantity": "200g" },
    { "name": "Steamed vegetables", "quantity": "1 cup" }
  ]
}
```
Nutrition is automatically regenerated!

## Regenerate Nutrition

If you want to refresh nutrition data for an existing meal:

```bash
POST /api/meals/MEAL_ID/regenerate-nutrition
```

Useful when:
- AI models improve
- You want fresh analysis
- Data seems incorrect

## Testing Tips

### 1. Start Simple
```json
{
  "mealType": "breakfast",
  "foodItems": [
    { "name": "Boiled eggs", "quantity": "2" }
  ]
}
```

### 2. Add Complexity Gradually
```json
{
  "mealType": "lunch",
  "foodItems": [
    { "name": "Chicken wrap", "quantity": "1 whole" },
    { "name": "French fries", "quantity": "small portion" }
  ]
}
```

### 3. Test Indian Foods
```json
{
  "foodItems": [
    { "name": "Chole bhature", "quantity": "1 plate" },
    { "name": "Lassi", "quantity": "1 glass" }
  ]
}
```

### 4. Test Different Cuisines
```json
{
  "foodItems": [
    { "name": "Sushi rolls (California)", "quantity": "8 pieces" },
    { "name": "Miso soup", "quantity": "1 bowl" }
  ]
}
```

## Performance Notes

- Each food item takes ~2-5 seconds to analyze (AI processing time)
- A meal with 3 items takes ~6-15 seconds total
- Nutrition data is cached in database (no repeated AI calls)
- Subsequent retrieval is instant

## What You Get

For **EVERY** food item entered, you automatically get:

**Macronutrients (8 values):**
- Protein (g)
- Carbohydrates (g)
- Total Fats (g)
- Fiber (g)
- Sugar (g)
- Saturated Fat (g)
- Trans Fat (g)
- Cholesterol (mg)

**Vitamins (11 values):**
- Vitamin A (mcg)
- Vitamin C (mg)
- Vitamin D (mcg)
- Vitamin E (mg)
- Vitamin K (mcg)
- Vitamin B1/Thiamine (mg)
- Vitamin B2/Riboflavin (mg)
- Vitamin B3/Niacin (mg)
- Vitamin B6 (mg)
- Vitamin B12 (mcg)
- Folate (mcg)

**Minerals (10 values):**
- Calcium (mg)
- Iron (mg)
- Magnesium (mg)
- Phosphorus (mg)
- Potassium (mg)
- Sodium (mg)
- Zinc (mg)
- Copper (mg)
- Manganese (mg)
- Selenium (mcg)

**Summary (2 values):**
- Total Calories (kcal)
- Serving Size (description)

**Total: 31 nutrition values per food item!**

## No Manual Work Required!

Just enter:
1. Food name
2. Quantity

Get back: Complete nutrition profile! 🎉
