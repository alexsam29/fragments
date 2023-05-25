const request = require('supertest');
const app = require('../../src/app');

describe('Resource Not Found', () => {
  test('404 Error Response', () => request(app).get('/nonExistentRoute').expect(404));
});
