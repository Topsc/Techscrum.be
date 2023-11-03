export {};
const aws = require('aws-sdk');
const { tenantsDBConnection, tenantDBConnection, PUBLIC_DB } = require('../database/connections');
import config from '../config/app';
const whois = require('whois-json');
import awsConfig from '../config/aws';
const logger = require('../../loaders/logger');

aws.config.update({
  region: awsConfig.awsRegion,
  accessKeyId: awsConfig.awsAccessKey,
  secretAccessKey: awsConfig.awsSecretKey,
});
const sesv2  = new aws.SESV2();
const ses  = new aws.SES();

const hasAllRequiredTemplates = async () => {
  const awsRes = await sesv2.listEmailTemplates({ PageSize: 10 }).promise();
  const requiredTemplates = ['Subscription', 'CustomEmailVerify', 'Access', 'contactPageEmailTemplate', 'ForgotPassword'];
  const existingTemplates = awsRes.TemplatesMetadata.filter((template:any) => requiredTemplates.includes(template.TemplateName));
  return existingTemplates.length === requiredTemplates.length ? '\x1b[32mSuccess\x1b[0m' : '\x1b[31mFailed\x1b[0m';
};

const hasSES = async (domain:string) => {
  const awsRes = await ses.getIdentityVerificationAttributes({ Identities: [domain] }).promise();
  return awsRes.VerificationAttributes[domain] ?  '\x1b[32mSuccess\x1b[0m' : '\x1b[31mFailed\x1b[0m';
};

const isValidDomain = async (domain:string) => {
  const domainData = await whois(domain);
  return domainData.domainStatus ? '\x1b[32mSuccess\x1b[0m' : '\x1b[31mFailed\x1b[0m';
};

exports.healthCheck = async () => {
  const tenantsDbConnection = await tenantsDBConnection();
  const tenantDbConnection = await tenantDBConnection(PUBLIC_DB);
  const domain = config.mainDomain ?? '';
  const tenantsDbConnect = tenantsDbConnection.readyState !== 2 ? '\x1b[31mFailed\x1b[0m' : '\x1b[32mSuccess\x1b[0m';
  const tenantDbConnect = tenantDbConnection.readyState !== 2 ? '\x1b[31mFailed\x1b[0m' : '\x1b[32mSuccess\x1b[0m';
  
  const validDomain = await isValidDomain(domain);
  const hasAllTemplatesUploaded = await hasAllRequiredTemplates();
  const connectedAws = await hasSES(domain);
  const message =  '\nTenantsDb Connect: ' + tenantsDbConnect + ' \n' + 'TenantDb Connect: ' +  tenantDbConnect + '\n' + `Domain(${domain}) Connect: ${validDomain}` + `\nAWS SES: ${connectedAws}\n` +  'AWS SES Templates: ' + hasAllTemplatesUploaded + '\n'; 
  logger.info(message.replace(/\[\d+m/g, '').replace(/\x1B\[\d+m/g, ''));
  return message;
};