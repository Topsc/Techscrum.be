const swaggerAutogen = require('swagger-autogen')();
const dotenv = require('dotenv');
process.env.NODE_ENV = process.env.NODE_ENV ?? 'development';
dotenv.config();

const doc = {
  info: {
    title: 'TechScrum API',
    description: 'This is TechScrum API v1',
  },
  host: `localhost:${process.env.PORT}${process.env.API_PREFIX ?? '/api/v1'}`,
  schemes: ['http'],
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./src/app/routes/v1/api.ts'];

swaggerAutogen(outputFile, endpointsFiles, doc);