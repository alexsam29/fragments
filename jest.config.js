const path = require('path');
const envFile = path.join(__dirname, 'env.jest');

// Read the environment variables from env.jest file
require('dotenv').config({ path: envFile });

console.log(`Using LOG_LEVEL=${process.env.LOG_LEVEL}. Use 'debug' in env.jest for more detail`);

module.exports = {
  verbose: true,
  testTimeout: 5000,
};
