const MemoryDB = require('./memory-db');

// Two in-memory databases: fragment metadata and raw data
const data = new MemoryDB();
const metadata = new MemoryDB();

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
 * Write a fragment's data buffer to memory db.
 * @param {string} ownerId
 * @param {string} id
 * @param {*} buffer
 * @returns {Promise<void>}
 */
function writeFragmentData(ownerId, id, buffer) {
  return data.put(ownerId, id, buffer);
}

/**
 * Read a fragment's data from memory db.
 * @param {string} ownerId
 * @param {string} id
 * @returns {Promise<any>}
 */
function readFragmentData(ownerId, id) {
  return data.get(ownerId, id);
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
 * @returns {Promise<void>}
 */
function deleteFragment(ownerId, id) {
  return Promise.all([metadata.del(ownerId, id), data.del(ownerId, id)]);
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
