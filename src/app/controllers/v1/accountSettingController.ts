import { Response, Request, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import status from 'http-status';
const User = require('../../model/user');

const { passwordAuth } = require('../../services/passwordAuthService');
const { encryption } = require('../../services/encryptionService');

interface IUser {
  _id?: Object;
  password?: string;
}

exports.updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const { newPassword, oldPassword } = req.body;
  const userId = req.body.userInfo.id;
  const userModel = await User.getModel(req.tenantsConnection);
  const user = await userModel.findOne({ _id: userId });
  try {
    const checkPasswordFlag = await passwordAuth(oldPassword, user.password);
    if (!checkPasswordFlag) {
      return res.sendStatus(status.NOT_ACCEPTABLE);
    }
    const newHashPassword = await encryption(newPassword);
    const passwordUpdateFlag = await User.getModel(req.dbConnection).updateOne(
      { _id: userId },
      { password: newHashPassword },
    );
    if (!passwordUpdateFlag) {
      return res.sendStatus(status.NOT_ACCEPTABLE);
    }
    return res.sendStatus(status.OK);
  } catch (e) {
    next(e);
  }
  res.sendStatus(status.UNPROCESSABLE_ENTITY);
};

exports.update = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const {
    name = '',
    avatarIcon = '',
    userName = '',
    abbreviation = '',
    jobTitle = '',
    location = '',
  } = req.body;

  const user: any = req.user;
  if (!user) {
    return;
  }

  const userModel = await User.getModel(req.tenantsConnection);
  const updateUser = await userModel.findOneAndUpdate(
    { _id: user._id },
    {
      name,
      avatarIcon,
      userName,
      abbreviation,
      jobTitle,
      location,
    },
    { new: true },
  );
  if (!updateUser) {
    res.sendStatus(status.NOT_ACCEPTABLE);
    return;
  }
  res.send(updateUser);
};

exports.destroy = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }

  const password = req.body.password;
  if (typeof req.user === 'object') {
    const user: IUser = req.user;
    try {
      const checkPasswordFlag = await passwordAuth(password, user.password ?? 'string');
      if (!checkPasswordFlag) {
        res.sendStatus(status.FORBIDDEN);
      }
      const userModel = await User.getModel(req.tenantsConnection);
      await userModel.deleteOne({ _id: user._id });
      return res.sendStatus(status.OK);
    } catch (e) {
      next(e);
    }
  }
  res.sendStatus(status.UNPROCESSABLE_ENTITY);
};
