const request = require('supertest');
const { invalidForm, validForm } = require('../fixtures/contact');
const app = require('../../src/loaders/express');

describe('Post /emailus', () => {
  it('should return a 400 status code for invalid req.body', async () => {
    const res = await request(app()).post('/api/v1/emailus').send(invalidForm);
    expect(res.statusCode).toBe(400);
  });
  it('should return a 202 status code for valid req.body', async () => {
    const res = await request(app()).post('/api/v1/emailus').send(validForm);
    expect(res.statusCode).toBe(202);
  });
});
