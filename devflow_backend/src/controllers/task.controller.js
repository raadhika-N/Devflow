const Task = require('../models/task.model');
const Project = require('../models/project.model');
const { logActivity } = require('../services/activity.service'); 
const { sendSuccess, sendError } = require('../utils/apiResponse');


// ─────────────────────────────────────────
// HELPER — check if user is member of project
// Reusable function used in multiple controllers
// ─────────────────────────────────────────
const isProjectMember = (project, userId) => {
  return project.members.some(
    (memberId) => memberId.toString() === userId.toString()
  );
};


// ─────────────────────────────────────────
// CREATE TASK
// POST /api/projects/:projectId/tasks
// Must be a project member
// ─────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    // 1. Check title exists
    if (!title) {
      return sendError(res, 400, 'Task title is required');
    }

    // 2. Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // 3. Check if logged in user is a member of this project
    if (!isProjectMember(project, req.user._id)) {
      return sendError(res, 403, 'You are not a member of this project');
    }

    // 4. If assignedTo is provided, check that user is also a project member
    if (assignedTo && !isProjectMember(project, assignedTo)) {
      return sendError(res, 400, 'Assigned user is not a member of this project');
    }

    // 5. Create the task
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo: assignedTo || null,
      project: projectId,
      createdBy: req.user._id  // automatically set to logged in user
    });
    const { embeddingQueue } = require('../queues/embedding.queue');

const job = await embeddingQueue.add(
  'generate-task-embedding',
  {
    type: 'task',
    id: task._id,
    text: `${task.title} ${task.description || ''}`
  }
);

console.log('JOB ADDED:', job.id);

    // 6. Populate before sending response
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await logActivity({
  action: 'created_task',
  message: `${req.user.name} created task "${title}"`,
  projectId,
  taskId: task._id,
  userId: req.user._id
});



    return sendSuccess(res, 201, 'Task created successfully', { task });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────
// GET ALL TASKS IN A PROJECT
// GET /api/projects/:projectId/tasks
// Must be a project member
// ─────────────────────────────────────────
const getAllTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Extract all possible query params
    // If not sent, use these defaults
    const {
      search,                  // keyword to search in title/description
      status,                  // filter by status: todo, in_progress, done
      priority,                // filter by priority: low, medium, high
      assignedTo,              // filter by assigned user ID
      sortBy = 'createdAt',   // which field to sort by
      order = 'desc',          // sort direction: asc or desc
      page = 1,                // which page number
      limit = 10               // how many results per page
    } = req.query;

    // 1. Find the project
    const project = await Project.findById(projectId);
    if (!project) return sendError(res, 404, 'Project not found');

    // 2. Check membership
    if (!isProjectMember(project, req.user._id)) {
      return sendError(res, 403, 'You are not a member of this project');
    }

    // 3. Start building the MongoDB query
    // This always filters by project first
    const query = { project: projectId };

    // Add status filter only if it was sent
    if (status) query.status = status;

    // Add priority filter only if it was sent
    if (priority) query.priority = priority;

    // Add assignedTo filter only if it was sent
    if (assignedTo) query.assignedTo = assignedTo;

    // Add text search if search keyword was sent
    // $or = match title OR description
    // $regex = contains this text
    // $options: 'i' = case insensitive
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 4. Build the sort object
    // sortOrder: -1 = descending, 1 = ascending
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };
    // [sortBy] uses the variable as the key
    // so if sortBy = 'priority', this becomes { priority: -1 }

    // 5. Pagination calculations
    const pageNum = parseInt(page);     // convert string to number
    const limitNum = parseInt(limit);   // convert string to number
    const skip = (pageNum - 1) * limitNum;
    // page 1 → skip 0
    // page 2 → skip 10
    // page 3 → skip 20

    // 6. Run the actual query with everything applied
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)       // apply sorting
      .skip(skip)       // skip previous pages
      .limit(limitNum); // take only this many results

    // 7. Count total matching tasks for pagination info
    // Uses same query so it counts only filtered results
    const totalTasks = await Task.countDocuments(query);
    const totalPages = Math.ceil(totalTasks / limitNum);
    // Math.ceil: 11 tasks / 10 per page = 1.1 → rounds up to 2 pages

    return sendSuccess(res, 200, 'Tasks fetched successfully', {
      tasks,
      pagination: {
        totalTasks,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,  // is there a next page?
        hasPrevPage: pageNum > 1            // is there a previous page?
      }
    });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────
// GET SINGLE TASK
// GET /api/projects/:projectId/tasks/:id
// Must be a project member
// ─────────────────────────────────────────
const getTask = async (req, res) => {
  try {
    const { projectId, id } = req.params;

    // 1. Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // 2. Check membership
    if (!isProjectMember(project, req.user._id)) {
      return sendError(res, 403, 'You are not a member of this project');
    }

    // 3. Find the task — must belong to this specific project
    const task = await Task.findOne({ _id: id, project: projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    return sendSuccess(res, 200, 'Task fetched successfully', { task });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────
// UPDATE TASK
// PATCH /api/projects/:projectId/tasks/:id
// Any project member can update
// ─────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const { projectId, id } = req.params;
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    // 1. Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // 2. Check membership
    if (!isProjectMember(project, req.user._id)) {
      return sendError(res, 403, 'You are not a member of this project');
    }

    // 3. Find the task
    const task = await Task.findOne({ _id: id, project: projectId });
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    const oldStatus = task.status;

    // 4. Update only fields that were sent
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;


    await task.save();
    

// then after task.save():

if (status && status !== oldStatus) {
  await logActivity({
    action: 'status_changed',
    message: `${req.user.name} changed status of "${task.title}" from ${oldStatus} to ${status}`,
    projectId,
    taskId: task._id,
    userId: req.user._id
  });
} else {
  await logActivity({
    action: 'updated_task',
    message: `${req.user.name} updated task "${task.title}"`,
    projectId,
    taskId: task._id,
    userId: req.user._id
  });
}

    // 5. Populate before sending back
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    return sendSuccess(res, 200, 'Task updated successfully', { task });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────
// DELETE TASK
// DELETE /api/projects/:projectId/tasks/:id
// Only project owner OR task creator can delete
// ─────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const { projectId, id } = req.params;

    // 1. Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // 2. Check membership
    if (!isProjectMember(project, req.user._id)) {
      return sendError(res, 403, 'You are not a member of this project');
    }

    // 3. Find the task
    const task = await Task.findOne({ _id: id, project: projectId });
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    // 4. Only project owner OR the person who created the task can delete it
    const isProjectOwner = project.owner.toString() === req.user._id.toString();
    const isTaskCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isProjectOwner && !isTaskCreator) {
      return sendError(res, 403, 'Only the project owner or task creator can delete this task');
    }

    const taskTitle = task.title; // save before deleting
await task.deleteOne();

await logActivity({
  action: 'deleted_task',
  message: `${req.user.name} deleted task "${taskTitle}"`,
  projectId,
  taskId: null,
  userId: req.user._id
});

return sendSuccess(res, 200, 'Task deleted successfully', {});

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


module.exports = {
  createTask,
  getAllTasks,
  getTask,
  updateTask,
  deleteTask
};