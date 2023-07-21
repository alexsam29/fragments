const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

const logger = require('../../logger');
const SupportedTypes = require('../../supportedTypes');

// Create a fragment
module.exports = async (req, res) => {
  try {
    let baseUrl;
    if (process.env.API_URL) {
      baseUrl = process.env.API_URL;
    } else {
      const host = req.headers.host;
      const protocol = req.protocol;
      baseUrl = `${protocol}://${host}`;
    }

    const contentType = req.headers['content-type'];
    if (!isValidContentType(contentType)) {
      logger.error({ contentType }, `Unsupported media type in /POST request`);
      res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
      return;
    }

    const fragment = new Fragment({
      ownerId: req.user,
      type: contentType,
      size: 0,
    });

    await fragment.save();
    await fragment.setData(req.body);

    res.set('Location', `${baseUrl}/v1/fragments/${fragment.id}`);
    logger.debug({ fragment: fragment }, `POST /v1/fragments/ - Created Fragment`);
    res.status(201).json(createSuccessResponse({ fragment: fragment }));
  } catch (error) {
    logger.error({ error }, `Unhandled server error in /POST request`);
    res.status(500).json(createErrorResponse(500, error.message));
  }
};

// Check if the content type is valid
function isValidContentType(contentType) {
  return Object.values(SupportedTypes).includes(contentType);
}
