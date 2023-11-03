import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');
const User = require('../model/user');
import status from 'http-status';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    user?: object;
    verifyEmail?: string;
    token?: string;
    refreshToken?: string;
  }
}

const authenticationTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  const authType =  authHeader?.split(' ')[0];
  const authToken = authHeader?.split(' ')[1];

  if (!authHeader || !authToken) return res.sendStatus(401);

  if (authType === 'Bearer') {
    jwt.verify(authToken, process.env.ACCESS_SECRET, async (err: Error) => {
      if (err) return res.status(status.FORBIDDEN).send();
      const verifyUser = jwt.verify(authToken, process.env.ACCESS_SECRET);
      const userDb = await User.getModel(req.tenantsConnection);
      const user = await userDb.findOne({ _id: verifyUser.id });
      if (!user) {
        res.status(status.FORBIDDEN).send();
        return;
      }
      req.user = user;
      req.token = authToken;
      req.userId = user.id;
      return next();
    });
    return;
  }
  res.status(status.FORBIDDEN).send();
};

const authenticationTokenValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  const authType = authHeader && authHeader.split(' ')[0];
  const authToken = authHeader && authHeader.split(' ')[1];

  if (!authHeader || !authToken) return res.sendStatus(401);

  if (authType === 'Bearer') {
    jwt.verify(authToken, process.env.ACCESS_SECRET, async (err: Error) => {
      if (err) return next();
      const verifyUser = jwt.verify(authToken, process.env.ACCESS_SECRET);
      const userDb = await User.getModel(req.tenantsConnection);
      const user = await userDb.findOne({ _id: verifyUser.id });
      if (!user) {
        res.status(status.FORBIDDEN).send();
        return;
      }
      req.user = user;
      req.token = authToken;
      req.userId = user.id;
      return next();
    });
    return;
  }
  res.status(status.FORBIDDEN).send();
};

const authenticationRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (Object.keys(req.user ?? {}).length !== 0) return next();
  const authHeader = req.headers.authorization;

  const authType = authHeader && authHeader.split(' ')[0];
  const authRefreshToken = authHeader && authHeader.split(' ')[2];

  if (!authHeader || !authRefreshToken) return res.sendStatus(401);

  if (authType === 'Bearer') {
    jwt.verify(authRefreshToken, process.env.ACCESS_SECRET, async (err: Error) => {
      if (err) return next();
      const verifyUser = jwt.verify(authRefreshToken, process.env.ACCESS_SECRET);
      const userDb = await User.getModel(req.tenantsConnection);
      const user = await userDb.findOne({
        _id: verifyUser.id,
        refreshToken: verifyUser.refreshToken,
      });
      req.user = user;

      req.token = await jwt.sign({ id: user._id.toString() }, process.env.ACCESS_SECRET, {
        expiresIn: '48h',
      });
      req.refreshToken = jwt.sign(
        { id: user._id, refreshToken: user.refreshToken },
        process.env.ACCESS_SECRET,
        {
          expiresIn: '360h',
        },
      );
      req.userId = user.id;
      return next();
    });
    return;
  }
  res.status(status.FORBIDDEN).send();
};

module.exports = {
  authenticationTokenMiddleware,
  authenticationTokenValidationMiddleware,
  authenticationRefreshTokenMiddleware,
};
