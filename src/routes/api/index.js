// Entry-point for v1 version of fragments API.
const express = require('express');

// Create a router to mount API endpoints
const router = express.Router();

// GET /v1/fragments route
router.get('/fragments', require('./get'));

module.exports = router;
