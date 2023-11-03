const request = require('supertest');
const sinon = require('sinon');
const dbHandler = require('../dbHandler');
const saasMiddleware = require('../../src/app/middleware/saasMiddleware');
const User = require('../../src/app/model/user');
const Project = require('../../src/app/model/project');
const Task = require('../../src/app/model/task');
const Comment = require('../../src/app/model/comment');
const bcrypt = require('bcrypt');
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
  await Project.getModel(dbConnection).create({
    _id: '62f33512e420a96f31ddc2bd',
    name: 'test name',
    key: 'key123',
    projectLeadId: 'projectLead1',
    ownerId: '62e8d28a182f4561a92f6aed',
    boardId: 'board123',
  });
  await Task.getModel(dbConnection).create({ _id: '62e4bc9692266e6c8fcd0bbe', title: 'test task' });
  await Comment.getModel(dbConnection).create({
    _id: '62f3664589e47f4d0b7e5327',
    taskId: '62e4bc9692266e6c8fcd0bbe',
    senderId: '62e8d28a182f4561a92f6aed',
    content: 'test update comment',
  });

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

describe('Create Comment Test', () => {
  it('should create comment', async () => {
    const newComment = {
      taskId: '62e4bc9692266e6c8fcd0bbe',
      senderId: '62e8d28a182f4561a92f6aed',
      content: 'new comment',
    };
    const res = await request(application)
      .post('/api/v1/comments')
      .send({ ...newComment });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({ ...newComment });
  });
  it('should return error code 422', async () => {
    const newComment = { taskId: undefined, senderId: undefined, content: 'New Comment' };
    const res = await request(application)
      .post('/api/v1/comments')
      .send({ ...newComment });
    expect(res.statusCode).toEqual(422);
  });
});
describe('Update Comment Test', () => {
  it('should update comment test', async () => {
    const id = '62f3664589e47f4d0b7e5327';
    const newComment = { content: 'Updated Comment' };
    const res = await request(application)
      .put(`/api/v1/comments/${id}`)
      .send({ ...newComment });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({ ...newComment });
  });
  it('should return error code 404', async () => {
    const id = undefined;
    const newComment = { content: undefined };
    const res = await request(application)
      .post(`/api/v1/comments/${id}`)
      .send({ ...newComment });
    expect(res.statusCode).toEqual(404);
  });
  it('should return error code 422', async () => {
    const id = '62f3664589e47f4d0b7e5327';
    const newComment = undefined;
    const res = await request(application)
      .post(`/api/v1/comments/${id}`)
      .send({ ...newComment });
    expect(res.statusCode).toEqual(404);
  });
});
describe('Delete Comment Test', () => {
  it('should delete comment', async () => {
    const id = '62f3664589e47f4d0b7e5327';
    const res = await request(application).delete(`/api/v1/comments/${id}`);
    expect(res.statusCode).toEqual(204);
  });
  it('should return 404', async () => {
    const id = '62f3664589e47f4d0b7e5328';
    const res = await request(application).delete(`/api/v1/comments/${id}`);
    expect(res.statusCode).toEqual(404);
  });
});
