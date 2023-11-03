//62e4b5606fb0da0a12dcfe67

const request = require('supertest');
const sinon = require('sinon');
const authMiddleware = require('../../src/app/middleware/authMiddleware');
let application = null;

beforeAll(function () {
  sinon.stub(authMiddleware, 'authenticationTokenMiddleware')
    .callsFake(function (req, res, next) {
      return next();
    });
  
  // after you can create app:
  const app = require('../../src/loaders/express');
  application = app();
});

afterAll(async function () {
  // restore original method
  authMiddleware.authenticationTokenMiddleware.restore();
});

describe('Project Test', () => {
  it('should get projects', () => {
    return request(application)
      .get('/api/v1/projects').expect(200);
  });
});