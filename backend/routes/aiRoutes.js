const express = require('express');
const router = express.Router();
const { chatWithAI, getChatHistory, getChatById, analyzeLand } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, chatWithAI);
router.post('/analyze', protect, analyzeLand);
router.get('/history', protect, getChatHistory);
router.get('/chat/:id', protect, getChatById);

module.exports = router;
