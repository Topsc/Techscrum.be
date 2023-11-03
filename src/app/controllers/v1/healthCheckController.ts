export {};
import { Request, Response } from 'express';
import status from 'http-status';
import { config } from '../../config/app';
import { awsConfig } from '../../config/aws';

exports.index = (req: Request, res: Response) => {
  return res.sendStatus(status.OK);
};

exports.envs = (req: Request, res: Response)  => {
  return res.status(status.OK).send({
    message: 'SERIOUS SECURITY ISSUE!!! YOU ARE EXPOSING THESE KEYS TO THE WORLD, PLEASE REMEMBER TO TURN IS_DEVOPS OFF ONCE FINISH DEBUGGING', 
    environment: config.environment,
    mainDomain: config.mainDomain,
    tenantsDBConnection: config.tenantsDBConnection, 
    publicDBConnection: config.publicConnection, 
    awsRegion: awsConfig.awsRegion, 
    awsAccessKey: awsConfig.awsAccessKey, 
    awsSecretKey: awsConfig.awsSecretKey, 
    serverEmail: `noreply@${config.mainDomain}`,
  });
};