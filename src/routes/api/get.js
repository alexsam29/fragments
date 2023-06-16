const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

// Get list of fragments for the current user
module.exports = async (req, res) => {
  try {
    const fragmentList = await Fragment.byUser(req.user);

    if (req.query.expand === '1') {
      const fragmentMetaDataList = await Promise.all(
        fragmentList.map((fragmentId) => Fragment.byId(req.user, fragmentId))
      );
      logger.debug(
        { fragmentMetaDataList },
        'GET /v1/fragments?expand=1 - Retrieved user fragments metadata'
      );
      res.status(200).json(createSuccessResponse({ fragments: fragmentMetaDataList }));
    } else {
      logger.debug({ fragmentList }, 'GET /v1/fragments - Retrieved user fragments');
      res.status(200).json(createSuccessResponse({ fragments: fragmentList }));
    }
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
