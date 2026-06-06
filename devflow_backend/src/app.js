const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const errorHandler = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.route');
const taskRoutes = require('./routes/task.routes');
const commentRoutes = require('./routes/comment.routes');
const activityRoutes = require('./routes/activity.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express(); // <-- MUST COME BEFORE app.use

// Middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Health route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/projects/:projectId/tasks/:taskId/comments', commentRoutes);
app.use('/api/projects/:projectId/activity', activityRoutes);
app.use('/api/projects/:projectId/ai', aiRoutes);

// Error middleware
app.use(errorHandler);

module.exports = app;