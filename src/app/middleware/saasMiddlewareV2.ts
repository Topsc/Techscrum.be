/* eslint-disable no-console */
/* eslint-disable no-secrets/no-secrets */
export {};
import { Response, Request, NextFunction } from 'express';
import { asyncHandler } from '../utils/helper';
import status from 'http-status';
const Tenant = require('../model/tenants');
import config from '../../app/config/app';
const { dataConnectionPool } = require('../utils/dbContext');
const logger = require('../../loaders/logger');
const { tenantsDBConnection, tenantDBConnection, PUBLIC_DB } = require('../database/connections');

enum Plans {
  Free = 'Free',
}

const getTenant = async (host: string | undefined, connection: any, useOrigin: boolean) => {
  const tenantModel = Tenant.getModel(connection);
  const isLocalAndUseOrigin = config.environment === 'local'  && useOrigin;
  const tenant = isLocalAndUseOrigin ? await tenantModel.findOne({ origin: { $regex: 'localhost' } }) : await tenantModel.findOne({ origin: host });

  if (!config?.emailSecret) {
    logger.error('Missing email secret in env');
    throw new Error('Missing email secret in env');
  }
 
  if (!tenant && config.environment.toLowerCase() !== 'local') {
    throw new Error('Cannot find tenant');
  }
  return tenant;
};

const getConnectDatabase = (tenant: any) : string=> {
  //TODO: Fix this code
  return tenant?.plan !== Plans.Free ? tenant.id.toString() : PUBLIC_DB;
};

const saas = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  //For more info: https://lucid.app/lucidspark/c24b6e6f-7e1a-439a-a4bf-699edd941d86/edit?viewport_loc=-151%2C-545%2C2560%2C1249%2C0_0&invitationId=inv_052c9ca7-93bd-491e-b621-f97c52fe116f

  try {
    const connectTenant = `${config.protocol}${config.connectTenantsOrigin}.${config.mainDomain}`;
    const useOrigin = !config.connectTenantsOrigin || config.connectTenantsOrigin === '';
    const domain = useOrigin ? req.headers.origin : connectTenant;
    const tenantsConnection = await tenantsDBConnection();
    const tenant = await getTenant(domain, tenantsConnection, useOrigin);
    const tenantId = tenant?.id.toString();
    const connectTenantDbName = getConnectDatabase(tenant);
    const tenantConnection = await tenantDBConnection(connectTenantDbName);
    
    req.tenantsConnection = tenantsConnection;
    req.userConnection = tenantConnection;
    req.dbConnection = dataConnectionPool[connectTenantDbName];
    req.tenantId = tenantId;
    req.dbName = connectTenantDbName;
  } catch (e:any) {
    let message = null;
    if (e.message.includes('Cannot read properties of null (reading \'id\')')) {
      message = `\x1b[31mError: Cannot find tenant:(${config.connectTenantsOrigin}) in this database (${config.tenantsDBConnection}).\nPlease ensure the CONNECT_TENANT in .env file or database is correct. \n\x1b[31mRESTART SERVER AFTER CHANGE \x1b[0m\n`;
      console.error(message);
    }
    logger.error(message ?? e);
    return res.sendStatus(status.INTERNAL_SERVER_ERROR);
  }
  return next();
});

module.exports = { saas };
