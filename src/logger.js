const options = { level: process.env.LOG_LEVEL || 'info' };

// If `debug` logging, make logs easy to read
if (options.level === 'debug') {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  };
}

module.exports = require('pino')(options);
