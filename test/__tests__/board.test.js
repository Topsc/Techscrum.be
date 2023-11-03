const request = require('supertest');
const { BOARD_TEST, BOARD_BY_LABELS } = require('../fixtures/board');
const { setup, restore } = require('../helpers');

let application = null;

beforeAll(async () => {
  const { app } = await setup();
  application = app();
});

afterAll(async () => {
  await restore();
});

describe('Show one board', () => {
  it('should show on board if all info is provided', async () => {
    const res = await request(application).get(`/api/v1/board/${BOARD_TEST.id}/all/all/all/all`);
    expect(res.statusCode).toBe(200);
  });

  it('should should return 500 if invalid boardId provided', async () => {
    const wrongId = '123';
    const { statusCode } = await request(application).get(
      `/api/v1/board/${wrongId}/all/all/all/all`,
    );
    expect(statusCode).toBe(500);
  });

  it('should be able to return tasks by labels on board page', async () => {
    const { statusCode } = await request(application).get(
      `/api/v1/board/${BOARD_BY_LABELS.id}/all/all/all/6340129a5eb06d386302b22b-6381d2cfa6c3f10a7e8ae07e-63821552a6c3f10a7e8b029e`,
    );
    expect(statusCode).toBe(200);
  });
});
