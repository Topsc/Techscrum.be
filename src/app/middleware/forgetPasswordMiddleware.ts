import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');
import status from 'http-status';
import config from '../config/app';
declare module 'express-serve-static-core' {
  interface Request {
    email?: string;
  }
}

const authenticationForgetPasswordMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.params.token;
  jwt.verify(token, config.forgotSecret, async (err: Error) => {
    if (err) return res.status(status.FORBIDDEN).send();
    const { email } = jwt.verify(token, config.forgotSecret);
    req.email = email;
    next();
  });
};

module.exports = { authenticationForgetPasswordMiddleware };
