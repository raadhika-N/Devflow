const express = require('express');
const router = express.Router({ mergeParams: true });
// mergeParams: true — needed to access :projectId and :taskId from parent routes

const { protect } = require('../middleware/auth.middleware');
const { addComment, getComments, deleteComment } = require('../controllers/comment.controller');

router.use(protect);

router.post('/', addComment);
router.get('/', getComments);
router.delete('/:id', deleteComment);

module.exports = router;