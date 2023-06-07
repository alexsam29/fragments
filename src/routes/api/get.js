const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

// Get list of fragments for the current user
module.exports = async (req, res) => {
  try {
    const fragmentList = await Fragment.byUser(req.user);
    logger.debug({ fragmentList }, 'GET /v1/fragments - Retrieved user fragments');
    res.status(200).json(createSuccessResponse({ fragments: fragmentList }));
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
