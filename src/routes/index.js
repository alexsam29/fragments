const express = require('express');
const { version, author } = require('../../package.json');
const { createSuccessResponse } = require('../response');
const router = express.Router();
const { authenticate } = require('../authorization/index');
const { hostname } = require('os');

// Expose all API routes on /v1/*. Must be authenticated
router.use(`/v1`, authenticate(), require('./api'));

// Health check route
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/alexsam29/fragments',
      version,
      hostname: hostname(),
    })
  );
});

module.exports = router;
