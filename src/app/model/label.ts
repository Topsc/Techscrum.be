export {};
const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require:true,
    },
    slug: {
      type: String,
      require:true,
    },
  },
  { timestamps: true },
);

labelSchema.methods.toJSON = function () {
  const task = this;
  const taskObject = task.toObject();
  delete taskObject.__v;
  return taskObject;
};

module.exports.getModel = (connection: any) => {

  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('labels', labelSchema);
};
