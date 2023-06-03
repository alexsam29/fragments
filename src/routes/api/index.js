const express = require('express');
const router = express.Router();
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

// GET /v1/fragments route
router.get('/fragments', require('./get'));

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      const { type } = contentType.parse(req) || {};
      return Fragment.isSupportedType(type);
    },
  });

router.post('/fragments', rawBody(), require('./post'));

module.exports = router;
