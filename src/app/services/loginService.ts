import { Mongoose } from 'mongoose';
const Tenants = require('../model/tenants');
const User = require('../model/user');

//TODO: checkUserTenants ??? getUserTenants
export const checkUserTenants = async (email: string, origin: any, dbConnection: Mongoose) => {
  const connectTenant = process.env.CONNECT_TENANT;
  const userModel = User.getModel(dbConnection);
  const tenantsModel = Tenants.getModel(dbConnection);
  if (connectTenant) {
    const userTenants = await userModel.findOne({ email });
    return userTenants.tenants;
  }

  const userTenants = await userModel.findOne({ email }).populate({
    path: 'tenants',
    model: tenantsModel,
    match: { $and: [{ origin, active: true }] },
  });

  return userTenants.tenants;
};
