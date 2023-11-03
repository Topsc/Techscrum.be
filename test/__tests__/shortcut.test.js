const request = require('supertest');
const dbHandler = require('../dbHandler');
const User = require('../../src/app/model/user');
const mongoose = require('mongoose');
const Project = require('../../src/app/model/project');
const sinon = require('sinon');
const saasMiddleware = require('../../src/app/middleware/saasMiddleware');
let application = null;
let dbConnection = '';

const userId = new mongoose.Types.ObjectId();
const projectId = new mongoose.Types.ObjectId();
const shortcutId = new mongoose.Types.ObjectId();

const user = {
  _id: userId,
  email: 'test@gamil.com',
  password: 'testtesttest',
  active: true,
};

const project = {
  _id: projectId,
  name: 'test name',
  key: 'key123',
  projectLeadId: 'projectLead1',
  ownerId: userId,
  boardId: 'board123',
  shortcut: [{ _id: shortcutId, name: 'yahoo.co.jp', shortcutLink: 'yahoo' }],
};

beforeAll(async () => {
  dbConnection = await dbHandler.connect();
  await dbHandler.clearDatabase();
  await User.getModel(dbConnection).create(user);
  await Project.getModel(dbConnection).create(project);

  sinon.stub(saasMiddleware, 'saas').callsFake(function (req, res, next) {
    req.dbConnection = dbConnection;
    return next();
  });

  const app = require('../../src/loaders/express');
  application = app();
});

afterAll(async () => {
  saasMiddleware.saas.restore();
  await dbHandler.closeDatabase();
});

describe('Create Shortcut Test', () => {
  it('should create shortcut', async () => {
    const shortcut = { shortcutLink: 'https://www.google.com', name: 'Google' };
    const res = await request(application)
      .post(`/api/v1/projects/${projectId}/shortcuts`)
      .send({ ...shortcut });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(expect.objectContaining({ ...shortcut }));
  });

  it('should return 403 if provided a link without http://', async () => {
    const shortcut = { shortcutLink: 'go.com', name: 'go' };
    const res = await request(application)
      .post(`/api/v1/projects/${projectId}/shortcuts`)
      .send({ ...shortcut });
    expect(res.statusCode).toEqual(403);
  });

  it('should return 422', async () => {
    const shortcut = { shortcutLink: undefined, name: undefined };
    const res = await request(application)
      .post(`/api/v1/projects/${projectId}/shortcuts`)
      .send({ ...shortcut });
    expect(res.statusCode).toEqual(422);
  });
});
describe('Update Shortcut Test', () => {
  it('should update shortcut', async () => {
    const newShortcut = { shortcutLink: 'https://www.steinsgate.jp/', name: 'Steins Gate' };
    const res = await request(application)
      .put(`/api/v1/projects/${projectId}/shortcuts/${shortcutId}`)
      .send({ ...newShortcut });
    expect(res.statusCode).toEqual(200);
  });
  it('should Return Conflict', async () => {
    const newShortcut = { shortcutLink: 'twitter.com', name: 'Twitter' };
    const wrongShortcutId = '62ee2acf9ec184ff866da4e3';
    const WrongProjectId = '62edd13ce3af744361a45fed';
    const res = await request(application)
      .put(`/api/v1/projects/${WrongProjectId}/shortcuts/${wrongShortcutId}`)
      .send({ ...newShortcut });
    expect(res.statusCode).toEqual(409);
  });
  it('should return 422', async () => {
    const shortcut = { shortcutLink: undefined, name: undefined };
    const wrongShortcutId = '62ee2c4641dbc06481a70e03';
    const res = await request(application)
      .put(`/api/v1/projects/${projectId}/shortcuts/${wrongShortcutId}`)
      .send({ ...shortcut });
    expect(res.statusCode).toEqual(422);
  });
});
describe('Destroy Shortcut Test', () => {
  it('should delete shortcut', async () => {
    const res = await request(application).delete(
      `/api/v1/projects/${projectId}/shortcuts/${shortcutId}`,
    );
    expect(res.statusCode).toEqual(200);
  });
  it('should return NOT_FOUND', async () => {
    const res = await request(application).delete(
      `/api/v1/projects/${projectId}/shortcuts/${shortcutId}`,
    );
    expect(res.statusCode).toEqual(404);
  });
});
