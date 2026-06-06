const Project = require('../models/project.model');
const User = require('../models/user.model');
const { sendSuccess, sendError } = require('../utils/apiResponse');


// ─────────────────────────────────────────
// CREATE PROJECT
// POST /api/projects
// ─────────────────────────────────────────
const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return sendError(res, 400, 'Project title is required');
    }

    // Create the project
    // owner = currently logged in user (set by auth middleware as req.user)
    // members starts with just the owner
    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id]  // owner is automatically a member
    });

    return sendSuccess(res, 201, 'Project created successfully', { project });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────
// GET ALL PROJECTS (for logged in user)
// GET /api/projects
// ─────────────────────────────────────────
const getAllProjects = async (req, res) => {
  try {
    // Extract query params
    const {
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // 1. Base query — only projects where user is a member
    const query = { members: req.user._id };

    // 2. Add search if provided
    // searches in both title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 3. Sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // 4. Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // 5. Run query
    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // 6. Total count
    const totalProjects = await Project.countDocuments(query);
    const totalPages = Math.ceil(totalProjects / limitNum);

    return sendSuccess(res, 200, 'Projects fetched successfully', {
      projects,
      pagination: {
        totalProjects,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────
// GET SINGLE PROJECT
// GET /api/projects/:id
// ─────────────────────────────────────────
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // Check if logged in user is a member of this project
    // .some() loops through members and returns true if any match
    const isMember = project.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return sendError(res, 403, 'You do not have access to this project');
    }

    return sendSuccess(res, 200, 'Project fetched successfully', { project });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────
// UPDATE PROJECT
// PATCH /api/projects/:id
// Only owner can update
// ─────────────────────────────────────────
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // Authorization check — only owner can update
    if (project.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Only the project owner can update this project');
    }

    const { title, description } = req.body;

    // Update only the fields that were sent
    if (title) project.title = title;
    if (description) project.description = description;

    await project.save();

    return sendSuccess(res, 200, 'Project updated successfully', { project });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────
// DELETE PROJECT
// DELETE /api/projects/:id
// Only owner can delete
// ─────────────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // Authorization check — only owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Only the project owner can delete this project');
    }

    await project.deleteOne();

    return sendSuccess(res, 200, 'Project deleted successfully', {});

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────
// ADD MEMBER
// POST /api/projects/:id/members
// Only owner can add members
// ─────────────────────────────────────────
const addMember = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, 'Please provide the email of the user to add');
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // Only owner can add members
    if (project.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Only the project owner can add members');
    }

    // Find the user to add by their email
    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return sendError(res, 404, 'No user found with that email');
    }

    // Check if already a member
    const alreadyMember = project.members.some(
      (memberId) => memberId.toString() === userToAdd._id.toString()
    );

    if (alreadyMember) {
      return sendError(res, 400, 'User is already a member of this project');
    }

    // Add the user to members array
    project.members.push(userToAdd._id);
    await project.save();

    return sendSuccess(res, 200, 'Member added successfully', {});

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────
// REMOVE MEMBER
// DELETE /api/projects/:id/members
// Only owner can remove members
// ─────────────────────────────────────────
const removeMember = async (req, res) => {
  try {
    const { email } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // Only owner can remove members
    if (project.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Only the project owner can remove members');
    }

    // Find the user to remove
    const userToRemove = await User.findOne({ email });

    if (!userToRemove) {
      return sendError(res, 404, 'No user found with that email');
    }

    // Cannot remove the owner from their own project
    if (userToRemove._id.toString() === project.owner.toString()) {
      return sendError(res, 400, 'Cannot remove the project owner');
    }

    // Filter out the user from members array
    project.members = project.members.filter(
      (memberId) => memberId.toString() !== userToRemove._id.toString()
    );

    await project.save();

    return sendSuccess(res, 200, 'Member removed successfully', {});

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


module.exports = {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};