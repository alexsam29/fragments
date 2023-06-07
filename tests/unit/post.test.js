const request = require('supertest');
const app = require('../../src/app');

function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date);
}

function isRandomUUID(id) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  return uuidPattern.test(id);
}

describe('POST /v1/fragments', () => {
  let textFragment = 'This is a text fragment';

  test('unauthenticated requests are denied', () =>
    request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(textFragment)
      .expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(textFragment)
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('authenticated users save a fragment and get a fragment JSON object response', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(textFragment)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.size).toBe(textFragment.length);
    expect(res.body.type).toBe('text/plain');
    expect(isValidDate(res.body.created)).toBe(true);
    expect(isValidDate(res.body.updated)).toBe(true);
    expect(Date.parse(res.body.updated)).toBeGreaterThanOrEqual(Date.parse(res.body.created));
    expect(isRandomUUID(res.body.id)).toBe(true);
    expect(res.body.ownerId).toBe(
      '11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a'
    );
    expect(res.headers['location']).toBe(`${process.env.API_URL}/v1/fragments/${res.body.id}`);
  });

  test('authenticated users save an unsupported type and get an error response', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/javascript')
      .send(textFragment)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });
});
