import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import status from 'http-status';
import aws from 'aws-sdk';
import config from '../../config/app';

exports.store = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  try {
    const params = {
      Destination: {
        ToAddresses: [config.companyAddress],
      },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: 'Techscrum - Contact',
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data:
              '<p>Someone has send you a email.</p>' +
              `<p>FullName: ${req.body.fullName} Company: ${req.body.company} Email: ${req.body.email} Number: ${req.body.number}</p>
              <p>Techscrum Team</p>`,
          },
        },
      },
      Source: `admin@${config.mainDomain}`,
    };

    // Create the promise and SES service object
    new aws.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
    return res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};
