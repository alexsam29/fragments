const express = require('express');
const { version, author } = require('../../package.json');
const { createSuccessResponse } = require('../response');
const router = express.Router();

// Authentication middleware
const { authenticate } = require('../authorization/index');

// Expose all API routes on /v1/* to include an API version. Must be authenticated
router.use(`/v1`, authenticate(), require('./api'));

// Health check route
router.get('/', (req, res) => {
  // Clients shouldn't cache this response
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/alexsam29/fragments',
      version,
    })
  );
});

module.exports = router;
