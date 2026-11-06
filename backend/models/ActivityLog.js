const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'created_project',
        'updated_project',
        'deleted_project',
        'created_task',
        'updated_task',
        'deleted_task',
        'updated_task_status',
        'assigned_task',
        'uploaded_file',
        'created_user',
        'updated_user',
        'deleted_user',
        'login',
        'logout',
        'register',
        'updated_profile',
        'changed_password',
      ],
    },
    entity: {
      type: String,
      enum: ['project', 'task', 'user', 'file', 'auth'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    entityName: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

ActivityLogSchema.index({ user: 1, createdAt: -1 });
ActivityLogSchema.index({ entity: 1, entityId: 1 });
ActivityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
