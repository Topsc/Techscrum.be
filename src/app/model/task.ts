export {};
const mongoose = require('mongoose');
const { Types } = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    tags: [
      {
        type: Types.ObjectId,
        ref: 'labels',
      },
    ],
    comments: [
      {
        type: Types.ObjectId,
        ref: 'comments',
      },
    ],
    status: {
      type: Types.ObjectId,
      ref: 'statuses',
      require: true,
    },
    priority: {
      type: String,
      enum: ['Highest', 'High', 'Medium', 'Low', 'Lowest'],
      default: 'Medium',
    },
    projectId: {
      type: Types.ObjectId,
      ref: 'projects',
    },
    boardId: {
      type: Types.ObjectId,
      ref: 'boards',
    },
    sprintId: {
      type: Types.ObjectId,
      ref: 'sprints',
      default: null,
    },
    description: {
      type: String,
      trim: true,
    },
    storyPoint: {
      type: Number,
      default: 0,
    },
    dueAt: {
      type: Date,
      default: null,
    },
    reporterId: {
      type: Types.ObjectId,
      ref: 'users',
    },
    assignId: {
      type: Types.ObjectId,
      ref: 'users',
      default: null,
    },
    typeId: {
      type: Types.ObjectId,
      ref: 'types',
      require: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attachmentUrls: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true },
);

taskSchema.methods.toJSON = function () {
  const task = this;
  const taskObject = task.toObject();
  const id = taskObject._id;
  taskObject.id = id;
  delete taskObject._id;
  delete taskObject.__v;
  return taskObject;
};

module.exports.getModel = (connection: any) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('tasks', taskSchema);
};
