import { Mongoose } from 'mongoose';
const Task = require('../model/task');
const Type = require('../model/type');
const Comment = require('../model/comment');
const Label = require('../model/label');
const Status = require('../model/status');
const User = require('../model/user');
import { ITask } from '../types';

/** Find tasks with given filter
 * @param queryFilter
 * @param userFilter
 * @param typeFilter
 * @param labelFilter
 * @param dbConnection Mongoose
 * @returns Document result
 */
export const findTasks = async (
  queryFilter: object,
  userFilter: object,
  typeFilter: object,
  labelFilter: object,
  dbConnection: Mongoose,
  tenantConnection: Mongoose,
) => {
  const taskModel = Task.getModel(dbConnection);

  const UserFields = 'avatarIcon name email';

  const userModel = await User.getModel(tenantConnection);
  try {
    const tasks = await taskModel
      .find(queryFilter)
      .find(userFilter)
      .find(typeFilter)
      .find(labelFilter)
      .populate({ path: 'typeId', model: Type.getModel(dbConnection) })
      .populate({
        path: 'tags',
        model: Label.getModel(dbConnection),
        select: 'name slug',
      })
      .populate({
        path: 'reporterId',
        model: userModel,
        select: UserFields,
      })
      .populate({
        path: 'assignId',
        model: userModel,
        select: UserFields,
      })
      .populate({
        path: 'status',
        model: Status.getModel(dbConnection),
        select: 'name slug order',
      })
      .populate({
        path: 'comments',
        model: Comment.getModel(dbConnection),
      })
      .sort({ createdAt: 1 });

    const activeTasks = tasks.filter((e: ITask) => e.isActive === true);

    return activeTasks;
  } catch (error: any) {
    return error;
  }
};
