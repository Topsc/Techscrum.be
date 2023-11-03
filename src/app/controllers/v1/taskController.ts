import { Request, Response } from 'express';
import { replaceId } from '../../services/replaceService';
import { findTasks } from '../../services/taskService';
import { asyncHandler } from '../../utils/helper';
const Task = require('../../model/task');
const mongoose = require('mongoose');
const Status = require('../../model/status');
const Sprint = require('../../model/sprint');
const Project = require('../../model/project');
const httpStatus = require('http-status');
const { validationResult } = require('express-validator');

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

// GET ONE
exports.show = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
  }
  const tasks = await findTasks(
    { _id: req.params.id },
    {},
    {},
    {},
    req.dbConnection,
    req.tenantsConnection,
  );
  res.status(200).send(replaceId(tasks[0]));
});

// GET TASKS BY PROJECT
exports.tasksByProject = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY).json({ errors: errors });
  }
  const { id: projectId } = req.params;
  const tasks = await Task.getModel(req.dbConnection)
    .find({ projectId: projectId })
    .populate({
      path: 'projectId',
      model: Project.getModel(req.dbConnection),
      select: 'key',
    })
    .sort({ createdAt: 1 })
    .exec();
  res.status(200).send(replaceId(tasks));
});

//POST
exports.store = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
  }

  const { boardId, status, sprintId } = req.body;
  const statusModel = Status.getModel(req.dbConnection);
  const taskModel = Task.getModel(req.dbConnection);
  const sprintModel = Sprint.getModel(req.dbConnection);
  let taskStatus = null;
  // if no status provided, set taskStatus to 'to do'
  if (!status) {
    const defaultStatus = await statusModel.findOne({
      name: 'to do',
      board: boardId,
    });
    taskStatus = defaultStatus;
  } else {
    // else set taskStatus to existing status
    const existingStatus = await statusModel.findOne({ name: status, board: boardId });
    taskStatus = existingStatus;
  }

  if (taskStatus) {
    // create new task
    const task = await taskModel.create({
      ...req.body,
      board: boardId,
      status: taskStatus._id,
      reporterId: req.userId,
    });
    if (sprintId) {
      await sprintModel.findByIdAndUpdate(sprintId, { $addToSet: { taskId: task._id } });
    }
    // bind task ref to status
    await statusModel.findByIdAndUpdate(taskStatus._id, { $addToSet: { taskList: task._id } });
    // return task
    const result = await findTasks(
      { _id: task._id },
      {},
      {},
      {},
      req.dbConnection,
      req.tenantsConnection,
    );
    res.status(httpStatus.CREATED).json(replaceId(result[0]));
  }
});

//PUT
exports.update = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
  }

  const { id } = req.params;

  const { status, sprintId } = req.body;
  if (sprintId) {
    await Sprint.getModel(req.dbConnection).findOneAndUpdate(
      { taskId: id },
      { $pull: { taskId: id } },
    );
    await Sprint.getModel(req.dbConnection).findByIdAndUpdate(sprintId, {
      $addToSet: { taskId: id },
    });
  } else if (sprintId === null) {
    await Sprint.getModel(req.dbConnection).findOneAndUpdate(
      { taskId: id },
      { $pull: { taskId: id } },
    );
  }

  // remove ref from old status and add ref to new status
  if (status) {
    await Status.getModel(req.dbConnection).findOneAndUpdate(
      { taskList: id },
      { $pull: { taskList: id } },
    );

    await Status.getModel(req.dbConnection).findByIdAndUpdate(status, {
      $addToSet: { taskList: id },
    });
  }

  const task = await Task.getModel(req.dbConnection).findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true, runValidators: true },
  );
  if (!task) return res.status(httpStatus.NOT_FOUND).send();

  const result = await findTasks({ _id: id }, {}, {}, {}, req.dbConnection, req.tenantsConnection);

  return res.status(httpStatus.OK).json(replaceId(result[0]));
});

// DELETE HARD
exports.delete = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
  }

  // delete task from Task collection
  const task = await Task.getModel(req.dbConnection).findOneAndDelete({
    _id: mongoose.Types.ObjectId(req.params.id),
  });
  if (!task) return res.status(404).send();

  // delete task id from Status collection
  await Status.getModel(req.dbConnection).findByIdAndUpdate(task.status, {
    $pull: { taskList: task.id },
  });

  //delete task id from Sprint collection
  await Sprint.getModel(req.dbConnection).findByIdAndUpdate(task.sprintId, {
    $pull: { taskId: task.id },
  });

  return res.status(httpStatus.NO_CONTENT).send();
});

// DELETE SOFT, TOGGLE isActive
exports.toggleActivate = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
  }

  const { id } = req.params;

  const task = await Task.getModel(req.dbConnection).findOne({ _id: id });
  if (!task) {
    return res.status(httpStatus.NOT_FOUND).send();
  }
  const isActive = !task.isActive;
  const updatedTask = await Task.getModel(req.dbConnection).findOneAndUpdate(
    { _id: id },
    { isActive: isActive },
    { new: true },
  );
  return res.status(httpStatus.OK).json(replaceId(updatedTask));
});
