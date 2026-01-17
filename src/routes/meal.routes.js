const express = require('express');
const router = express.Router();
const {
    addMeal,
    getMeals,
    getTodayMeals,
    getMeal,
    updateMeal,
    deleteMeal,
    getNutritionSummary,
    regenerateNutrition
} = require('../controllers/meal.controller');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Meal routes
router.route('/')
    .post(addMeal)
    .get(getMeals);

router.get('/today', getTodayMeals);
router.get('/nutrition-summary', getNutritionSummary);

router.route('/:id')
    .get(getMeal)
    .put(updateMeal)
    .delete(deleteMeal);

router.post('/:id/regenerate-nutrition', regenerateNutrition);

module.exports = router;
