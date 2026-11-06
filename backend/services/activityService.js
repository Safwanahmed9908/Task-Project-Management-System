const ActivityLog = require('../models/ActivityLog');

exports.logActivity = async (userId, action, entity, entityId, entityName, description, metadata = {}) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      entity,
      entityId,
      entityName,
      description,
      metadata,
    });
  } catch (error) {
    console.error('Activity logging error:', error.message);
    // Don't throw - activity logging should not break main functionality
  }
};
