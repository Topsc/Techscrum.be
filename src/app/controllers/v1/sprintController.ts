import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { replaceId } from '../../services/replaceService';
import { deleteSprint, findSprint, updateSprint } from '../../services/sprintService';
import { asyncHandler } from '../../utils/helper';
import status from 'http-status';
const Sprint = require('../../model/sprint');
// show
export const show = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const sprints = await Sprint.getModel(req.dbConnection).find();
  res.status(status.OK).send(sprints);
});
// create
export const store = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const sprintModel = Sprint.getModel(req.dbConnection);
  const sprint = new sprintModel(req.body);
  await sprint.save();
  const createdSprint = await findSprint(req.dbConnection, sprint.id, req.tenantsConnection);
  res.status(status.CREATED).send(replaceId(createdSprint));
});

// update
export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sprint = await Sprint.getModel(req.dbConnection).findById(id);
  if (!sprint) return res.status(404).send();

  const updatedSprint = await updateSprint(req.dbConnection, id, req.body, req.tenantsConnection);
  res.status(status.OK).json(replaceId(updatedSprint));
});

// delete
export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sprint = await Sprint.getModel(req.dbConnection).findById(id);
  if (!sprint) return res.status(404).send();

  await deleteSprint(req.dbConnection, id);
  return res.status(status.NO_CONTENT).json({});
});
