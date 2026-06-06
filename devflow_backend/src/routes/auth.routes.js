const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { signupSchema, loginSchema } = require('../validators/auth.validator');

// Public routes — no token needed
router.post('/signup', validate(signupSchema), signup); // ✅
router.post('/login', validate(loginSchema), login);    // ✅
// Protected route — token required
// protect runs first, then getMe runs
router.get('/me', protect, getMe);

module.exports = router;