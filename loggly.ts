/* eslint-disable no-console */
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const appRoot = path.dirname(require?.main?.filename);
const parentDirectory = path.resolve(appRoot, '..');
const LOGGLY_ENDPOINT = process.env.LOGGLY_ENDPOINT;
const LOG_FILE_PATH = path.join(parentDirectory, 'storage', 'logs', 'logger.log');
console.log(appRoot, LOG_FILE_PATH);
fs.readFile(LOG_FILE_PATH, 'utf8', async (err:any, logData:any) => {
  if (err) {
    console.error('Failed to read the log file:', err);
    return;
  }

  if (!logData) {
    console.log('No logs to send.');
    return;
  }
  
  const response = await axios.post(LOGGLY_ENDPOINT,  {
    headers: {
      'Content-Type': 'text/plain',
    },
    body: logData,
  }).catch((errorAxios:any) => {
    console.error('Failed to send logs to Loggly:', errorAxios.message);
  });

  if (response.status !== 200) {
    console.error('Loggly responded with status:', response.status, response.data);
    process.exit();
  }

  // Optional: Clear the log file after sending.
  fs.truncate(LOG_FILE_PATH, 0, (errMessage:any) => {
    if (errMessage) {
      console.error('Failed to clear the log file:', errMessage);
    }
  });
});