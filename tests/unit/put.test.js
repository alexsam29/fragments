const request = require('supertest');
const app = require('../../src/app');
const SupportedTypes = require('../../src/supportedTypes');

describe('PUT /v1/fragments/:id', () => {
  test('authenticated user updates a fragment and gets a JSON object response', async () => {
    var oldText = 'this is the old text';
    var newText = 'this is the updated text';
    // Create Fragment
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', SupportedTypes.TEXT_PLAIN)
      .send(oldText)
      .auth('user1@email.com', 'password1');

    // Update Fragment
    const res = await request(app)
      .put(`/v1/fragments/${post.body.fragment.id}`)
      .set('Content-Type', post.body.fragment.type)
      .send(newText)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.size).toBe(newText.length);
    expect(res.body.fragment.type).toBe(post.body.fragment.type);

    const data = await request(app)
      .get(`/v1/fragments/${post.body.fragment.id}`)
      .auth('user1@email.com', 'password1');
    expect(data.statusCode).toBe(200);
    expect(data.text).toBe(newText);
  });
});
