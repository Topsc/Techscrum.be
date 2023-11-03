import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { replaceId } from '../../services/replaceService';
import logger from 'winston';
import status from 'http-status';
const DailyScrum = require('../../model/dailyScrum');
const User = require('../../model/user');
const Project = require('../../model/project');
const Task = require('../../model/task');

exports.show = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  const { projectId } = req.params;
  const { userId } = req.query;
  const DailyScrumModel = DailyScrum.getModel(req.dbConnection);
  const userModel = await User.getModel(req.tenantsConnection);

  try {
    const results = await DailyScrumModel.find({ project: projectId, user: userId })
      .populate({
        path: 'user',
        model: userModel,
        select: 'name',
      })
      .populate({
        path: 'project',
        model: Project.getModel(req.dbConnection),
        select: ['name', 'key'],
      })
      .populate({
        path: 'task',
        model: Task.getModel(req.dbConnection),
        select: 'title',
      })
      .exec();

    res.send(replaceId(results));
  } catch (e) {
    next(e);
  }
};

exports.store = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  try {
    const { projectId } = req.params;
    const newData = {
      ...req.body,
      task: req.body.taskId,
      user: req.body.userId,
      project: projectId,
    };
    const DailyScrumModel = DailyScrum.getModel(req.dbConnection);

    const updatedDailyScrum = await DailyScrumModel.findOneAndUpdate(
      { task: req.body.taskId },
      newData,
      {
        new: true,
      },
    ).exec();
    if (!updatedDailyScrum) {
      const newDailyScrum = new DailyScrumModel(newData);
      await newDailyScrum.save();
      return res.send(replaceId(newDailyScrum));
    }

    return res.send(replaceId(updatedDailyScrum));
  } catch (e) {
    logger.info(e);
    next(e);
  }
};

exports.update = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.status(status.UNPROCESSABLE_ENTITY).json({
      errors,
    });
  }
  try {
    const { dailyScrumId } = req.params;
    const { progress, ...rest } = req.body;

    const newDailyScrum = await DailyScrum.getModel(req.dbConnection).findByIdAndUpdate(
      dailyScrumId,
      {
        ...rest,
        $addToSet: { progresses: progress },
      },
      {
        new: true,
      },
    );
    if (!newDailyScrum) {
      return res.sendStatus(status.NOT_FOUND);
    }

    return res.send(replaceId(newDailyScrum));
  } catch (e) {
    next(e);
  }
};

exports.destroy = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  try {
    const { projectId } = req.params;
    const { taskId } = req.query;

    await DailyScrum.getModel(req.dbConnection).deleteMany({
      projectId: projectId,
      task: taskId,
    });

    return res.sendStatus(204);
  } catch (e) {
    next(e);
  }
};
