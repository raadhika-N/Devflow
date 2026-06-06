const { GoogleGenAI } = require('@google/genai');
const { generateEmbedding } = require('../services/embedding.service');
const Project = require('../models/project.model');
const Task = require('../models/task.model');
const Comment = require('../models/comment.model');
const Activity = require('../models/activity.model');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const buildContext = (project, tasks, comments, activities) => {
  let context = `PROJECT NAME: ${project.title}\n`;
  if (project.description) context += `PROJECT DESCRIPTION: ${project.description}\n`;
  context += `OWNER: ${project.owner?.name}\n`;
  context += `TEAM MEMBERS: ${project.members?.map((m) => m.name).join(', ')}\n\n`;

  const todo = tasks.filter((t) => t.status === 'todo');
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const done = tasks.filter((t) => t.status === 'done');

  context += `TASK OVERVIEW:\n`;
  context += `Total tasks: ${tasks.length}\n`;
  context += `Todo: ${todo.length} | In Progress: ${inProgress.length} | Done: ${done.length}\n\n`;

  if (todo.length > 0) {
    context += `TODO TASKS:\n`;
    todo.forEach((t) => {
      context += `- Title: "${t.title}"`;
      context += ` | Priority: ${t.priority}`;
      if (t.assignedTo) context += ` | Assigned to: ${t.assignedTo.name}`;
      else context += ` | Assigned to: Unassigned`;
      if (t.description) context += ` | Notes: ${t.description}`;
      if (t.dueDate) context += ` | Due: ${new Date(t.dueDate).toLocaleDateString()}`;
      context += '\n';
    });
    context += '\n';
  }

  if (inProgress.length > 0) {
    context += `IN PROGRESS TASKS:\n`;
    inProgress.forEach((t) => {
      context += `- Title: "${t.title}"`;
      context += ` | Priority: ${t.priority}`;
      if (t.assignedTo) context += ` | Assigned to: ${t.assignedTo.name}`;
      else context += ` | Assigned to: Unassigned`;
      if (t.description) context += ` | Notes: ${t.description}`;
      context += '\n';
    });
    context += '\n';
  }

  if (done.length > 0) {
    context += `COMPLETED TASKS:\n`;
    done.forEach((t) => {
      context += `- Title: "${t.title}"`;
      if (t.assignedTo) context += ` | Completed by: ${t.assignedTo.name}`;
      context += '\n';
    });
    context += '\n';
  }

  if (comments.length > 0) {
    context += `RECENT TEAM COMMENTS:\n`;
    comments.slice(0, 20).forEach((c) => {
      context += `- ${c.author?.name} said: "${c.text}"\n`;
    });
    context += '\n';
  }

  if (activities.length > 0) {
    context += `RECENT ACTIVITY LOG:\n`;
    activities.slice(0, 20).forEach((a) => {
      context += `- ${a.message}\n`;
    });
  }

  return context;
};

const askAI = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { question } = req.body;
    const q = question.toLowerCase();

    if (!question) return sendError(res, 400, 'Question is required');

    const project = await Project.findById(projectId)
      .populate('members', 'name email')
      .populate('owner', 'name email');

    if (!project) return sendError(res, 404, 'Project not found');

    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (!isMember) return sendError(res, 403, 'You are not a member of this project');

    if (
  q.includes('todo tasks') ||
  q.includes('pending tasks') ||
  q.includes('show todo')
) {
  const tasks = await Task.find({
    project: projectId,
    status: 'todo'
  });

  const answer =
    tasks.length === 0
      ? 'No todo tasks found.'
      : tasks.map(task => `• ${task.title}`).join('\n');

  return sendSuccess(
    res,
    200,
    'AI response generated',
    { answer }
  );
}

if (
  q.includes('completed tasks') ||
  q.includes('done tasks') ||
  q.includes('what has been completed')
) {
  const tasks = await Task.find({
    project: projectId,
    status: 'done'
  });

  const answer =
    tasks.length === 0
      ? 'No completed tasks found.'
      : tasks.map(task => `• ${task.title}`).join('\n');

  return sendSuccess(
    res,
    200,
    'AI response generated',
    { answer }
  );
}

if (
  q.includes('in progress') ||
  q.includes('currently working') ||
  q.includes('ongoing tasks')
) {
  const tasks = await Task.find({
    project: projectId,
    status: 'in_progress'
  });

  const answer =
    tasks.length === 0
      ? 'No tasks currently in progress.'
      : tasks.map(task => `• ${task.title}`).join('\n');

  return sendSuccess(
    res,
    200,
    'AI response generated',
    { answer }
  );
}

if (
  q.includes('assigned tasks') ||
  q.includes('who is working')
) {
  const tasks = await Task.find({
    project: projectId,
    assignedTo: { $ne: null }
  }).populate('assignedTo', 'name');

  const answer =
    tasks.length === 0
      ? 'No assigned tasks.'
      : tasks
          .map(
            task =>
              `• ${task.title} → ${task.assignedTo?.name}`
          )
          .join('\n');

  return sendSuccess(
    res,
    200,
    'AI response generated',
    { answer }
  );
}

if (q.includes('overdue')) {
  const tasks = await Task.find({
    project: projectId,
    dueDate: { $lt: new Date() },
    status: { $ne: 'done' }
  });

  const answer =
    tasks.length === 0
      ? 'No overdue tasks.'
      : tasks.map(task => `• ${task.title}`).join('\n');

  return sendSuccess(
    res,
    200,
    'AI response generated',
    { answer }
  );
}

    const queryEmbedding = await generateEmbedding(question);
    if (
  q.includes('high priority') ||
  q.includes('highest priority')
) {
  const highTasks = await Task.find({
    project: projectId,
    priority: 'high'
  });

  const answer =
    highTasks.length === 0
      ? 'No high priority tasks found.'
      : highTasks
          .map(
            task =>
              `• ${task.title} (${task.status})`
          )
          .join('\n');

  return sendSuccess(
    res,
    200,
    'AI response generated',
    { answer }
  );
}

const [tasks, comments, activities] = await Promise.all([
 Task.aggregate([
  {
    $vectorSearch: {
      index: 'task_vector_index',
      path: 'embedding',
      queryVector: queryEmbedding,
      numCandidates: 100,
      limit: 5
    }
  },
  {
    $match: {
      project: project._id
    }
  }
]),

  Comment.aggregate([
  {
    $vectorSearch: {
      index: 'comment_vector_index',
      path: 'embedding',
      queryVector: queryEmbedding,
      numCandidates: 100,
      limit: 5
    }
  },
  {
    $match: {
      project: project._id
    }
  }
]),

  Activity.find({ project: projectId })
    .sort({ createdAt: -1 })
    .limit(20)
]);
const populatedTasks = await Task.populate(tasks, {
  path: 'assignedTo createdBy',
  select: 'name'
});

const populatedComments = await Comment.populate(comments, {
  path: 'author',
  select: 'name'
});
console.log('\n=== RELEVANT TASKS ===');
populatedTasks.forEach((t) => console.log(t.title));

console.log('\n=== RELEVANT COMMENTS ===');
populatedComments.forEach((c) => console.log(c.text));
    const context = buildContext(
  project,
  populatedTasks,
  populatedComments,
  activities
);
    const prompt = `You are an intelligent project management assistant for a tool called DevFlow.
You have been given complete data about a project. Your job is to answer the user's question
based ONLY on the project data provided below.

Rules:
- Answer based only on the data provided. Do not make things up.
- Be concise and helpful.
- Use bullet points when listing multiple items.
- If the information is not in the data, clearly say "I don't have that information in the project data."

PROJECT DATA:
${context}

USER'S QUESTION: ${question}`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const answer = result.text;

    return sendSuccess(res, 200, 'AI response generated', { answer });

  } catch (error) {
    console.error('AI Error:', error);
    return sendError(res, 500, error.message);
  }
};

const sprintSummary = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('members', 'name email')
      .populate('owner', 'name email');

    if (!project) return sendError(res, 404, 'Project not found');

    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (!isMember) return sendError(res, 403, 'You are not a member of this project');

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [tasks, activities] = await Promise.all([
      Task.find({ project: projectId })
        .populate('assignedTo', 'name')
        .populate('createdBy', 'name'),
      Activity.find({
        project: projectId,
        createdAt: { $gte: sevenDaysAgo }
      })
        .populate('performedBy', 'name')
        .sort({ createdAt: -1 })
    ]);

    const context = buildContext(project, tasks, [], activities);

    const prompt = `You are a project management assistant for DevFlow.
Generate a clear and structured sprint summary based on the project data below.

Format your response with exactly these sections using markdown:

## Overall Progress
(How many tasks total, what percentage is done)

## Completed This Week
(List tasks that are done)

## Currently In Progress
(List tasks being worked on right now)

## Todo / Upcoming
(List tasks not started yet, highlight high priority ones)

## Team Activity
(Summary of what the team has been doing based on activity log)

PROJECT DATA:
${context}`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const summary = result.text;

    return sendSuccess(res, 200, 'Sprint summary generated', { summary });

  } catch (error) {
    console.error('AI Error:', error.message);
    return sendError(res, 500, error.message);
  }
};

module.exports = { askAI, sprintSummary };