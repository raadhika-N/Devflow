const Activity = require('../models/activity.model');
const Project = require('../models/project.model');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ─────────────────────────────────────────
// GET ACTIVITY FEED FOR A PROJECT
// GET /api/projects/:projectId/activity
// ─────────────────────────────────────────
const getActivity = async (req, res) => {
  try {
    const { projectId } = req.params;

    // 1. Find project
    const project = await Project.findById(projectId);
    if (!project) return sendError(res, 404, 'Project not found');

    // 2. Check membership
    const isMember = project.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );
    if (!isMember) return sendError(res, 403, 'You are not a member of this project');

    // 3. Get all activities for this project — newest first
    const activities = await Activity.find({ project: projectId })
      .populate('performedBy', 'name email')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(50); // last 50 activities

    return sendSuccess(res, 200, 'Activity feed fetched successfully', { activities });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { getActivity };