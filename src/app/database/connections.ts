export {};

const { tenantConnection, dataConnectionPool } = require('../utils/dbContext');
const mongoose = require('mongoose');
import config from '../../app/config/app';
const PUBLIC_DB = 'publicdb';
mongoose.set('strictQuery', false);

const options = {
  useNewURLParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  socketTimeoutMS: 30000,
};

exports.tenantsDBConnection = async () => {
  if (!tenantConnection?.connection) {
    tenantConnection.connection = await mongoose.createConnection(
      config.tenantsDBConnection, 
      options,
    );
  }
  return tenantConnection.connection;
};
  
exports.tenantDBConnection = async (tenant: string) => {
  if (!dataConnectionPool || !dataConnectionPool[tenant]!) {
    const dataConnectionMongoose = await mongoose.createConnection(
      config.publicConnection.replace(PUBLIC_DB, tenant), 
      options,
    );
    dataConnectionPool[tenant] = dataConnectionMongoose;
    return dataConnectionMongoose;
  }
  return dataConnectionPool[tenant]; 
};

exports.PUBLIC_DB = PUBLIC_DB;
