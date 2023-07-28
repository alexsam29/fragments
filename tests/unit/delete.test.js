const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments/:id', () => {
  test('authenticated user requests existing text fragment to be deleted', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment')
      .auth('user1@email.com', 'password1');

    const res1 = await request(app)
      .delete(`/v1/fragments/${post.body.fragment.id}`)
      .auth('user1@email.com', 'password1');
    expect(res1.statusCode).toBe(200);

    // Confirm deletion
    const res2 = await request(app)
      .get(`/v1/fragments/${post.body.fragment.id}`)
      .auth('user1@email.com', 'password1');
    expect(res2.statusCode).toBe(404);
  });

  test('authenticated user requests non-existent text fragment to be deleted', async () => {
    const res1 = await request(app)
      .delete(`/v1/fragments/123456789`)
      .auth('user1@email.com', 'password1');
    expect(res1.statusCode).toBe(404);
  });
});
