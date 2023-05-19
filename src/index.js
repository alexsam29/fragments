// Read environment variables from .env file
require('dotenv').config();

const logger = require('./logger');

// Log uncaught exception
process.on('uncaughtException', (err, origin) => {
  logger.fatal({ err, origin }, 'uncaughtException');
  throw err;
});

// Log unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'unhandledRejection');
  throw reason;
});

// Start server
require('./server');
