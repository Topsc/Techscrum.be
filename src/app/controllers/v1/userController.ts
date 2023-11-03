import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { replaceId } from '../../services/replaceService';
const User = require('../../model/user');
import status from 'http-status';

exports.index = async (req: Request, res: Response) => {
  const { tenantId, user } = req;
  const userModel = await User.getModel(req.tenantsConnection);
  const users = await userModel.find({ active: true, tenants:tenantId });
  if (users.length === 0) {
    res.send(replaceId(user));
  }
  res.send(replaceId(users));
};

exports.show = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  const { id } = req.params;
  const userModel = await User.getModel(req.tenantsConnection);
  const user = await userModel.findById(id);
  return res.status(200).send(user);
};
