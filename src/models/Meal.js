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

const NutritionSchema = new mongoose.Schema({
  // Macronutrients (in grams)
  macros: {
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    saturatedFat: { type: Number, default: 0 },
    transFat: { type: Number, default: 0 },
    cholesterol: { type: Number, default: 0 }
  },
  // Micronutrients (vitamins - in mg or mcg)
  vitamins: {
    vitaminA: { type: Number, default: 0 }, // mcg
    vitaminC: { type: Number, default: 0 }, // mg
    vitaminD: { type: Number, default: 0 }, // mcg
    vitaminE: { type: Number, default: 0 }, // mg
    vitaminK: { type: Number, default: 0 }, // mcg
    vitaminB1: { type: Number, default: 0 }, // mg (Thiamine)
    vitaminB2: { type: Number, default: 0 }, // mg (Riboflavin)
    vitaminB3: { type: Number, default: 0 }, // mg (Niacin)
    vitaminB6: { type: Number, default: 0 }, // mg
    vitaminB12: { type: Number, default: 0 }, // mcg
    folate: { type: Number, default: 0 } // mcg
  },
  // Micronutrients (minerals - in mg)
  minerals: {
    calcium: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    magnesium: { type: Number, default: 0 },
    phosphorus: { type: Number, default: 0 },
    potassium: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    zinc: { type: Number, default: 0 },
    copper: { type: Number, default: 0 },
    manganese: { type: Number, default: 0 },
    selenium: { type: Number, default: 0 } // mcg
  },
  // Summary
  totalCalories: { type: Number, default: 0 },
  servingSize: { type: String, default: '' }
}, { _id: false });

const FoodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide food name'],
  },
  quantity: {
    type: String,
    default: '1 serving',
  },
  nutrition: {
    type: NutritionSchema,
    default: () => ({})
  }
}, { _id: true });

const MealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mealType: {
      type: String,
      required: [true, 'Please specify meal type'],
      enum: ['breakfast', 'brunch', 'lunch', 'dinner', 'snack','foods_drinks'],
    },
    foodItems: [FoodItemSchema],
    // Total nutrition for the entire meal (sum of all food items)
    totalNutrition: {
      type: NutritionSchema,
      default: () => ({})
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

MealSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Meal', MealSchema);
