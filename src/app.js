// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// version and author from package.json
const { version, author } = require('../package.json');

const logger = require('./logger');
const pino = require('pino-http')({
  // Use default logger instance
  logger,
});

// Create an express app instance to use to attach middleware and HTTP routes
const app = express();

// Use logging middleware
app.use(pino);

// Use security middleware
app.use(helmet());

// Use CORS middleware to make requests across origins
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

// Health check route. If the server is running
// respond with '200 OK'.  If not, the server isn't healthy.
app.get('/', (req, res) => {
  // Clients shouldn't cache this response (always request it fresh)
  // See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#controlling_caching
  res.setHeader('Cache-Control', 'no-cache');

  // Send a 200 'OK' response with info about the repo
  res.status(200).json({
    status: 'ok',
    author,
    githubUrl: 'https://github.com/alexsam29/fragments',
    version,
  });
});

// 404 middleware to handle any requests for resources that can't be found
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    },
  });
});

// Error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Use custom error response if it exists, if not, use a generic
  // 500 server error and message.
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  // If this is a server error, log something to see what's going on.
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  res.status(status).json({
    status: 'error',
    error: {
      message,
      code: status,
    },
  });
});

// Export `app` to access it in server.js
module.exports = app;
