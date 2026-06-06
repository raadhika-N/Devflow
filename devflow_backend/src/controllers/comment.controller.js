const Comment = require('../models/comment.model');
const Task = require('../models/task.model');
const Project = require('../models/project.model');
const { logActivity } = require('../services/activity.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// helper — check membership
const isProjectMember = (project, userId) => {
  return project.members.some(
    (memberId) => memberId.toString() === userId.toString()
  );
};


// ─────────────────────────────────────────
// ADD COMMENT
// POST /api/projects/:projectId/tasks/:taskId/comments
// ─────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { text } = req.body;

    if (!text) {
      return sendError(res, 400, 'Comment text is required');
    }

    // 1. Find the project and check membership
    const project = await Project.findById(projectId);
    if (!project) return sendError(res, 404, 'Project not found');

    if (!isProjectMember(project, req.user._id)) {
      return sendError(res, 403, 'You are not a member of this project');
    }

    // 2. Find the task
    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) return sendError(res, 404, 'Task not found');

    // 3. Create the comment
    const comment = await Comment.create({
      text,
      task: taskId,
      author: req.user._id,
      project: projectId
    });
    await embeddingQueue.add('generate-comment-embedding', {
  type: 'comment',
  id: comment._id,
  text: comment.text
});

    // 4. Populate author before sending back
    await comment.populate('author', 'name email');

    // 5. Log activity
    await logActivity({
      action: 'comment_added',
      message: `${req.user.name} commented on task "${task.title}"`,
      projectId,
      taskId,
      userId: req.user._id
    });

    return sendSuccess(res, 201, 'Comment added successfully', { comment });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────
// GET ALL COMMENTS ON A TASK
// GET /api/projects/:projectId/tasks/:taskId/comments
// ─────────────────────────────────────────
const getComments = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    // 1. Check project and membership
    const project = await Project.findById(projectId);
    if (!project) return sendError(res, 404, 'Project not found');

    if (!isProjectMember(project, req.user._id)) {
      return sendError(res, 403, 'You are not a member of this project');
    }

    // 2. Check task exists
    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) return sendError(res, 404, 'Task not found');

    // 3. Get all comments for this task
    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 }); // oldest first — natural conversation flow

    return sendSuccess(res, 200, 'Comments fetched successfully', { comments });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────
// DELETE COMMENT
// DELETE /api/projects/:projectId/tasks/:taskId/comments/:id
// Only comment author or project owner can delete
// ─────────────────────────────────────────
const deleteComment = async (req, res) => {
  try {
    const { projectId, taskId, id } = req.params;

    // 1. Check project and membership
    const project = await Project.findById(projectId);
    if (!project) return sendError(res, 404, 'Project not found');

    if (!isProjectMember(project, req.user._id)) {
      return sendError(res, 403, 'You are not a member of this project');
    }

    // 2. Find the comment
    const comment = await Comment.findById(id);
    if (!comment) return sendError(res, 404, 'Comment not found');

    // 3. Only comment author or project owner can delete
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isOwner = project.owner.toString() === req.user._id.toString();

    if (!isAuthor && !isOwner) {
      return sendError(res, 403, 'Only the comment author or project owner can delete this comment');
    }

    await comment.deleteOne();

    return sendSuccess(res, 200, 'Comment deleted successfully', {});

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


module.exports = { addComment, getComments, deleteComment };