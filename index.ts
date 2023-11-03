/* eslint-disable no-console */
const loader = require('./src/loaders');

const checkEnvironment = () => {
  if (
    process.env.ENVIRONMENT !== 'production' && 
    process.env.ENVIRONMENT !== 'develop' && 
    process.env.ENVIRONMENT !== 'local'
  ) {
    console.error('\x1b[31mENVIRONMENT missing in .env file and RESTART your server after.\x1b[0m');
    process.exit();
  }
};

const checkMainDomain = () => {
  if (process.env.ENVIRONMENT === 'production') {
    if (process.env.MAIN_DOMAIN === '' || !process.env.MAIN_DOMAIN) {
      console.error('\x1b[31mMAIN_DOMAIN missing in .env, required for sending emails.\x1b[0m');
      process.exit();
    }
  }
  
  if (process.env.MAIN_DOMAIN === '' || !process.env.MAIN_DOMAIN) {
    console.warn('\x1b[33mMAIN_DOMAIN missing in .env, required for sending emails.\x1b[0m');
  }  
};

const checkPayment = () => {
  if (process.env.ENVIRONMENT === 'production') {
    if (!process.env.STRIPE_PRIVATE_KEY) {
      console.error('\x1b[31mSTRIPE_PRIVATE_KEY missing in .env, required for payment.\x1b[0m');
      process.exit();
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('\x1b[31mSTRIPE_WEBHOOK_SECRET missing in .env, required for payment.\x1b[0m');
      process.exit();
    }
  }

  if (!process.env.STRIPE_PRIVATE_KEY) {
    console.warn('\x1b[33mSTRIPE_PRIVATE_KEY missing in .env, required for payment.\x1b[0m');
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('\x1b[33mSTRIPE_WEBHOOK_SECRET missing in .env, required for payment.\x1b[0m');
  }
};

const checkAWS = () => {
  if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('\x1b[31mAWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY missing in .env, required for server.\x1b[0m');
    process.exit();
  }
};

const checkSecret = () =>{
  if (!process.env.ACCESS_SECRET) {
    console.error('\x1b[31mACCESS_SECRET missing in .env, required for server.\x1b[0m');
    process.exit();
  }
  if (!process.env.EMAIL_SECRET) {
    console.error('\x1b[31mEMAIL_SECRET missing in .env\x1b[0m');
    process.exit();
  }
  if (!process.env.FORGET_SECRET) {
    console.error('\x1b[31mFORGET_SECRET missing in .env\x1b[0m');
    process.exit();
  }
};

checkEnvironment();
checkMainDomain();
checkPayment();
checkAWS();
checkSecret();

loader.init();


