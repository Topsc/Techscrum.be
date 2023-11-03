export {};
const mongoose = require('mongoose');
const { Types } = require('mongoose');
const projectSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    projectLeadId: {
      ref: 'users',
      type: Types.ObjectId,
      required: true,
    },
    roles: [
      {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        allowDelete: { type: Boolean, required: true, default: true },
        permission: [
          {
            type: Types.ObjectId,
            ref: 'permissions',
          },
        ],
      },
    ],
    ownerId: {
      ref: 'users',
      type: Types.ObjectId,
      required: true,
    },
    assigneeId: {
      type: String,
      trim: true,
    },
    boardId: {
      type: String,
      required: true,
    },
    iconUrl: { type: String, required: false },
    star: { type: Boolean, default: false },
    detail: { type: 'string', required: false },
    shortcut: [{ name: { type: String }, shortcutLink: { type: String } }],
    isDelete: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    tenantId:{
      require:true,
      type:String,
    },
  },
  { timestamps: true },
);

module.exports.getModel = (connection: any) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('projects', projectSchema);
};
