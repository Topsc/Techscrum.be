import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/helper';
const Permission = require('../../model/permission');
const Project = require('../../model/project');
const Role = require('../../model/role');
import status from 'http-status';
const { validationResult } = require('express-validator');
const { replaceId } = require('../../services/replaceService');
const { Types } = require('mongoose');

exports.index = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  try {
    const { projectId } = req.params;
    //use cache after all features moved to v2
    const project = await Project.getModel(req.dbConnection)
      .findById(projectId)
      .populate({
        path: 'roles.permission',
        model: Permission.getModel(req.tenantsConnection),
      });
    const rolesArr = project.roles;
    res.send(replaceId(rolesArr));
  } catch (e) {
    next(e);
  }
};

exports.getRoleById = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  try {
    const { projectId, roleId } = req.params;
    //use cache after all features moved to v2
    const project = await Project.getModel(req.dbConnection)
      .findById(projectId)
      .populate({
        path: 'roles.permission',
        model: Permission.getModel(req.tenantsConnection),
      });

    const rolesArr = project.roles.filter(
      (element: { id: { toString: () => string } }) => element?.id?.toString() === roleId,
    )[0];

    res.send(replaceId(rolesArr));
  } catch (e) {
    next(e);
  }
};

exports.addNewRole = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const { projectId } = req.params;
  const { roleName, permissions } = req.body;
  if (Types.ObjectId.isValid(projectId)) {
    const project = await Project.getModel(req.dbConnection).findByIdAndUpdate(
      Types.ObjectId(projectId),
      {
        $push: {
          roles: [{ name: roleName, slug: roleName, permission: permissions }],
        },
      },
      { new: true },
    );
    if (project) return res.send(replaceId(project));
    return res.sendStatus(status.BAD_REQUEST);
  }
  res.sendStatus(status.UNPROCESSABLE_ENTITY);
});

exports.update = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const { roleId, projectId } = req.params;
  const { permissions } = req.body;
  const project = await Project.getModel(req.dbConnection).findById(projectId);

  for (const element of project.roles) {
    if (element?.id?.toString() === roleId) {
      element.permission = permissions;
    }
  }

  const updatedProject = await project.save();
  res.send(replaceId(updatedProject));
};

exports.delete = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const { projectId, roleId } = req.params;
  const project = await Project.getModel(req.dbConnection).findById(projectId);
  const updatedProjectRoles = project.roles.filter((item: any) => {
    return item._id?.toString() !== roleId;
  });
  project.roles = updatedProjectRoles;
  const updateProject = await project.save();
  res.send(replaceId(updateProject));
};

exports.getDefaultRoles = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  //use cache after all features moved to v2 ????
  const roles = await Role.getModel(req.tenantsConnection).find({});
  return res.status(status.OK).json(replaceId(roles));
};
