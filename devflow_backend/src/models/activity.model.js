const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      // all possible action types
      enum: [
        'created_task',
        'updated_task',
        'deleted_task',
        'status_changed',
        'comment_added',
        'member_added',
        'member_removed'
      ]
    },
    message: {
      type: String,
      required: true
      // human readable string like "Radhika created task Fix JWT Bug"
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null
      // some activities are project-level (member added) so task can be null
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);