const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    updateAccount,
    getRDA,
    recalculateRDA
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/account', updateAccount);

// RDA endpoints
router.get('/rda', getRDA);
router.post('/rda/recalculate', recalculateRDA);

module.exports = router;
