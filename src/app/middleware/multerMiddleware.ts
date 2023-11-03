const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
import path from 'path';
import awsConfig from '../config/aws';

aws.config.update({
  region: awsConfig.awsRegion,
  accessKeyId: awsConfig.awsAccessKey,
  secretAccessKey: awsConfig.awsSecretKey,
});

const s3 = new aws.S3();

const storage = multerS3({
  s3: s3,
  bucket: 'kitmanimage',
  metadata: function (req:any, file:any, cb:any) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req:any, file:any, cb:any) {
    cb(null, Date.now().toString()  + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
module.exports = upload;
