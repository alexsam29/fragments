// src/server.js

// Shutdown server
const stoppable = require('stoppable');

// Get logger instance
const logger = require('./logger');

// Get express app instance
const app = require('./app');

// Get desired port from the process environment. Default to `8080`
const port = parseInt(process.env.PORT || 8080, 10);

// Start server listening on this port
const server = stoppable(
  app.listen(port, () => {
    // Log message that the server has started, and which port it's using.
    logger.info({ port }, `Server started`);
  })
);

// Export server instance to access it elsewhere, if necessary.
module.exports = server;
