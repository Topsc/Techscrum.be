import { Request, Response, NextFunction } from 'express';
const project = require('../../model/project');
import status from 'http-status';
import { validationResult } from 'express-validator';
import { replaceId } from '../../services/replaceService';
const mongoose = require('mongoose');
const URL = require('url').URL;
exports.store = async (req: Request, res: Response) => {
  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const shortcutId = new mongoose.Types.ObjectId();
  const { id } = req.params;
  const { shortcutLink, name } = req.body;
  if (validateUrl(shortcutLink)) {
    const updatedProject = await project.getModel(req.dbConnection).findByIdAndUpdate(
      { _id: id },
      {
        $push: {
          shortcut: [{ _id: shortcutId, shortcutLink, name }],
        },
      },
      { new: true },
    );
    const shortCut = updatedProject.shortcut.filter((data: any) => {
      return data._id.toString() === shortcutId.toString();
    });
    if (shortCut) {
      res.status(status.OK).send(replaceId(shortCut[0]));
    } else {
      res.sendStatus(status.CONFLICT);
    }
  } else {
    res.sendStatus(status.FORBIDDEN);
  }
};
exports.update = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  try {
    const { projectId, shortcutId } = req.params;
    const { shortcutLink, name } = req.body;
    const updateShortcutFlag = await project.getModel(req.dbConnection).updateOne(
      { _id: projectId, 'shortcut._id': shortcutId },
      {
        $set: { 'shortcut.$.shortcutLink': shortcutLink, 'shortcut.$.name': name },
      },
    );
    if (updateShortcutFlag.modifiedCount === 1) {
      res.status(status.OK).send();
    } else {
      res.status(status.CONFLICT).send();
    }
  } catch (e) {
    next(e);
  }
};
exports.destroy = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  try {
    const { projectId, shortcutId } = req.params;
    const checkShortcutExist = await project
      .getModel(req.dbConnection)
      .find({ 'shortcut._id': shortcutId });
    if (checkShortcutExist.length === 0) {
      return res.status(status.NOT_FOUND).send();
    }
    const updatedProject = await project.getModel(req.dbConnection).updateOne(
      { _id: projectId },

      { $pull: { shortcut: { _id: shortcutId } } },
    );
    if (!updatedProject) {
      res.status(status.NOT_ACCEPTABLE).send();
      return;
    } else {
      res.status(status.OK).send();
    }
  } catch (e) {
    next(e);
  }
};
