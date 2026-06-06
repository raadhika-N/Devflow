const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createProjectSchema, updateProjectSchema } = require('../validators/project.validator');
const {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/project.controller');

// All project routes are protected — must be logged in
router.use(protect);  // applies protect to ALL routes below, cleaner than adding it to each one

router.post('/', validate(createProjectSchema), createProject);
router.get('/', getAllProjects);
router.get('/:id', getProject);
router.patch('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

router.post('/:id/members', addMember);
router.delete('/:id/members', removeMember);

module.exports = router;