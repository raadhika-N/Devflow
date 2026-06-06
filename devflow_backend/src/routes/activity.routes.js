const express = require('express');
const router = express.Router({ mergeParams: true });

const { protect } = require('../middleware/auth.middleware');
const { getActivity } = require('../controllers/activity.controller');

router.use(protect);

router.get('/', getActivity);

module.exports = router;