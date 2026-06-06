const express = require('express');
const router = express.Router({ mergeParams: true });
// mergeParams: true is CRITICAL
// It allows this router to access :projectId from the parent route in app.js
// Without this, req.params.projectId would be undefined

const { protect } = require('../middleware/auth.middleware');
const {
  createTask,
  getAllTasks,
  getTask,
  updateTask,
  deleteTask
} = require('../controllers/task.controller');

// All task routes are protected
router.use(protect);

router.post('/', createTask);
router.get('/', getAllTasks);
router.get('/:id', getTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;