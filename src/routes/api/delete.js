const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

const logger = require('../../logger');

// Get fragment data by ID
module.exports = async (req, res) => {
  try {
    const fragmentId = req.params.id;
    const newFragment = await Fragment.byId(req.user, fragmentId);
    var fragmentData = await newFragment.getData();
    logger.debug(
      { fragmentData: fragmentData.toString() },
      `DELETE /v1/fragments/${fragmentId} - Retrieved fragment by ID`
    );

    Fragment.delete(req.user, fragmentId);
    logger.debug(`DELETE /v1/fragments/${fragmentId} - Fragment deleted`);

    res.send(createSuccessResponse());
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
