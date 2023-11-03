const request = require('supertest');
const { SPRINT_SEED } = require('../fixtures/sprint');
const { setup, restore } = require('../helpers');

let application = null;
const baseURL = '/api/v1/sprints';

beforeAll(async () => {
  const { app } = await setup();
  application = app();
});

afterAll(async () => {
  await restore();
});

const sprintInfo = {
  name: 'joe sprint',
  boardId: '6350d443bddbe8fed0138ffd',
  projectId: '6350d443bddbe8fed0138ffe',
};

describe('POST sprint', () => {
  it('should create a sprint if the least info is provided', async () => {
    const res = await request(application).post(baseURL).send(sprintInfo);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      __v: 0,
      id: expect.any(String),
      boardId: '6350d443bddbe8fed0138ffd',
      createdAt: expect.any(String),
      endDate: null,
      currentSprint: false,
      isComplete: false,
      name: 'joe sprint',
      projectId: '6350d443bddbe8fed0138ffe',
      startDate: expect.any(String),
      taskId: [],
      updatedAt: expect.any(String),
    });
  });

  it('should create a sprint with extra info', async () => {
    const endDate = new Date(2022, 12, 1);

    const res = await request(application)
      .post(baseURL)
      .send({
        ...sprintInfo,
        endDate: endDate,
        description: 'a new sprint',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      __v: 0,
      id: expect.any(String),
      boardId: '6350d443bddbe8fed0138ffd',
      createdAt: expect.any(String),
      currentSprint: false,
      endDate: endDate.toISOString(),
      isComplete: false,
      name: 'joe sprint',
      description: 'a new sprint',
      projectId: '6350d443bddbe8fed0138ffe',
      startDate: expect.any(String),
      taskId: [],
      updatedAt: expect.any(String),
    });
  });

  it.each`
    field           | value
    ${'name'}       | ${undefined}
    ${'boardId'}    | ${undefined}
    ${'projectId'}  | ${undefined}
    ${'isComplete'} | ${'not a boolean'}
  `('shoudl return 422 if $field is $value is provided', async ({ field, value }) => {
    const res = await request(application)
      .post(baseURL)
      .send({
        ...sprintInfo,
        [field]: value,
      });
    expect(res.statusCode).toBe(422);
  });
});

describe('UPDATE sprint', () => {
  it('should update a sprint if valid info is provided', async () => {
    const res = await request(application)
      .put(`${baseURL}/${SPRINT_SEED._id}`)
      .send({
        ...SPRINT_SEED,
        name: 'updated name',
        description: 'updated description',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      __v: 0,
      _id: '63463fb9788a44fa544b4a9a',
      boardId: {
        _id: '6350d443bddbe8fed0138ffd',
        createdAt: expect.any(String),
        taskStatus: [
          '6350d443bddbe8fed0138ff4',
          '6350d443bddbe8fed0138ff5',
          '6350d443bddbe8fed0138ff6',
          '6350d443bddbe8fed0138ff7',
        ],
        title: 'test board',
        updatedAt: expect.any(String),
      },
      createdAt: expect.any(String),
      description: 'updated description',
      endDate: null,
      isComplete: false,
      name: 'updated name',
      projectId: null,
      startDate: expect.any(String),
      taskId: [],
      updatedAt: expect.any(String),
    });
  });

  it('should return 404 if no resource found', async () => {
    const res = await request(application).put(`${baseURL}/6350d443bddbe8fed0138ff4`).send({
      name: 'updated name',
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({});
  });
});

describe('DELETE sprint', () => {
  it('should delete a sprint with correct id', async () => {
    const res = await request(application).delete(`${baseURL}/${SPRINT_SEED._id}`);
    expect(res.statusCode).toBe(204);
    expect(res.body).toEqual({});
  });

  it('should return 404 with incorrect id', async () => {
    const res = await request(application).delete(`${baseURL}/6350d443b82be8fed0138ff2`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({});
  });
});
