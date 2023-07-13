const request = require('supertest');
const app = require('../../src/app');
const MarkdownIt = require('markdown-it');

const isFragmentObject = (obj) =>
  typeof obj.ownerId === 'string' &&
  typeof obj.type === 'string' &&
  typeof obj.size === 'number' &&
  typeof obj.id === 'string' &&
  !isNaN(Date.parse(obj.created)) &&
  !isNaN(Date.parse(obj.updated));

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

  test('authenticated user request data for an existing text fragment by id', async () => {
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

  test('authenticated user request data for an existing JSON fragment by id', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'application/json')
      .send('{"test": 123, "data": "this is a test JSON fragment"}')
      .auth('user1@email.com', 'password1');
    const res = await request(app)
      .get(`/v1/fragments/${post.body.fragment.id}`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.text)).toMatchObject({
      test: 123,
      data: 'this is a test JSON fragment',
    });
  });

  test('authenticated user requests conversion of markdown fragment to HTML', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/markdown')
      .send('# This is a text markdown fragment')
      .auth('user1@email.com', 'password1');
    const res = await request(app)
      .get(`/v1/fragments/${post.body.fragment.id}.html`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    var md = new MarkdownIt();
    expect(res.text).toBe(md.render('# This is a text markdown fragment'));
  });
});

describe('GET /v1/fragments?expand=1', () => {
  test('authenticated users get an expanded fragments array', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toEqual(true);
    expect(res.body.fragments.every(isFragmentObject)).toBe(true);
  });
});

describe('GET /v1/fragments/:id/info', () => {
  test('authenticated users get metadata for specific fragment id', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment')
      .auth('user1@email.com', 'password1');
    const res = await request(app)
      .get(`/v1/fragments/${post.body.fragment.id}/info`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(isFragmentObject(res.body.fragment)).toEqual(true);
  });
});
