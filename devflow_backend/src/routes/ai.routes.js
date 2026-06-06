const express = require('express');
const router = express.Router({ mergeParams: true });
// mergeParams: true lets us access :projectId from parent route

const { protect } = require('../middleware/auth.middleware');
const { askAI, sprintSummary } = require('../controllers/ai.controller');

// Both routes are protected — must be logged in
router.use(protect);

router.post('/ask', askAI);
router.post('/summary', sprintSummary);

module.exports = router;