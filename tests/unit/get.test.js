const request = require('supertest');
const app = require('../../src/app');
const MarkdownIt = require('markdown-it');
const path = require('path');
const TurndownService = require('turndown');
const SupportedTypes = require('../../src/supportedTypes');
const fs = require('fs');

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
});

describe('GET /v1/fragments/:id.ext', () => {
  describe('Markdown conversions to plain text and HTML', () => {
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
      expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.TEXT_HTML);
      var md = new MarkdownIt();
      expect(res.text).toBe(md.render('# This is a text markdown fragment'));
    });

    test('authenticated user requests conversion of markdown fragment to plain text', async () => {
      const markdownContent = '# This is a text markdown fragment';
      const post = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/markdown')
        .send(markdownContent)
        .auth('user1@email.com', 'password1');

      const res = await request(app)
        .get(`/v1/fragments/${post.body.fragment.id}.txt`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.TEXT_PLAIN);

      // Convert Markdown to plain text for comparison
      const turndownService = new TurndownService();
      const expectedPlainText = turndownService.turndown(markdownContent);
      expect(res.text).toBe(expectedPlainText);
    });
  });

  describe('Plain text conversions to Markdown and HTML', () => {
    const plainTextContent = 'This is a plain text fragment';
    test('authenticated user requests conversion of plain text fragment to markdown', async () => {
      const post = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send(plainTextContent)
        .auth('user1@email.com', 'password1');

      const res = await request(app)
        .get(`/v1/fragments/${post.body.fragment.id}.md`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.TEXT_MD);
      expect(res.text).toBe('This is a plain text fragment');
    });

    test('authenticated user requests conversion of plain text fragment to HTML', async () => {
      const post = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send(plainTextContent)
        .auth('user1@email.com', 'password1');

      const res = await request(app)
        .get(`/v1/fragments/${post.body.fragment.id}.html`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.TEXT_HTML);

      // Convert plain text to HTML for comparison
      const expectedHtml = `<p>${plainTextContent}</p>`;
      expect(res.text).toBe(expectedHtml);
    });
  });

  describe('HTML conversions to Markdown and plain text', () => {
    const htmlContent = '<p>This is an HTML fragment</p>';

    test('authenticated user requests conversion of HTML fragment to Markdown', async () => {
      const post = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/html')
        .send(htmlContent)
        .auth('user1@email.com', 'password1');

      const res = await request(app)
        .get(`/v1/fragments/${post.body.fragment.id}.md`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.TEXT_MD);

      // Convert HTML to Markdown for comparison
      const turndownService = new TurndownService();
      const expectedMarkdown = turndownService.turndown(htmlContent);
      expect(res.text).toBe(expectedMarkdown);
    });

    test('authenticated user requests conversion of HTML fragment to plain text', async () => {
      const post = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/html')
        .send(htmlContent)
        .auth('user1@email.com', 'password1');

      const res = await request(app)
        .get(`/v1/fragments/${post.body.fragment.id}.txt`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.TEXT_PLAIN);
      expect(res.text).toBe('This is an HTML fragment');
    });
  });

  describe('JSON conversions', () => {
    describe('JSON conversion to plain text', () => {
      test('authenticated user requests conversion of JSON fragment to plain text', async () => {
        const jsonObject = {
          key1: 'value1',
          key2: 'value2',
          key3: {
            nestedKey1: 'nestedValue1',
            nestedKey2: 'nestedValue2',
          },
        };
        const post = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', 'application/json')
          .send(jsonObject)
          .auth('user1@email.com', 'password1');

        const res = await request(app)
          .get(`/v1/fragments/${post.body.fragment.id}.txt`)
          .auth('user1@email.com', 'password1');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.TEXT_PLAIN);

        // Convert JSON to plain text for comparison
        const expectedPlainText = JSON.stringify(jsonObject, null, 2);
        expect(res.text).toBe(expectedPlainText);
      });
    });
  });

  /* describe('Image conversions', () => {
    describe('JPEG conversions to PNG, WEBP, and GIF', () => {
      test('authenticated user requests conversion of JPEG fragment to PNG', async () => {
        const imagePath = path.join(__dirname, '../images/earth.jpg');
        const imageBuffer = fs.readFileSync(imagePath);
        const post = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', 'image/jpeg')
          .send(imageBuffer)
          .auth('user1@email.com', 'password1');

        const res = await request(app)
          .get(`/v1/fragments/${post.body.fragment.id}.png`)
          .auth('user1@email.com', 'password1');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.IMAGE_PNG);
      });

      test('authenticated user requests conversion of JPEG fragment to GIF', async () => {
        const imagePath = path.join(__dirname, '../images/earth.jpg');
        const imageBuffer = fs.readFileSync(imagePath);
        const post = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', 'image/jpeg')
          .send(imageBuffer)
          .auth('user1@email.com', 'password1');

        const res = await request(app)
          .get(`/v1/fragments/${post.body.fragment.id}.gif`)
          .auth('user1@email.com', 'password1');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.IMAGE_GIF);
      });

      test('authenticated user requests conversion of JPEG fragment to WEBP', async () => {
        const imagePath = path.join(__dirname, '../images/earth.jpg');
        const imageBuffer = fs.readFileSync(imagePath);
        const post = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', 'image/jpeg')
          .send(imageBuffer)
          .auth('user1@email.com', 'password1');

        const res = await request(app)
          .get(`/v1/fragments/${post.body.fragment.id}.webp`)
          .auth('user1@email.com', 'password1');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.IMAGE_WEBP);
      });
    });

    describe('PNG conversions to JPEG, GIF, and WEBP', () => {
      test('authenticated user requests conversion of PNG fragment to JPEG', async () => {
        const imagePath = path.join(__dirname, '../images/space.png');
        const imageBuffer = fs.readFileSync(imagePath);
        const post = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', 'image/png')
          .send(imageBuffer)
          .auth('user1@email.com', 'password1');

        const res = await request(app)
          .get(`/v1/fragments/${post.body.fragment.id}.jpg`)
          .auth('user1@email.com', 'password1');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.IMAGE_JPEG);
      });

      test('authenticated user requests conversion of PNG fragment to GIF', async () => {
        const imagePath = path.join(__dirname, '../images/space.png');
        const imageBuffer = fs.readFileSync(imagePath);
        const post = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', 'image/png')
          .send(imageBuffer)
          .auth('user1@email.com', 'password1');

        const res = await request(app)
          .get(`/v1/fragments/${post.body.fragment.id}.gif`)
          .auth('user1@email.com', 'password1');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.IMAGE_GIF);
      });

      test('authenticated user requests conversion of PNG fragment to WEBP', async () => {
        const imagePath = path.join(__dirname, '../images/space.png');
        const imageBuffer = fs.readFileSync(imagePath);
        const post = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', 'image/png')
          .send(imageBuffer)
          .auth('user1@email.com', 'password1');

        const res = await request(app)
          .get(`/v1/fragments/${post.body.fragment.id}.webp`)
          .auth('user1@email.com', 'password1');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.IMAGE_WEBP);
      });
    });

    describe('GIF conversions to JPEG, PNG, and WEBP', () => {
      test('authenticated user requests conversion of GIF fragment to JPEG', async () => {
        const imagePath = path.join(__dirname, '../images/sun.gif');
        const imageBuffer = fs.readFileSync(imagePath);
        const post = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', 'image/gif')
          .send(imageBuffer)
          .auth('user1@email.com', 'password1');

        const res = await request(app)
          .get(`/v1/fragments/${post.body.fragment.id}.jpg`)
          .auth('user1@email.com', 'password1');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.IMAGE_JPEG);
      });

      test('authenticated user requests conversion of GIF fragment to PNG', async () => {
        const imagePath = path.join(__dirname, '../images/sun.gif');
        const imageBuffer = fs.readFileSync(imagePath);
        const post = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', 'image/gif')
          .send(imageBuffer)
          .auth('user1@email.com', 'password1');

        const res = await request(app)
          .get(`/v1/fragments/${post.body.fragment.id}.png`)
          .auth('user1@email.com', 'password1');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.IMAGE_PNG);
      });

      test('authenticated user requests conversion of GIF fragment to WEBP', async () => {
        const imagePath = path.join(__dirname, '../images/sun.gif');
        const imageBuffer = fs.readFileSync(imagePath);
        const post = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', 'image/gif')
          .send(imageBuffer)
          .auth('user1@email.com', 'password1');

        const res = await request(app)
          .get(`/v1/fragments/${post.body.fragment.id}.webp`)
          .auth('user1@email.com', 'password1');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.IMAGE_WEBP);
      });
    });

    describe('WEBP conversions to JPEG, PNG, and GIF', () => {
      test('authenticated user requests conversion of WEBP fragment to JPEG', async () => {
        const imagePath = path.join(__dirname, '../images/earth.webp');
        const imageBuffer = fs.readFileSync(imagePath);
        const post = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', 'image/webp')
          .send(imageBuffer)
          .auth('user1@email.com', 'password1');

        const res = await request(app)
          .get(`/v1/fragments/${post.body.fragment.id}.jpg`)
          .auth('user1@email.com', 'password1');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.IMAGE_JPEG);
      });

      test('authenticated user requests conversion of WEBP fragment to PNG', async () => {
        const imagePath = path.join(__dirname, '../images/earth.webp');
        const imageBuffer = fs.readFileSync(imagePath);
        const post = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', 'image/webp')
          .send(imageBuffer)
          .auth('user1@email.com', 'password1');

        const res = await request(app)
          .get(`/v1/fragments/${post.body.fragment.id}.png`)
          .auth('user1@email.com', 'password1');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.IMAGE_PNG);
      });

      test('authenticated user requests conversion of WEBP fragment to GIF', async () => {
        const imagePath = path.join(__dirname, '../images/earth.webp');
        const imageBuffer = fs.readFileSync(imagePath);
        const post = await request(app)
          .post('/v1/fragments')
          .set('Content-Type', 'image/webp')
          .send(imageBuffer)
          .auth('user1@email.com', 'password1');

        const res = await request(app)
          .get(`/v1/fragments/${post.body.fragment.id}.gif`)
          .auth('user1@email.com', 'password1');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type'].split(';')[0]).toBe(SupportedTypes.IMAGE_GIF);
      });
    });
  }); */
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

test('authenticated user request data for an existing image fragment by id', async () => {
  const imagePath = path.join(__dirname, '../images/earth.jpg');

  const imageBuffer = fs.readFileSync(imagePath);
  const post = await request(app)
    .post('/v1/fragments')
    .set('Content-Type', 'image/jpeg')
    .send(imageBuffer)
    .auth('user1@email.com', 'password1');

  const res = await request(app)
    .get(`/v1/fragments/${post.body.fragment.id}`)
    .auth('user1@email.com', 'password1');

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toMatch(/^image/);
});
