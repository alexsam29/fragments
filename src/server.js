const stoppable = require('stoppable');
const logger = require('./logger');
const app = require('./app');

// Get desired port. Default to `8080`
const port = parseInt(process.env.PORT || 8080, 10);

// Start server on specified port
const server = stoppable(
  app.listen(port, () => {
    logger.info({ port }, `Server started`);
  })
);

module.exports = server;
