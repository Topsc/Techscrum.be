const request = require('supertest');
const app = require('../../src/loaders/express');
const fixture = require('../fixtures/types');

describe('Types Test', () => {
  it('should get types', async () => {
    const res = await request(app()).get('/api/v1/types');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(fixture.getUsers());
  });
});
