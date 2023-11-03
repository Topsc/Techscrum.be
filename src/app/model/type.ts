export {};
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const typeSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default:
        'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10321?size=medium',
    },
  },
  { timestamps: true },
);

typeSchema.methods.toJSON = function () {
  const type = this;
  const typeObject = type.toObject();
  const id = typeObject._id;
  typeObject.id = id;
  delete typeObject._id;
  delete typeObject.__v;
  return typeObject;
};

module.exports.getModel = (connection: any) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('types', typeSchema);
};
