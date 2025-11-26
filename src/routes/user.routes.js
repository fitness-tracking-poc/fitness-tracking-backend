const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    updateAccount
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/account', updateAccount);

module.exports = router;
