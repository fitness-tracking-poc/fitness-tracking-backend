const express = require('express');
const router = express.Router();
const {
    addMeal,
    getMeals,
    getTodayMeals,
    getMeal,
    updateMeal,
    deleteMeal
} = require('../controllers/meal.controller');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Meal routes
router.route('/')
    .post(addMeal)
    .get(getMeals);

router.get('/today', getTodayMeals);

router.route('/:id')
    .get(getMeal)
    .put(updateMeal)
    .delete(deleteMeal);

module.exports = router;
