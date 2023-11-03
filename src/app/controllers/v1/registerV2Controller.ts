import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/helper';
const mongoose = require('mongoose');
import status from 'http-status';
const Tenant = require('../../model/tenants');
const User = require('../../model/user');
const { emailRegister } = require('../../services/registerServiceV2');
const logger = require('../../../loaders/logger');
const { tenantsDBConnection } = require('../../database/connections');
import config from '../../config/app';

export const invalidSubdomains : { [key: string]: boolean } = { 
  'localhost' : true, 
  'local': true,
  'dev': true, 
  'staging': true,
  'uat': true, 
  'testing': true, 
  'test': true, 
  'develop': true,
  'qat': true,
  'qa': true,
  'www': true, 
  'api-dev': true,
  'api-staging': true,
  'api': true,
  'api-develop': true,
  'api-uat': true,
  'api-qa': true,
  'api-qat': true,
};

const canRegisterCompany = (company:string) => {
  if (invalidSubdomains[company]) {
    return false;
  }
  return true;
};  

export const register = asyncHandler(async (req: Request, res: Response) => {
  // check Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.send(status.UNPROCESSABLE_ENTITY).json({});
  }
  const { email, company } = req.body;
  if (!canRegisterCompany(company)) {
    res.send(status.BAD_REQUEST).json({ errorMessage: 'Invalid company name. ' + Object.keys(invalidSubdomains).join(' ') + ' are not allowed.' });
  }
  let tenantModel;
  let newTenants;
  let tenantsUrl = `${config.protocol}${company}.${config.mainDomain}`;
  const tenantsDbConnection = await tenantsDBConnection();
 
  try {
    // create new Tenant
    tenantModel = await Tenant.getModel(tenantsDbConnection);
    newTenants = await tenantModel.create({ origin: tenantsUrl });
  } catch (err) {
    return res.status(400).json({ status: 'fail', err });
  }

  try {
    // update User and send email
    const { newUser, validationToken } = await emailRegister(
      tenantsDbConnection,
      email,
      newTenants,
      req.headers.origin,
    );

    newTenants.owner = mongoose.Types.ObjectId(newUser.id);
    await newTenants.save();
    return res
      .status(200)
      .json({ status: 'success', data: { newTenants, newUser, validationToken } });
  } catch (err: any) {
    // delete tenant if error
    logger.error('registerV2Controller Fail:' + err);
    await tenantModel.findOneAndDelete({ origin: tenantsUrl });
    res.status(status.INTERNAL_SERVER_ERROR).json({ status: 'fail', err: err?.message });
  }
});

//Active account
exports.store = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }

  try {
    const { email, name, password } = req.body;
    const user = await User.getModel(req.tenantsConnection).saveInfo(email, name, password);
    user.activeAccount();
    const activeTenant = user.tenants.at(-1);
    const tenantModel = await Tenant.getModel(req.tenantsConnection);
    await tenantModel.findByIdAndUpdate(activeTenant, { active: true });
    res.send({ user });
  } catch (err) {
    res.status(status.INTERNAL_SERVER_ERROR).json({
      status: 'fail',
      error: 'register err:' + JSON.stringify(err),
    });
  }
});

//Verify Email by token
exports.verify = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }

  try {
    const email = req.verifyEmail ?? '';
    const user = await User.getModel(req.tenantsConnection).findOne({ email });
    res.send({ email, active: user.active });
  } catch (err) {
    res.status(status.INTERNAL_SERVER_ERROR).json({
      status: 'fail',
      error: 'register err:' + JSON.stringify(err),
    });
    next(err);
  }
});
