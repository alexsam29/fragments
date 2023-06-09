const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('authenticated users get a fragments array', async () => {
    const post1 = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment')
      .auth('user1@email.com', 'password1');
    const post2 = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('This is a second fragment')
      .auth('user1@email.com', 'password1');
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments).toEqual([post1.body.fragment.id, post2.body.fragment.id]);
  });
});

describe('GET /v1/fragments/:id', () => {
  test('unauthenticated user requests data for an existing fragment by id', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment')
      .auth('user1@email.com', 'password1');
    await request(app).get(`/v1/fragments/${post.body.fragment.id}`);
    expect(401);
  });

  test('incorrect credentials for fragment data request by id', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment')
      .auth('user1@email.com', 'password1');
    await request(app)
      .get(`/v1/fragments/${post.body.fragment.id}`)
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401);
  });

  test('authenticated user request data for an existing fragment by id', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment')
      .auth('user1@email.com', 'password1');
    const res = await request(app)
      .get(`/v1/fragments/${post.body.fragment.id}`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('This is a fragment');
  });
});
