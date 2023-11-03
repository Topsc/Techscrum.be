/* eslint-disable no-secrets/no-secrets */
const dotenv = require('dotenv');
const stripeAPI = require('stripe');
process.env.NODE_ENV = process.env.NODE_ENV ?? 'development';
dotenv.config();

export const config = {
  environment: process.env.ENVIRONMENT ?? 'production',
  name: process.env.NAME ?? 'techscrumapp',
  port: process.env.PORT ?? 8000,
  api: {
    prefix: process.env.API_PREFIX ?? '/api',
  },
  version: '1.0.0',
  companyAddress: process.env.COMPANY_ADDRESS ?? '',
  emailSecret: process.env.EMAIL_SECRET ?? '123456',
  forgotSecret: process.env.FORGET_SECRET ?? '321654',
  stripe: stripeAPI(process.env.STRIPE_PRIVATE_KEY) ?? null,
  stripeSecret: process.env.STRIPE_WEBHOOK_SECRET ?? null,
  //---------------------------v2--------------------------
  tenantsDBConnection: process.env.TENANTS_CONNECTION ?? 'mongodb+srv://admin:admin@techscrum.p2i9wko.mongodb.net/users?authSource=admin',
  publicConnection: process.env.PUBLIC_CONNECTION ?? 'mongodb+srv://admin:admin@techscrum.p2i9wko.mongodb.net/publicdb?authSource=admin',
  connectTenantsOrigin: process.env.CONNECT_TENANT ?? null,
  mainDomain: process.env.MAIN_DOMAIN ?? null,
  protocol: process.env.ENVIRONMENT === 'local' ? 'http://' : 'https://',
  devopsMode: process.env.DEVOPS_MODE ?? 'false',
};

export default config;