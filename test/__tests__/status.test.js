const request = require('supertest');
const { setup, restore } = require('../helpers');
const { BOARD_SEED } = require('../fixtures/board');
const { STATUS_TEST } = require('../fixtures/statuses');

let application = null;

beforeAll(async () => {
  const { app } = await setup();
  application = app();
});

afterAll(async () => {
  await restore();
});

describe('Test statuses', () => {
  it('should get all statuses', async () => {
    const res = await request(application).get(`/api/v1/boards/${BOARD_SEED._id}/statuses`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(STATUS_TEST);
  });

  it('should response with 404 if no boardId provided', async () => {
    const res = await request(application).get('/api/v1/boards//statuses');
    expect(res.statusCode).toEqual(404);
  });
});
