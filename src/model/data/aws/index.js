const MemoryDB = require('../memory/memory-db');
const metadata = new MemoryDB();
const s3Client = require('./s3Client');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

/**
 * Write a fragment's metadata to memory db.
 * @param {*} fragment
 * @returns {Promise<void>}
 */
function writeFragment(fragment) {
  return metadata.put(fragment.ownerId, fragment.id, fragment);
}

/**
 * Read a fragment's metadata from memory db.
 * @param {string} ownerId
 * @param {string} id
 * @returns {Promise<any>}
 */
function readFragment(ownerId, id) {
  return metadata.get(ownerId, id);
}

/**
 * Writes a fragment's data to an S3 Object in a Bucket
 * @param {string} ownerId
 * @param {string} id
 * @param {*} data
 */
async function writeFragmentData(ownerId, id, data) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  // Create a PUT Object command to send to S3
  const command = new PutObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

// Convert a stream of data into a Buffer, by collecting
// chunks of data until finished, then assembling them together.
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];

    // Streams have events that can be listened for and run
    // code.  Need to know when new `data` is available,
    // if there's an `error`, and when it's at the `end`
    // of the stream.

    // When there's data, add the chunk to chunks list
    stream.on('data', (chunk) => chunks.push(chunk));
    // When there's an error, reject the Promise
    stream.on('error', reject);
    // When the stream is done, resolve with a new Buffer of chunks
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

/**
 * Reads a fragment's data from S3 and returns (Promise<Buffer>)
 * @param {string} ownerId
 * @param {string} id
 * @returns {Promise<Buffer>}
 */
async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  // Create a GET Object command to send to S3
  const command = new GetObjectCommand(params);

  try {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(command);
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

/**
 * Get a list of fragment ids/objects for the given user from memory db.
 * @param {string} ownerId
 * @param {boolean} expand
 * @returns {Promise<any[]>}
 */
async function listFragments(ownerId, expand = false) {
  const fragments = await metadata.query(ownerId);

  if (expand || !fragments) {
    return fragments;
  }

  return fragments.map((fragment) => fragment.id);
}

// Delete a fragment's metadata and data from memory db. Returns a Promise
/**
 *
 * @param {string} ownerId
 * @param {string} id
 */
async function deleteFragment(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  // Create a GET Object command to send to S3
  const command = new DeleteObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error deleting fragment data from S3');
    throw new Error('unable to delete fragment data');
  }
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
