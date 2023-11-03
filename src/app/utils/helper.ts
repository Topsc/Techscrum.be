import { NextFunction, Response, Request  } from 'express';

const User = require('../model/user');
const Tenant = require('../model/tenants');
const Product = require('../model/product');
const PaymentHistory = require('../model/paymentHistory');
const Invoice = require('../model/invoice');
import config from '../config/app';

export const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

export const shouldExcludeDomainList = (host: string | undefined) => {
  if (!host) {
    return false;
  }
  if (config.environment.toLowerCase() === 'local') {
    return true;
  }
  const domains = [
    `https://www.${config.mainDomain}`,
    `https://dev.${config.mainDomain}`,
    `https://staging.${config.mainDomain}`,
    `https://uat.${config.mainDomain}`,
  ];

  return domains.some((domain) => host.includes(domain));
};

export function removeHttp(url: string | undefined) {
  if (!url) {
    return '';
  }
  return url.replace(/^https?:\/\//, '');
}

export const createUserModel = async (req: Request) => {
  const userModel = await User.getModel(req.tenantsConnection);
  return userModel;
};

export const createTenantsModel = async (req: Request) => {
  const tenantModel = await Tenant.getModel(req.tenantsConnection);
  return tenantModel;
};

export const createProductModel = async (req: Request) => {
  const productModel = await Product.getModel(req.tenantsConnection);
  return productModel;
};

export const createPaymentHistoryModel = async (req: Request) => {
  const paymentHistoryModel = await PaymentHistory.getModel(req.tenantsConnection);
  return paymentHistoryModel;
};

export const createInvoiceModel = async (req: Request) => {
  const invoiceModel = await Invoice.getModel(req.tenantsConnection);
  return invoiceModel;
};

