import { Mongoose, Schema } from 'mongoose';

export interface IStatus {
  name: string;
  slug: string;
  order: number;
  board: Schema.Types.ObjectId;
  taskList: Schema.Types.ObjectId[];
  tenantId: string
}

const statusSchema = new Schema<IStatus>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    slug: {
      type: Schema.Types.String,
      trim: true,
      required: true,
    },
    order: {
      type: Schema.Types.Number,
    },
    board: {
      type: Schema.Types.ObjectId,
    },
    tenantId:{
      require:true,
      type:String,
    },
    taskList: [
      {
        type: Schema.Types.ObjectId,
        ref: 'tasks',
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

export const getModel = (dbConnection: Mongoose) => {
  if (!dbConnection) throw new Error('No connection');

  return dbConnection.model('statuses', statusSchema);
};
