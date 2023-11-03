export {};
import { Response, Request, NextFunction } from 'express';
import { asyncHandler, shouldExcludeDomainList } from '../utils/helper';
const { Mongoose } = require('mongoose');
const Tenant = require('../model/tenants');
import config from '../../app/config/app';
const { dataConnectionPool, tenantConnection } = require('../utils/dbContext');
const logger = require('../../loaders/logger');

const getTenantId = async (host: string | undefined) => {
  //const defaultConnection = config?.defaultTenantConnection ?? 'testdevtechscrumapp';
  const defaultConnection = 'testdevtechscrumapp';
  const excludeDomain = await shouldExcludeDomainList(host);
  const useDefaultConnection = false;
  const haveConnection = Object.keys(tenantConnection).length !== 0;

  if (!host || excludeDomain || useDefaultConnection) {
    return defaultConnection;
  }

  if (!haveConnection) {
    const tenantConnectionMongoose = new Mongoose();
    //const connectionn = config.tenantConnection;
    const connectionn = '';
    tenantConnection.connection = await tenantConnectionMongoose.connect(connectionn);
  }

  const tenantModel = Tenant.getModel(tenantConnection.connection);
  const result = await tenantModel.findOne({ origin: host });
  if (!config?.emailSecret) {
    logger.error('Missing email secret in env');
    throw new Error('Missing email secret in env');
  }
  if (!result) {
    logger.error('Cannot find tanant result');
    throw new Error('Cannot find tanant result');
  }
  return result._id?.toString();
};

const saas = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const domain = req.headers.origin;
  const tenantId: string = await getTenantId(domain);
  // const url = config.db.replace('techscrumapp', tenantId) ;
  const url = '';
  if (!dataConnectionPool || !dataConnectionPool[tenantId]) {
    const dataConnectionMongoose = new Mongoose();
    dataConnectionMongoose.connect(url).then(() => {
      dataConnectionPool[tenantId] = dataConnectionMongoose;
      req.dataConnectionPool = dataConnectionPool;
      req.dbConnection = dataConnectionPool[tenantId];
      req.tenantId = tenantId;
      return next();
    });
  } else {
    req.dataConnectionPool = dataConnectionPool;
    req.dbConnection = dataConnectionPool[tenantId];
    req.tenantId = tenantId;
    return next();
  }
});

module.exports = { saas };
