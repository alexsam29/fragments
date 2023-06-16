const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

const logger = require('../../logger');

// Get fragment data by ID
module.exports = async (req, res) => {
  try {
    const fragmentId = req.params.id;
    const result = await Fragment.byId(req.user, fragmentId);

    const newFragment = new Fragment({
      ownerId: result.ownerId,
      id: result.id,
      type: result.type,
      size: result.size,
      created: result.created,
      updated: result.updated,
    });

    const fragmentMetaData = await Fragment.byId(req.user, newFragment.id);

    logger.debug(
      { fragmentData: fragmentMetaData.toString() },
      `GET /v1/fragments/${fragmentId} - Retrieved fragment metadata by ID`
    );
    res.status(200).json(createSuccessResponse({ fragment: fragmentMetaData }));
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
