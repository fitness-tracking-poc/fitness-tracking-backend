const express = require('express');
const router = express.Router();
const {
    addExercisesBatch,
    getExercises,
    getTodayExercises,
    getExercise,
    updateExercise,
    deleteExercise
} = require('../controllers/exercise.controller');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
    .post(addExercisesBatch)
    .get(getExercises);

router.get('/today', getTodayExercises);

router.route('/:id')
    .get(getExercise)
    .put(updateExercise)
    .delete(deleteExercise);

module.exports = router;
