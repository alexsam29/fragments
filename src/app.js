const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const logger = require('./logger');
const pino = require('pino-http')({
  logger,
});

// Express app instance to attach middleware and HTTP routes
const app = express();

// Use logging middleware
app.use(pino);

// Use security middleware
app.use(helmet());

// Use CORS middleware to make requests across origins
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

// Define routes
app.use('/', require('./routes'));

// 404 middleware for resources that can't be found
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
  // Custom error response or generic 500 server response
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  // If server error, log the error
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

// Export to access in server.js
module.exports = app;
