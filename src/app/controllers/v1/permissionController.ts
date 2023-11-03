import { Request, Response, NextFunction } from 'express';
const Permission = require('../../model/permission');
import status from 'http-status';
const { validationResult } = require('express-validator');
const { replaceId } = require('../../services/replaceService');

//get
exports.index = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  try {
    //use cache after all features move to v2
    const permission = await Permission.getModel(req.tenantsConnection).find();
    res.send(replaceId(permission));
  } catch (e) {
    next(e);
  }
};
