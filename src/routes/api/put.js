const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

const logger = require('../../logger');
const SupportedTypes = require('../../supportedTypes');

// Update a fragment
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
      logger.error({ contentType }, `Unsupported media type in /PUT request`);
      res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
      return;
    }

    const fragmentId = req.params.id.split('.')[0];
    const metadata = await Fragment.byId(req.user, fragmentId);

    if (!metadata) {
      throw new Error('No fragment found');
    }

    if (metadata.type !== contentType) {
      res.status(400).json(createErrorResponse(400, 'Content type mismatch'));
      return;
    }

    let fragment = new Fragment({
      id: metadata.id,
      ownerId: metadata.ownerId,
      created: metadata.created,
      updated: new Date(),
      type: metadata.type,
      size: metadata.size,
    });

    await fragment.save();
    await fragment.setData(req.body);

    res.set('Location', `${baseUrl}/v1/fragments/${fragment.id}`);
    logger.debug({ fragment: fragment }, `PUT /v1/fragments/ - Updated Fragment`);
    res.status(200).json(createSuccessResponse({ fragment: fragment }));
  } catch (error) {
    logger.error({ error }, `Unhandled server error in /PUT request`);
    res.status(500).json(createErrorResponse(500, error.message));
  }
};

// Check if the content type is valid
function isValidContentType(contentType) {
  return Object.values(SupportedTypes).includes(contentType);
}
