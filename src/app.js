const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const authenticate = require('./authorization/index');
const { createErrorResponse } = require('./response');

const logger = require('./logger');
const pino = require('pino-http')({
  logger,
});

// Attach middleware and HTTP routes
const app = express();

// Logging middleware
app.use(pino);

// Security middleware
app.use(helmet());

// CORS middleware to make requests across origins
app.use(cors());

// gzip/deflate compression middleware
app.use(compression());

// Passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Routes
app.use('/', require('./routes'));

// 404 middleware
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// Error-handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Custom error response or generic 500 server response
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  res.status(status).json(createErrorResponse(status, message));
});

module.exports = app;
