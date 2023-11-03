import mongoose, { Mongoose, Types } from 'mongoose';

export interface IBoard {
  title: string;
  taskStatus: Types.ObjectId[];
}

const boardSchema = new mongoose.Schema<IBoard>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    taskStatus: [
      {
        type: Types.ObjectId,
        ref: 'statuses',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  },
);

export const getModel = (connection: Mongoose) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('boards', boardSchema);
};
