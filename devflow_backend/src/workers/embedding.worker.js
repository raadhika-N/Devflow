
require('dotenv').config();

const connectDB = require('../config/db');
connectDB();
const { Worker } = require('bullmq');
const Task = require('../models/task.model');
const Comment = require('../models/comment.model');
const { generateEmbedding } = require('../services/embedding.service');
const { connection } = require('../queues/embedding.queue');

new Worker(
  'embeddingQueue',
  async (job) => {
  console.log('JOB RECEIVED:', job.data);

  const { type, id, text } = job.data;

    const embedding = await generateEmbedding(text);
    console.log(
  'Embedding result:',
  embedding ? embedding.length : 'NULL'
);

    if (!embedding) return;

    if (type === 'task') {
  console.log('Updating task:', id);

  const updatedTask = await Task.findByIdAndUpdate(
  id,
  { embedding },
  { new: true }
);

console.log(
  'Updated task embedding:',
  updatedTask?.embedding?.length
);
}

    if (type === 'comment') {
      await Comment.findByIdAndUpdate(id, {
        embedding
      });
    }

    console.log(`✅ Processed ${type}: ${id}`);
  },
  { connection }
);