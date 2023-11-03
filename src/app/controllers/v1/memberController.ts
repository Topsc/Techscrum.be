import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { replaceId } from '../../services/replaceService';
const { randomStringGenerator } = require('../../utils/randomStringGenerator');
import { invite } from '../../utils/emailSender';
const User = require('../../model/user');
const Project = require('../../model/project');
import status from 'http-status';
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const logger = require('../../../loaders/logger');

exports.index = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  try {
    const userModel = await User.getModel(req.tenantsConnection);
    const users = await userModel.find({ active: true });
    const projectMembersList = [];
    const projectId = req.params.id;

    for (const user of users) {
      const projectRoles = user.projectsRoles;
      for (const projectRole of projectRoles) {
        if (projectRole?.projectId?.toString() === projectId) {
          projectMembersList.push(user);
        }
      }
    }
    res.send(replaceId(projectMembersList));
  } catch (e) {
    next(e);
  }
};

exports.update = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const { userId, projectId } = req.params;
  const { roleId } = req.body;
  const userModel = await User.getModel(req.tenantsConnection);
  const user = await userModel.findById(userId);

  for (const element of user.projectsRoles) {
    if (element?.projectId?.toString() === projectId) {
      element.roleId = roleId;
    }
  }
  const updateUser = await user.save();
  res.send(replaceId(updateUser));
};

exports.delete = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const { userId, projectId } = req.params;
  const userModel = await User.getModel(req.tenantsConnection);
  const user = await userModel.findById(userId);
  const updatedProjectRoles = user.projectsRoles.filter((item: any) => {
    return item.projectId?.toString() !== projectId;
  });
  user.projectsRoles = updatedProjectRoles;
  const updateUser = await user.save();
  res.send(replaceId(updateUser));
};

exports.invite = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const { projectId } = req.params;
  const { roleId, email } = req.body;
  const userModel = await User.getModel(req.tenantsConnection);

  const projectModel = Project.getModel(req.dbConnection);

  try {
    const project = await projectModel.findById(projectId);
    const { name: roleName }: { name: string } = project.roles.find((role: any) => {
      return role._id.toString() === roleId;
    });

    let validationToken = '';
    let user = await userModel.findOne({ email });
    if (!user) {
      const activeCode = randomStringGenerator(16);
      user = await new userModel({ email, activeCode });
      await user.save();
    }

    const permission = await userModel.findOne({
      email: email,
      'projectsRoles.projectId': mongoose.Types.ObjectId(projectId),
    });
    if (!permission) {
      user = await userModel.findByIdAndUpdate(
        user._id,
        {
          $push: {
            projectsRoles: [{ projectId: projectId, roleId: roleId }],
          },
        },
        { new: true },
      );
    }

    if (!user.active)
      validationToken = jwt.sign({ email, activeCode: user.activeCode }, process.env.EMAIL_SECRET);

    const name = user.active ? user.name : '';
    invite(user.email, name, validationToken, roleName, project.name, req.headers.origin ?? '');
    res.send(user);
  } catch (e: any) {
    logger.info('Cannot invite member', e.toString());
    res.status(status.SERVICE_UNAVAILABLE).send();
  }
};
