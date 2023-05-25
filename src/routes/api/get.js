const { createSuccessResponse } = require('../../response');
// Get list of fragments for the current user
module.exports = (req, res) => {
  res.status(200).json(createSuccessResponse({ fragments: [] }));
};
