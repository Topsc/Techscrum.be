const request = require('supertest');
const sinon = require('sinon');
const dbHandler = require('../dbHandler');
const saasMiddleware = require('../../src/app/middleware/saasMiddleware');
const User = require('../../src/app/model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
import config from '../../src/app/config/app';

let application = null;
let dbConnection = '';

beforeAll(async () => {
  dbConnection = await dbHandler.connect();
  await dbHandler.clearDatabase();

  await User.getModel(dbConnection).create({
    email: 'test@gamil.com',
    password: await bcrypt.hash('testPassword', 8),
    active: true,
  });

  sinon.stub(saasMiddleware, 'saas').callsFake(function (req, res, next) {
    req.dbConnection = dbConnection;
    return next();
  });

  // after you can create app:
  const app = require('../../src/loaders/express');
  application = app();
});

afterAll(async () => {
  // restore original method
  saasMiddleware.saas.restore();
  await dbHandler.closeDatabase();
});

describe('Reset Password Post Test', () => {
  it('should get user', async () => {
    const email = 'test@gamil.com';
    const res = await request(application).post('/api/v1/reset-password').send({ email });
    expect(res.statusCode).toBe(200);
    const user = await User.getModel(dbConnection).findOne({ email });
    expect(res.text).toMatch(JSON.stringify(user));
  });
});

describe('Reset Password Post Test: return 404 if user not found', () => {
  it('should not get user', async () => {
    const email = 'abcd@gamil.com';
    const res = await request(application).post('/api/v1/reset-password').send({ email });
    expect(res.statusCode).toBe(404);
  });
});

describe('Forget Password Get User by TOken Test', () => {
  it('should get user', async () => {
    const email = 'test@gmail.com';
    const token = jwt.sign({ email }, config.forgotSecret);
    const res = await request(application).get(`/api/v1/change-password/${token}`).send();
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.text)).toMatchObject({ email });
  });
});

describe('Reset Password Test', () => {
  it('should get user', async () => {
    const email = 'test@gamil.com';
    const password = 'EmilSu-1234';
    const token = jwt.sign({ email }, config.forgotSecret);
    const res = await request(application)
      .put(`/api/v1/change-password/${token}`)
      .send({ password });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.text).email).toMatch(email);

    const user = await User.getModel(dbConnection).findOne({ email });
    const passwordCompareReulst = bcrypt.compare(password, user.password);
    expect(passwordCompareReulst).toBeTruthy();
  });
});