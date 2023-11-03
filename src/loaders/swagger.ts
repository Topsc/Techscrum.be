const swaggerUi = require('swagger-ui-express');
import * as data from '../../swagger_output.json';
import { Express } from 'express';

module.exports = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(data));
  return app;
};
