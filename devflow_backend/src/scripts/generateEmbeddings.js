require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/task.model');
const Comment = require('../models/comment.model');
const { generateEmbedding } = require('../services/embedding.service');

const run = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // ─────────────────────────────────────────
    // Generate embeddings for all tasks
    // ─────────────────────────────────────────
    const tasks = await Task.find({ embedding: null });
    console.log(`Found ${tasks.length} tasks without embeddings`);

    for (const task of tasks) {
      // Combine title + description into one text for richer embedding
      const text = `${task.title} ${task.description || ''}`.trim();

      const embedding = await generateEmbedding(text);

      if (embedding) {
        // Use updateOne to bypass select:false
        await Task.updateOne(
          { _id: task._id },
          { $set: { embedding } }
        );
        console.log(`✅ Task embedded: "${task.title}"`);
      } else {
        console.log(`❌ Failed to embed task: "${task.title}"`);
      }

      // Small delay to avoid hitting API rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // ─────────────────────────────────────────
    // Generate embeddings for all comments
    // ─────────────────────────────────────────
    const comments = await Comment.find({ embedding: null });
    console.log(`\nFound ${comments.length} comments without embeddings`);

    for (const comment of comments) {
      const embedding = await generateEmbedding(comment.text);

      if (embedding) {
        await Comment.updateOne(
          { _id: comment._id },
          { $set: { embedding } }
        );
        console.log(`✅ Comment embedded: "${comment.text.slice(0, 50)}..."`);
      } else {
        console.log(`❌ Failed to embed comment`);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log('\n✅ All embeddings generated successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
};

run();