const request = require('supertest');
const dbHandler = require('../dbHandler');
const User = require('../../src/app/model/user');
const mongoose = require('mongoose');
const Task = require('../../src/app/model/task');
const sinon = require('sinon');
const saasMiddleware = require('../../src/app/middleware/saasMiddleware');
let application = null;
let dbConnection = '';

const userId = new mongoose.Types.ObjectId();
const taskId = new mongoose.Types.ObjectId();
const statusId = new mongoose.Types.ObjectId();
const projectId = new mongoose.Types.ObjectId();
const boardId = new mongoose.Types.ObjectId();
const reportedId = new mongoose.Types.ObjectId();
const typeId = new mongoose.Types.ObjectId();
const user = {
  _id: userId,
  email: 'test@gamil.com',
  password: 'testtesttest',
  active: true,
};
const task = {
  _id: taskId,
  title: 'demo',
  description: 'demo task',
  statusId: statusId,
  projectId: projectId,
  boardId: boardId,
  sprintId: null,
  reportedId: reportedId,
  typeId: typeId,
  attachmentUrls: [],
};
const activity = { operation: 'created', userId: userId, taskId: taskId };

beforeAll(async () => {
  dbConnection = await dbHandler.connect();
  await dbHandler.clearDatabase();
  await User.getModel(dbConnection).create(user);
  await Task.getModel(dbConnection).create(task);
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

describe('Create and Get Activity Test', () => {
  it('should create shortcut', async () => {
    const res = await request(application)
      .post('/api/v1/activities')
      .send({ ...activity });
    expect(res.statusCode).toEqual(200);
  });
  it('should get existing activities', async () => {
    const res = await request(application).get(`/api/v1/activities/${taskId}`).send();
    expect(res.statusCode).toEqual(200);
  });
});

describe('Delete Activity Test', () => {
  it('Should delete activity', async () => {
    const res = await request(application).delete(`/api/v1/activities/${taskId}`).send();
    expect(res.statusCode).toEqual(200);
  });
  it('should return deleted activities', async () => {
    const res = await request(application).get(`/api/v1/activities/${taskId}`).send();
    const deletedActivity = {
      ...activity,
      isDeleted: true,
      userId: { _id: userId },
    };
    expect(res.body).toMatchObject([deletedActivity]);
  });
});
