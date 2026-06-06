const Activity = require('../models/activity.model');

const logActivity = async ({ action, message, projectId, taskId = null, userId }) => {
  try {
    await Activity.create({
      action,
      message,
      project: projectId,
      task: taskId,
      performedBy: userId
    });
  } catch (error) {
    // Activity logging should never crash your main flow
    // So we just log the error and continue
    console.error('Activity log failed:', error.message);
  }
};

module.exports = { logActivity };