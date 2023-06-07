const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const hashEmail = require('../../hash');
// Get list of fragments for the current user
module.exports = async (req, res) => {
  const user = req.user;
  const fragmentList = await Fragment.byUser(hashEmail(user));
  res.status(200).json(createSuccessResponse({ fragments: fragmentList }));
};
