import { Response, Request, NextFunction } from 'express';
const User = require('../../model/user');

import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/helper';
import { checkUserTenants } from '../../services/loginService';
import status from 'http-status';
import config from '../../config/app';
declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    user?: object;
    verifyEmail?: string;
    token?: string;
    refreshToken?: string;
  }
}

exports.login = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }

  const origin = req.get('origin');

  const user = await User.getModel(req.tenantsConnection).findByCredentials(
    req.body.email,
    req.body.password,
  );
  if (user === null) return res.status(status.UNAUTHORIZED).send();
  if (user === undefined) return res.status(status.UNAUTHORIZED).send();
  //check the if the domain is in user's tenants when user login
  if (config.environment.toLowerCase() === 'local') {
    const token = await user.generateAuthToken();
    return res.send({ user, ...token });
  }
  const qualifiedTenants = await checkUserTenants(req.body.email, origin, req.tenantsConnection);
  if (qualifiedTenants.length > 0) {
    const token = await user.generateAuthToken();
    return res.send({ user, ...token });
  } else {
    return res.status(status.UNAUTHORIZED).send();
  }
});

exports.autoFetchUserInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(status.UNPROCESSABLE_ENTITY).json({});
    }

    try {
      if (!req.userId) return res.status(status.FORBIDDEN).send();
      res.send({ user: req.user, token: req.token, refreshToken: req.refreshToken });
    } catch (e) {
      next(e);
    }
  },
);
