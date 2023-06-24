const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

const logger = require('../../logger');

// Get fragment data by ID
module.exports = async (req, res) => {
  try {
    const fragmentId = req.params.id;
    const newFragment = await Fragment.byId(req.user, fragmentId);
    const fragmentData = await newFragment.getData();
    logger.debug(
      { fragmentData: fragmentData.toString() },
      `GET /v1/fragments/${fragmentId} - Retrieved fragment by ID`
    );
    res.set('Content-Type', newFragment.type);
    res.send(fragmentData);
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
