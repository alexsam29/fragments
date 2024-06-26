const request = require('supertest');
const app = require('../../src/app');
const hash = require('../../src/hash');
const path = require('path');

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

  test('authenticated users save a text fragment and get a JSON object response', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(textFragment)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.size).toBe(textFragment.length);
    expect(res.body.fragment.type).toBe('text/plain');
    expect(isValidDate(res.body.fragment.created)).toBe(true);
    expect(isValidDate(res.body.fragment.updated)).toBe(true);
    expect(Date.parse(res.body.fragment.updated)).toBeGreaterThanOrEqual(
      Date.parse(res.body.fragment.created)
    );
    expect(isRandomUUID(res.body.fragment.id)).toBe(true);
    expect(res.body.fragment.ownerId).toBe(hash('user1@email.com'));
    expect(res.headers['location']).toBe(
      `${process.env.API_URL}/v1/fragments/${res.body.fragment.id}`
    );
  });

  test('authenticated users save a JSON fragment and get a JSON object response', async () => {
    let JSONfragment = '{"test": 123, "data": "this is a test JSON fragment"}';
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'application/json')
      .send(JSONfragment)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.size).toBe(JSONfragment.length);
    expect(res.body.fragment.type).toBe('application/json');
    expect(isValidDate(res.body.fragment.created)).toBe(true);
    expect(isValidDate(res.body.fragment.updated)).toBe(true);
    expect(Date.parse(res.body.fragment.updated)).toBeGreaterThanOrEqual(
      Date.parse(res.body.fragment.created)
    );
    expect(isRandomUUID(res.body.fragment.id)).toBe(true);
    expect(res.body.fragment.ownerId).toBe(hash('user1@email.com'));
    expect(res.headers['location']).toBe(
      `${process.env.API_URL}/v1/fragments/${res.body.fragment.id}`
    );
  });

  test('authenticated users save an unsupported type and get an error response', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'audio/mp3')
      .send(textFragment)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });

  test('authenticated users save an image fragment and get a JSON object response', async () => {
    const fs = require('fs');
    const imagePath = path.join(__dirname, '../images/earth.jpg');
    const imageBuffer = fs.readFileSync(imagePath);

    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'image/jpeg')
      .send(imageBuffer)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.size).toBe(imageBuffer.length);
    expect(res.body.fragment.type).toBe('image/jpeg');
    expect(isValidDate(res.body.fragment.created)).toBe(true);
    expect(isValidDate(res.body.fragment.updated)).toBe(true);
    expect(Date.parse(res.body.fragment.updated)).toBeGreaterThanOrEqual(
      Date.parse(res.body.fragment.created)
    );
    expect(isRandomUUID(res.body.fragment.id)).toBe(true);
    expect(res.body.fragment.ownerId).toBe(hash('user1@email.com'));
    expect(res.headers['location']).toBe(
      `${process.env.API_URL}/v1/fragments/${res.body.fragment.id}`
    );
  });

  test('authenticated users save an PNG image fragment and get a JSON object response', async () => {
    const fs = require('fs');
    const imagePath = path.join(__dirname, '../images/space.png');
    const imageBuffer = fs.readFileSync(imagePath);

    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'image/png')
      .send(imageBuffer)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.size).toBe(imageBuffer.length);
    expect(res.body.fragment.type).toBe('image/png');
    expect(isValidDate(res.body.fragment.created)).toBe(true);
    expect(isValidDate(res.body.fragment.updated)).toBe(true);
    expect(Date.parse(res.body.fragment.updated)).toBeGreaterThanOrEqual(
      Date.parse(res.body.fragment.created)
    );
    expect(isRandomUUID(res.body.fragment.id)).toBe(true);
    expect(res.body.fragment.ownerId).toBe(hash('user1@email.com'));
    expect(res.headers['location']).toBe(
      `${process.env.API_URL}/v1/fragments/${res.body.fragment.id}`
    );
  });
});
