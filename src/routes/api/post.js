const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const { randomUUID } = require('crypto');

const logger = require('../../logger');

module.exports = (req, res) => {
  try {
    // Determine the base URL for setting the Location header
    let baseUrl;
    if (process.env.API_URL) {
      baseUrl = process.env.API_URL;
    } else {
      const host = req.headers.host;
      const protocol = req.protocol;
      baseUrl = new URL(host, protocol);
    }

    var fragment = new Fragment({
      ownerId: randomUUID(),
      type: req.headers['content-type'],
      size: 0,
    });

    fragment.setData(req.body);

    // Set the Location header in the response
    res.set('Location', `${baseUrl}/v1/fragments/${fragment.id}`);

    res.status(201).json(createSuccessResponse({ fragment: fragment }));
  } catch (error) {
    logger.warn(error, error.message);
    res.status(415).json(createErrorResponse(415, error.message));
  }
};
