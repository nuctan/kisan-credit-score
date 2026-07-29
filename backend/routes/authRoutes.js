const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateFarmProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateFarmProfile);

module.exports = router;
