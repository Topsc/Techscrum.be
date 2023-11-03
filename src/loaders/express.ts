import express, { NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import config from '../app/config/app';
const apiRouterV1 = require('../app/routes/v1/api');
const apiRouterV2 = require('../app/routes/v2/api');
const cors = require('cors');
const helmet = require('helmet');
const swagger = require('./swagger');
const { errorHandler } = require('./errorHandler');
import status from 'http-status';
const compression = require('compression');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = () => {
  const app = express();

  //global middleware
  app.use(compression());
  app.use(cors());
  app.use(express.json());
  if (process.env.LIMITER?.toString() === true.toString()) {
    app.use(limiter);
  }
  app.use(helmet());
  app.use(`${config.api.prefix}/v1`, apiRouterV1);
  app.use(`${config.api.prefix}/v2`, apiRouterV2);
  swagger(app);
  app.use((err: Error, req: express.Request, res: express.Response, next: NextFunction) => {
    errorHandler.handleError(err, res);
    res.status(status.INTERNAL_SERVER_ERROR).send();
    next();
  });

  return app;
};
