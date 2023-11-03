import mongoose, { Types } from 'mongoose';

export interface DailyScrumDocument extends mongoose.Document {
  title: string;
  progresses: { timeStamp: number; value: number }[];
  isCanFinish: boolean;
  isNeedSupport: boolean;
  supportType: number;
  user: Types.ObjectId;
  project: Types.ObjectId;
  task: Types.ObjectId;
  otherSupportDesc: string;
}

// defaultProgress has 2 fields: timeStamp: Date.now(), value: 0

const dailyScrumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    progresses: {
      type: [
        {
          timeStamp: { type: Number, default: Date.now() },
          value: { type: Number, default: 0 },
        },
      ],
      default: [
        {
          timeStamp: Date.now(),
          value: 0,
        },
      ],
    },
    isCanFinish: { type: Boolean, default: true },
    isNeedSupport: { type: Boolean, default: false },
    supportType: {
      type: Number,
      default: 0,
      validate: [
        {
          validator: function (type: number) {
            if (!(this as DailyScrumDocument).isNeedSupport) {
              return type === 0;
            }

            return [1, 2, 3, 4].includes(type);
          },
          msg: 'supportType Must be 0 when no support needed AND Must be 1-4 when support is needed',
        },
      ],
    },
    user: { type: Types.ObjectId, ref: 'user' },
    project: { type: Types.ObjectId, ref: 'project' },
    task: { type: Types.ObjectId, ref: 'task', unique: true },
    otherSupportDesc: { type: String, default: '' },
  },
  {
    timestamps: true,
  },
);

dailyScrumSchema.methods.toJSON = function () {
  const dailyScrum = this;
  const dailyScrumObject = dailyScrum.toObject();
  const id = dailyScrumObject._id;
  dailyScrumObject.id = id;
  dailyScrumObject._id = undefined;

  if (dailyScrumObject?.progresses?.length > 0) {
    dailyScrumObject.progresses.sort(
      (a: { timeStamp: number; value: number }, b: { timeStamp: number; value: number }) =>
        b?.timeStamp - a?.timeStamp,
    );

    dailyScrumObject.progress = dailyScrumObject.progresses[0];

    dailyScrumObject.progresses = undefined;
  } else {
    // nullish guard for empty array
    dailyScrumObject.progress = { timeStamp: Date.now(), value: 0 };
    dailyScrumObject.progresses = undefined;
  }

  return dailyScrumObject;
};

module.exports.getModel = (connection: any) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('dailyScrums', dailyScrumSchema);
};
