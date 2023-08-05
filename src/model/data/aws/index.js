const ddbDocClient = require('./ddbDocClient');
const s3Client = require('./s3Client');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const logger = require('../../../logger');

/**
 * Writes a fragment to DynamoDB. Returns a Promise.
 * @param {*} fragment
 * @returns {Promise<any>}
 */
function writeFragment(fragment) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: fragment,
  };

  // Create a PUT command to send to DynamoDB
  const command = new PutCommand(params);

  try {
    return ddbDocClient.send(command);
  } catch (err) {
    logger.warn({ err, params, fragment }, 'error writing fragment to DynamoDB');
    throw err;
  }
}

/**
 * Reads a fragment from DynamoDB. Returns a Promise<fragment|undefined>
 * @param {string} ownerId
 * @param {string} id
 * @returns {Promise<Fragment|undefined>}
 */
async function readFragment(ownerId, id) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  // Create a GET command to send to DynamoDB
  const command = new GetCommand(params);

  try {
    const data = await ddbDocClient.send(command);
    return data?.Item;
  } catch (err) {
    logger.warn({ err, params }, 'error reading fragment from DynamoDB');
    throw err;
  }
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
 * Get a list of fragments, either ids-only, or full Objects, for the given user.
 * Returns a Promise<Array<Fragment>|Array<string>|undefined>
 * @param {string} ownerId
 * @param {boolean} expand
 * @returns {Promise<Array<Fragment>|Array<string>|undefined>}
 */
async function listFragments(ownerId, expand = false) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  // Limit to only `id` if we aren't supposed to expand.
  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  // Create a QUERY command to send to DynamoDB
  const command = new QueryCommand(params);

  try {
    const data = await ddbDocClient.send(command);

    // If not expanded to include all attributes, remap array
    return !expand ? data?.Items.map((item) => item.id) : data?.Items;
  } catch (err) {
    logger.error({ err, params }, 'error getting all fragments for user from DynamoDB');
    throw err;
  }
}

// Delete a fragment's metadata and data from memory db. Returns a Promise
/**
 *
 * @param {string} ownerId
 * @param {string} id
 */
async function deleteFragment(ownerId, id) {
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const tableParams = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  // Create a DELETE Object command to send to S3
  const s3Command = new DeleteObjectCommand(s3Params);

  // Create a DELETE command to send to DynamoDB
  const tableCommand = new DeleteCommand(tableParams);

  try {
    await s3Client.send(s3Command);
    await ddbDocClient.send(tableCommand);
  } catch (err) {
    const { Bucket, Key } = s3Params;
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
