const request = require('supertest');
const sinon = require('sinon');
const dbHandler = require('../dbHandler');
const saasMiddleware = require('../../src/app/middleware/saasMiddleware');
const authMiddleware = require('../../src/app/middleware/authMiddleware');
const User = require('../../src/app/model/user');
const Project = require('../../src/app/model/project');
const Task = require('../../src/app/model/task');
const Board = require('../../src/app/model/board');
const Status = require('../../src/app/model/status');
const Type = require('../../src/app/model/type');
const fixture = require('../fixtures/task');
const bcrypt = require('bcrypt');
const { replaceId } = require('../../src/app/services/replaceService');

let application = null;
let dbConnection = '';
let token = '';

const projectId = '6350d443bddbe8fed0138ffe';
const boardId = '6350d443bddbe8fed0138ffd';
const userId = '632fc37a89d19ed1f57c7ab1';
const statusId = '6350d443bddbe8fed0138ff4';
const taskId = '6350e579d6a0ceeb4fc89fd9';
const typeId = '63fe01c8f5b40ad08cfac583';

beforeAll(async () => {
  dbConnection = await dbHandler.connect();
  await dbHandler.clearDatabase();

  await User.getModel(dbConnection).create({
    _id: userId,
    name: 'Joe',
    email: 'test@gmail.com',
    password: await bcrypt.hash('testPassword', 8),
    active: true,
    avatarIcon: 'https://example.png',
  });
  await Project.getModel(dbConnection).create({
    _id: projectId,
    name: 'test name',
    key: 'key123',
    projectLeadId: 'projectLead1',
    ownerId: userId,
    boardId: boardId,
  });

  await Type.getModel(dbConnection).create({
    _id: typeId,
    slug: 'story',
    name: 'Story',
    icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10315?size=medium',
    createdAt: '2022-09-11T07:57:04.258Z',
    updatedAt: '2022-09-11T07:57:04.258Z',
  });

  await Task.getModel(dbConnection).create({
    _id: taskId,
    title: 'test task',
    description: '',
    projectId: projectId,
    boardId: boardId,
    reporterId: userId,
    typeId: typeId,
    status: statusId,
    dueAt: '2022-10-20T06:06:45.946Z',
    createdAt: '2022-10-20T06:06:49.590Z',
  });

  await Status.getModel(dbConnection).create([
    {
      _id: statusId,
      name: 'to do',
      slug: 'to-do',
      order: 0,
      board: '6350d443bddbe8fed0138ffd',
      taskList: ['6350e579d6a0ceeb4fc89fd9'],
    },
    {
      _id: '6350d443bddbe8fed0138ff5',
      name: 'in progress',
      slug: 'in-progress',
      order: 1,
      board: '6350d443bddbe8fed0138ffd',
    },
    {
      _id: '6350d443bddbe8fed0138ff6',
      name: 'review',
      slug: 'review',
      order: 2,
      board: '6350d443bddbe8fed0138ffd',
    },
    {
      _id: '6350d443bddbe8fed0138ff7',
      name: 'done',
      slug: 'done',
      order: 3,
      board: '6350d443bddbe8fed0138ffd',
    },
  ]);

  await Board.getModel(dbConnection).create({
    _id: boardId,
    title: 'Project X',
    taskStatus: [
      '6350d443bddbe8fed0138ff4',
      '6350d443bddbe8fed0138ff5',
      '6350d443bddbe8fed0138ff6',
      '6350d443bddbe8fed0138ff7',
    ],
  });

  sinon.stub(authMiddleware, 'authenticationTokenMiddleware').callsFake(function (req, res, next) {
    return next();
  });
  sinon.stub(saasMiddleware, 'saas').callsFake(function (req, res, next) {
    req.dbConnection = dbConnection;
    return next();
  });

  const app = require('../../src/loaders/express');
  application = app();
});

afterAll(async () => {
  authMiddleware.authenticationTokenMiddleware.restore();
  saasMiddleware.saas.restore();
  await dbHandler.closeDatabase();
});

describe('Get One Task Test', () => {
  it('should show one task', async () => {
    const res = await request(application).get(`/api/v1/tasks/${taskId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(replaceId(fixture.getTask()));
  });
});

describe('Post Task Test', () => {
  it('should create a new task if valid info provided', async () => {
    const newTask = {
      title: 'create task test',
      typeId: typeId,
      boardId: boardId,
      status: 'to do',
      projectId: projectId,
    };
    const res = await request(application)
      .post('/api/v1/tasks')
      .send(newTask)
      .set('Authorization', token);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      id: expect.any(String),
      assignId: null,
      attachmentUrls: [],
      boardId: '6350d443bddbe8fed0138ffd',
      comments: [],
      dueAt: expect.any(Object),
      priority: 'Medium',
      projectId: '6350d443bddbe8fed0138ffe',
      sprintId: null,
      status: {
        id: '6350d443bddbe8fed0138ff4',
        name: 'to do',
        order: 0,
        slug: 'to-do',
      },
      typeId: {
        __v: 0,
        createdAt: expect.any(String),
        id: '63fe01c8f5b40ad08cfac583',
        name: 'Story',
        slug: 'story',
        icon: 'https://010001.atlassian.net/rest/api/2/univeedium',
        updatedAt: expect.any(String),
      },
      storyPoint: 0,
      tags: [],
      title: 'create task test',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it.each`
    field          | value
    ${'title'}     | ${''}
    ${'boardId'}   | ${undefined}
    ${'projectId'} | ${undefined}
    ${'typeId'}    | ${undefined}
  `('should return 422 if $field is $value', async ({ field, value }) => {
    const correctTask = {
      title: 'create task test',
      boardId: boardId,
      projectId: projectId,
    };

    const wrongTask = {
      ...correctTask,
      [field]: value,
    };

    const res = await request(application)
      .post('/api/v1/tasks')
      .send(wrongTask)
      .set('Authorization', token);

    expect(res.statusCode).toEqual(422);
  });

  it('should return 422 if no title was given', async () => {
    const newTask = {
      boardId: boardId,
      status: 'to do',
      projectId: projectId,
    };
    const res = await request(application)
      .post('/api/v1/tasks')
      .send(newTask)
      .set('Authorization', token);
    expect(res.statusCode).toEqual(422);
  });
});

describe('Update Task Test', () => {
  it('should update task', async () => {
    const updatedField = {
      description: 'updated task',
      priority: 'Lowest',
      typeId: '63fe01c8f5b40ad08cfac583',
    };
    const res = await request(application).put(`/api/v1/tasks/${taskId}`).send(updatedField);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      id: taskId,
      assignId: null,
      attachmentUrls: [],
      title: 'test task',
      description: 'updated task',
      projectId: projectId,
      priority: 'Lowest',
      boardId: boardId,
      comments: [],
      reporterId: {
        avatarIcon: 'https://example.png',
        email: 'test@gmail.com',
        id: '632fc37a89d19ed1f57c7ab1',
        name: 'Joe',
      },
      sprintId: null,
      storyPoint: 0,
      tags: [],
      status: {
        id: '6350d443bddbe8fed0138ff4',
        name: 'to do',
        order: 0,
        slug: 'to-do',
      },
      dueAt: '2022-10-20T06:06:45.946Z',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('should return 404 not found', async () => {
    const wrongId = '62e4bc9692266e6c8fcd0bb1';
    const newTask = { title: 'updated task' };
    const res = await request(application)
      .put(`/api/v1/tasks/${wrongId}`)
      .send({ ...newTask });
    expect(res.statusCode).toEqual(404);
  });

  it('should return 422 if title is an empty string', async () => {
    const newTask = { title: '', description: 'hello' };
    const res = await request(application)
      .put(`/api/v1/tasks/${taskId}`)
      .send({ ...newTask });
    expect(res.statusCode).toEqual(422);
  });
});

describe('Delete task test', () => {
  it('should delete task', async () => {
    const res = await request(application).delete(`/api/v1/tasks/${taskId}`);
    expect(res.statusCode).toEqual(204);
    const checkDeleteTask = await Task.getModel(dbConnection).findById(taskId);
    expect(checkDeleteTask).toBeFalsy();
  });
  it('should return 404 not found', async () => {
    const wrongId = '62e4bc9692266e6c8fcddddd';
    const res = await request(application).delete(`/api/v1/tasks/${wrongId}`);
    expect(res.statusCode).toEqual(404);
  });
});
