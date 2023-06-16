const express = require('express');
const router = express.Router();
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

router.get('/fragments', require('./get'));
router.get('/fragments/:id', require('./getById'));
router.get('/fragments/:id/info', require('./get-info'));

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
