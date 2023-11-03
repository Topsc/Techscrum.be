import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import status from 'http-status';
import * as Activity from '../../model/activity';
const User = require('../../model/user');

exports.show = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const { tid } = req.params;
  const userModel = await User.getModel(req.tenantsConnection);
  try {
    const result = await Activity
      .getModel(req.dbConnection)
      .find({ taskId: tid })
      .populate({ path: 'userId', model: userModel });
    res.send(result);
  } catch (e) {
    res.send(e);
    next(e);
  }
};

exports.store = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const { userId, taskId, operation } = req.body;
  try {
    const newAction = await Activity.getModel(req.dbConnection).create({
      userId,
      taskId,
      operation,
    });
    if (!newAction) {
      res.sendStatus(status.UNPROCESSABLE_ENTITY);
      return;
    }
    res.send(newAction);
  } catch (e) {
    next(e);
  }
};

exports.destroy = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const taskId = req.params.id;
  try {
    await Activity.getModel(req.dbConnection).updateMany({ taskId: taskId }, { isDeleted: true });
    const deletedActivities = await Activity.getModel(req.dbConnection).find({ taskId: taskId });
    res.send(deletedActivities);
    return;
  } catch (e) {
    next(e);
  }
};
