const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

const logger = require('../../logger');

// Get fragment data by ID
module.exports = async (req, res) => {
  try {
    const fragmentId = req.params.id;
    const fragmentMetaData = await Fragment.byId(req.user, fragmentId);
    const fragment = new Fragment({
      ownerId: fragmentMetaData.ownerId,
      id: fragmentMetaData.id,
      type: fragmentMetaData.type,
      size: fragmentMetaData.size,
      created: fragmentMetaData.created,
      updated: fragmentMetaData.updated,
    });
    logger.debug(
      { fragmentData: fragmentMetaData.toString() },
      `GET /v1/fragments/${fragmentId} - Retrieved fragment metadata by ID`
    );
    res.status(200).json(createSuccessResponse({ fragment: fragment }));
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
