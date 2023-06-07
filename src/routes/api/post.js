const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

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
      baseUrl = `${protocol}//${host}`;
    }

    var fragment = new Fragment({
      ownerId: req.user,
      type: req.headers['content-type'],
      size: 0,
    });

    fragment.save();
    fragment.setData(Buffer.from(req.body));

    // Set the Location header in the response
    res.set('Location', `${baseUrl}/v1/fragments/${fragment.id}`);
    logger.debug({ fragment: fragment }, `POST /v1/fragments/ - Created Fragment`);
    res.status(201).json(createSuccessResponse({ fragment: fragment }));
  } catch (error) {
    res.status(415).json(createErrorResponse(415, error.message));
  }
};
