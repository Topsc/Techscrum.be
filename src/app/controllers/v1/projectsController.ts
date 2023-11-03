import { Request, Response } from 'express';
import { replaceId } from '../../services/replaceService';
const Project = require('../../model/project');
const User = require('../../model/user');
import status from 'http-status';
const { Types } = require('mongoose');
const { validationResult } = require('express-validator');
import { asyncHandler } from '../../utils/helper';
import { initProject } from '../../services/projectService';
const logger = require('../../../loaders/logger');
//get
exports.index = asyncHandler(async (req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const userModel = await User.getModel(req.tenantsConnection);
  const projects = await Project.getModel(req.dbConnection)
    .find({ isDelete: false, tenantId: req.tenantId || req.userId })
    .populate({ path: 'projectLeadId', model: userModel })
    .populate({ path: 'ownerId', model: userModel });
  res.send(replaceId(projects));
});

//get one
exports.show = asyncHandler(async (req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const userModel = await User.getModel(req.tenantsConnection);
  const project = await Project.getModel(req.dbConnection)
    .findOne({ _id: req.params.id, isDelete: false })
    .populate({ path: 'projectLeadId', model: userModel })
    .populate({ path: 'ownerId', model: userModel });
  res.status(200).send(replaceId(project));
});

//POST
exports.store = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const { body, dbConnection, tenantId } = req;
  const userId = req.body.userId;
  try {
    const project = await initProject(body, userId, dbConnection, tenantId || userId);
    res.status(status.CREATED).send(replaceId(project));
  } catch (e) {
    logger.error(e);
    res.sendStatus(status.INTERNAL_SERVER_ERROR);
  }
});

// put
exports.update = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  if (Types.ObjectId.isValid(req.params.id)) {
    const project = await Project.getModel(req.dbConnection).findByIdAndUpdate(
      Types.ObjectId(req.params.id),
      req.body,
      { new: true },
    );
    if (project) return res.send(replaceId(project));
    return res.sendStatus(status.BAD_REQUEST);
  }
  res.sendStatus(status.UNPROCESSABLE_ENTITY);
});

//delete
exports.delete = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  if (Types.ObjectId.isValid(req.params.id)) {
    await Project.getModel(req.dbConnection).findByIdAndUpdate(Types.ObjectId(req.params.id), {
      isDelete: true,
    });
    res.status(status.NO_CONTENT).json({});
  }
});
