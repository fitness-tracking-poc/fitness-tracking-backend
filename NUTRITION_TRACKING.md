# AI-Powered Nutrition Tracking System

This document explains the comprehensive nutrition tracking system that automatically generates detailed macro and micro nutrient data for every meal and food item using Google's Gemini AI.

## Overview

When you add a meal or food item, the system automatically:
1. Sends the food name and quantity to Gemini AI
2. Receives detailed nutritional breakdown (macros + micros)
3. Stores complete nutrition data for each food item
4. Calculates total nutrition for the entire meal
5. Provides comprehensive nutrition summaries

## Features

### Automatic Nutrition Analysis
- **Macronutrients**: Protein, Carbohydrates, Fats, Fiber, Sugar, Saturated Fat, Trans Fat, Cholesterol
- **Vitamins**: A, C, D, E, K, B1, B2, B3, B6, B12, Folate
- **Minerals**: Calcium, Iron, Magnesium, Phosphorus, Potassium, Sodium, Zinc, Copper, Manganese, Selenium
- **Calories**: Automatically calculated based on macros

### Per-Item Tracking
Each food item in a meal gets its own detailed nutrition profile

### Meal-Level Summaries
Automatic aggregation of all food items in a meal

### Period Summaries
Track nutrition across days, weeks, or custom date ranges

## API Endpoints

### 1. Add Meal with Auto-Nutrition
```
POST /api/meals
```

**Request Body:**
```json
{
  "mealType": "breakfast",
  "foodItems": [
    {
      "name": "Scrambled eggs",
      "quantity": "2 large eggs"
    },
    {
      "name": "Whole wheat toast",
      "quantity": "2 slices"
    },
    {
      "name": "Avocado",
      "quantity": "half"
    }
  ],
  "date": "2026-01-15T08:30:00.000Z",
  "notes": "Healthy breakfast"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meal added successfully with nutrition data",
  "data": {
    "_id": "meal_id",
    "user": "user_id",
    "mealType": "breakfast",
    "foodItems": [
      {
        "_id": "item_id",
        "name": "Scrambled eggs",
        "quantity": "2 large eggs",
        "nutrition": {
          "macros": {
            "protein": 12.6,
            "carbohydrates": 1.2,
            "fats": 10.6,
            "fiber": 0,
            "sugar": 0.8,
            "saturatedFat": 3.3,
            "transFat": 0,
            "cholesterol": 372
          },
          "vitamins": {
            "vitaminA": 180,
            "vitaminC": 0,
            "vitaminD": 2.2,
            "vitaminE": 1.2,
            "vitaminK": 0.3,
            "vitaminB1": 0.08,
            "vitaminB2": 0.45,
            "vitaminB3": 0.1,
            "vitaminB6": 0.17,
            "vitaminB12": 1.2,
            "folate": 47
          },
          "minerals": {
            "calcium": 56,
            "iron": 1.8,
            "magnesium": 12,
            "phosphorus": 198,
            "potassium": 138,
            "sodium": 142,
            "zinc": 1.3,
            "copper": 0.07,
            "manganese": 0.03,
            "selenium": 31.7
          },
          "totalCalories": 143,
          "servingSize": "2 large eggs (100g)"
        }
      }
      // ... other food items with their nutrition
    ],
    "totalNutrition": {
      "macros": {
        "protein": 25.4,
        "carbohydrates": 35.2,
        "fats": 22.8,
        // ... sum of all items
      },
      "vitamins": { /* ... */ },
      "minerals": { /* ... */ },
      "totalCalories": 485,
      "servingSize": "Total meal"
    },
    "calories": 485,
    "date": "2026-01-15T08:30:00.000Z",
    "notes": "Healthy breakfast"
  }
}
```

### 2. Update Meal (Auto-regenerates nutrition)
```
PUT /api/meals/:id
```

**Request Body:**
```json
{
  "foodItems": [
    {
      "name": "Greek yogurt",
      "quantity": "1 cup"
    }
  ]
}
```

### 3. Get Nutrition Summary
```
GET /api/meals/nutrition-summary?startDate=2026-01-01&endDate=2026-01-15
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-01-15T23:59:59.999Z"
    },
    "mealsCount": 42,
    "nutritionSummary": {
      "macros": {
        "protein": 840.5,
        "carbohydrates": 1250.3,
        "fats": 520.7,
        "fiber": 180.2,
        "sugar": 220.5,
        "saturatedFat": 145.3,
        "transFat": 2.1,
        "cholesterol": 1850
      },
      "vitamins": {
        "vitaminA": 12500,
        "vitaminC": 850,
        "vitaminD": 45.5,
        // ... all vitamins
      },
      "minerals": {
        "calcium": 8500,
        "iron": 125,
        "magnesium": 2200,
        // ... all minerals
      },
      "totalCalories": 28500
    },
    "meals": [ /* ... all meals in period */ ]
  }
}
```

### 4. Regenerate Nutrition for Existing Meal
```
POST /api/meals/:id/regenerate-nutrition
```

Useful if you want to refresh nutrition data with updated AI models or fix incorrect data.

### 5. Get Today's Meals
```
GET /api/meals/today
```

Returns all meals for today with complete nutrition data.

### 6. Get All Meals
```
GET /api/meals?startDate=2026-01-01&endDate=2026-01-31
```

### 7. Get Single Meal
```
GET /api/meals/:id
```

### 8. Delete Meal
```
DELETE /api/meals/:id
```

## Data Model

### Food Item Structure
```javascript
{
  name: String,              // "Grilled chicken breast"
  quantity: String,          // "150g" or "1 serving"
  nutrition: {
    macros: {
      protein: Number,       // grams
      carbohydrates: Number, // grams
      fats: Number,          // grams
      fiber: Number,         // grams
      sugar: Number,         // grams
      saturatedFat: Number,  // grams
      transFat: Number,      // grams
      cholesterol: Number    // mg
    },
    vitamins: {
      vitaminA: Number,      // mcg
      vitaminC: Number,      // mg
      vitaminD: Number,      // mcg
      vitaminE: Number,      // mg
      vitaminK: Number,      // mcg
      vitaminB1: Number,     // mg
      vitaminB2: Number,     // mg
      vitaminB3: Number,     // mg
      vitaminB6: Number,     // mg
      vitaminB12: Number,    // mcg
      folate: Number         // mcg
    },
    minerals: {
      calcium: Number,       // mg
      iron: Number,          // mg
      magnesium: Number,     // mg
      phosphorus: Number,    // mg
      potassium: Number,     // mg
      sodium: Number,        // mg
      zinc: Number,          // mg
      copper: Number,        // mg
      manganese: Number,     // mg
      selenium: Number       // mcg
    },
    totalCalories: Number,
    servingSize: String
  }
}
```

## How It Works

### 1. AI Nutrition Analysis
When a food item is added:
- System sends food name + quantity to Gemini AI
- AI analyzes using USDA and standard nutrition databases
- Returns comprehensive nutrition breakdown
- All values are numeric and accurate

### 2. Meal Aggregation
- Each food item's nutrition is stored separately
- Meal's `totalNutrition` field sums all food items
- `calories` field matches `totalNutrition.totalCalories`

### 3. Summary Calculation
- Query meals by date range
- Aggregate all nutrition values
- Return comprehensive nutritional overview

## Frontend Integration Examples

### Flutter Example - Add Meal
```dart
Future<void> addMealWithNutrition() async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/meals'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token'
    },
    body: json.encode({
      'mealType': 'lunch',
      'foodItems': [
        {'name': 'Grilled salmon', 'quantity': '200g'},
        {'name': 'Brown rice', 'quantity': '1 cup'},
        {'name': 'Steamed broccoli', 'quantity': '1 cup'}
      ],
      'notes': 'Healthy lunch'
    })
  );
  
  if (response.statusCode == 201) {
    final data = json.decode(response.body);
    print('Total calories: ${data['data']['calories']}');
    print('Protein: ${data['data']['totalNutrition']['macros']['protein']}g');
  }
}
```

### Flutter Example - Get Nutrition Summary
```dart
Future<Map<String, dynamic>> getNutritionSummary(DateTime start, DateTime end) async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/meals/nutrition-summary?startDate=${start.toIso8601String()}&endDate=${end.toIso8601String()}'),
    headers: {'Authorization': 'Bearer $token'}
  );
  
  return json.decode(response.body)['data'];
}
```

## Benefits

1. **No Manual Entry**: Users don't need to enter nutrition data
2. **Accurate**: Uses AI trained on standard nutrition databases
3. **Comprehensive**: Tracks 30+ nutrients automatically
4. **Time-Saving**: Instant nutrition analysis
5. **Flexible**: Works with any food description and quantity
6. **Smart**: Handles vague quantities like "1 serving" intelligently

## Testing

### Using cURL - Add Meal
```bash
curl -X POST http://localhost:5000/api/meals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mealType": "dinner",
    "foodItems": [
      {"name": "Chicken curry", "quantity": "1 bowl"},
      {"name": "Naan bread", "quantity": "2 pieces"}
    ]
  }'
```

### Using cURL - Get Nutrition Summary
```bash
curl -X GET "http://localhost:5000/api/meals/nutrition-summary?startDate=2026-01-01&endDate=2026-01-15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Best Practices

1. **Be Specific**: "Grilled chicken breast 150g" is better than "chicken"
2. **Include Quantity**: Always specify quantity for accurate results
3. **Use Standard Units**: "1 cup", "100g", "2 slices", etc.
4. **Review Data**: AI is accurate but you can regenerate if needed
5. **Track Consistently**: Add meals regularly for best insights

## Troubleshooting

### "Failed to get nutrition data"
- Check GEMINI_API_KEY is set in .env
- Verify API key is valid at https://aistudio.google.com/app/apikey
- Check internet connection
- Retry the request

### Inaccurate nutrition data
- Use `POST /api/meals/:id/regenerate-nutrition` to refresh
- Be more specific with food names and quantities
- Check if quantity format is clear

### Slow response
- AI analysis takes 2-5 seconds per food item
- Multiple items will take longer
- This is normal for AI-powered features

## Free Tier Considerations

- Gemini API is free with generous limits
- Each meal addition makes 1 API call per food item
- Monitor usage at Google AI Studio
- Nutrition data is cached in database (no repeated calls)

## Future Enhancements

- [ ] Nutrition recommendations based on user goals
- [ ] Daily nutrition targets and tracking
- [ ] Nutrition insights and trends
- [ ] Food item favorites with cached nutrition
- [ ] Barcode scanning integration
- [ ] Recipe nutrition calculation
- [ ] Meal planning based on nutrition goals
