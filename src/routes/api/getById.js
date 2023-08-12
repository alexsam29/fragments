const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const MarkdownIt = require('markdown-it');
const sharp = require('sharp');
const SupportedTypes = require('../../supportedTypes');
const TurndownService = require('turndown');

const logger = require('../../logger');

// Get fragment data by ID
module.exports = async (req, res) => {
  try {
    const fragmentId = req.params.id.split('.')[0];
    const metadata = await Fragment.byId(req.user, fragmentId);
    if (!metadata) {
      throw new Error('No fragment found');
    }
    let fragment = new Fragment({
      id: metadata.id,
      ownerId: metadata.ownerId,
      created: metadata.created,
      updated: metadata.updated,
      type: metadata.type,
      size: metadata.size,
    });
    var fragmentData = await fragment.getData();
    logger.debug(
      { fragmentData: fragmentData.toString() },
      `GET /v1/fragments/${fragmentId} - Retrieved fragment by ID`
    );

    var extension = req.params.id.split('.');

    // Handle text-based conversions
    if (extension.length > 1 && fragment.type.startsWith('text/')) {
      extension = extension.pop();
      switch (extension) {
        // Convert any supported text fragment to html
        case 'html':
          // Convert Markdown to HTML
          if (fragment.type === SupportedTypes.TEXT_MD) {
            fragment.type = SupportedTypes.TEXT_HTML;
            var md = new MarkdownIt();
            fragmentData = Buffer.from(md.render(fragmentData.toString()));
          }

          // Convert plain text and text/plain; charset=utf-8 to HTML
          if (
            fragment.type === SupportedTypes.TEXT_PLAIN ||
            fragment.type === SupportedTypes.TEXT_PLAIN_UTF
          ) {
            fragment.type = SupportedTypes.TEXT_HTML;
            fragmentData = Buffer.from(`<p>${fragmentData.toString()}</p>`);
          }
          break;

        // Convert any supported text fragment to Markdown
        case 'md':
          // Convert HTML to Markdown
          if (fragment.type === SupportedTypes.TEXT_HTML) {
            const turndownService = new TurndownService();
            fragment.type = SupportedTypes.TEXT_MD;
            fragmentData = Buffer.from(turndownService.turndown(fragmentData.toString()));
          }

          // Convert plain text to Markdown
          if (
            fragment.type === SupportedTypes.TEXT_PLAIN ||
            fragment.type === SupportedTypes.TEXT_PLAIN_UTF
          ) {
            fragment.type = SupportedTypes.TEXT_MD;
            fragmentData = Buffer.from(`${fragmentData.toString()}`);
          }
          break;

        // Convert any support text fragment to plain text
        case 'txt':
          // Convert HTML to plain text using turndown
          if (fragment.type === SupportedTypes.TEXT_HTML) {
            const turndownService = new TurndownService();
            fragmentData = Buffer.from(turndownService.turndown(fragmentData.toString()));
            fragment.type = SupportedTypes.TEXT_PLAIN;
          }

          // Convert Markdown to plain text using turndown
          if (fragment.type === SupportedTypes.TEXT_MD) {
            const turndownService = new TurndownService();
            fragmentData = Buffer.from(turndownService.turndown(fragmentData.toString()));
            fragment.type = SupportedTypes.TEXT_PLAIN;
          }

          break;
        default:
          // Handle unsupported extensions
          res.status(400).json(createErrorResponse(415, 'Unsupported extension'));
          return;
      }
    }

    // Handle image conversions
    if (extension.length > 1 && fragment.type.startsWith('image/')) {
      extension = extension.pop();
      switch (extension) {
        case 'jpg':
          // Convert image to JPEG format
          if (fragment.type !== SupportedTypes.IMAGE_JPEG) {
            fragment.type = SupportedTypes.IMAGE_JPEG;
            fragmentData = await sharp(fragmentData).jpeg().toBuffer();
          }
          break;
        case 'png':
          // Convert image to PNG format
          if (fragment.type !== SupportedTypes.IMAGE_PNG) {
            fragment.type = SupportedTypes.IMAGE_PNG;
            fragmentData = await sharp(fragmentData).png().toBuffer();
          }
          break;
        case 'gif':
          // Convert image to GIF format
          if (fragment.type !== SupportedTypes.IMAGE_GIF) {
            fragment.type = SupportedTypes.IMAGE_GIF;
            fragmentData = await sharp(fragmentData).gif().toBuffer();
          }
          break;
        case 'webp':
          // Convert image to WebP format
          if (fragment.type !== SupportedTypes.IMAGE_WEBP) {
            fragment.type = SupportedTypes.IMAGE_WEBP;
            fragmentData = await sharp(fragmentData).webp().toBuffer();
          }
          break;
        default:
          // Handle unsupported extensions
          res.status(400).json(createErrorResponse(415, 'Unsupported extension'));
          return;
      }
    }

    res.set('Content-Type', fragment.type);
    res.send(fragmentData);
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
