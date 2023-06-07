const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const hashEmail = require('../../hash');

// Get a specific fragment by ID
module.exports = async (req, res) => {
  try {
    const fragmentId = req.params.id;
    const result = await Fragment.byId(hashEmail(req.user), fragmentId);

    const newFragment = new Fragment({
      ownerId: result.ownerId,
      id: result.id,
      type: result.type,
      size: result.size,
      created: result.created,
      updated: result.updated,
    });

    const fragmentData = await newFragment.getData();

    res.set('Content-Type', newFragment.type);
    res.send(fragmentData.toString());
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
