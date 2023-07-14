const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const MarkdownIt = require('markdown-it');

const logger = require('../../logger');

// Get fragment data by ID
module.exports = async (req, res) => {
  try {
    const fragmentId = req.params.id.split('.')[0];
    const newFragment = await Fragment.byId(req.user, fragmentId);
    var fragmentData = await newFragment.getData();
    logger.debug(
      { fragmentData: fragmentData.toString() },
      `GET /v1/fragments/${fragmentId} - Retrieved fragment by ID`
    );

    var extension = req.params.id.split('.');

    if (extension.length > 1 && newFragment.type == 'text/markdown') {
      extension = extension.pop();
      // Set the appropriate content type and response data based on the extension
      switch (extension) {
        case 'html':
          newFragment.type = 'text/html';
          var md = new MarkdownIt();
          fragmentData = Buffer.from(md.render(fragmentData.toString()));
          break;
        default:
          // Handle unsupported extensions
          res.status(400).json(createErrorResponse(415, 'Unsupported extension'));
          return;
      }
    }

    res.set('Content-Type', newFragment.type);
    res.send(fragmentData);
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
