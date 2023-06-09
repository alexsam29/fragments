const { randomUUID } = require('crypto');
const contentType = require('content-type');

const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({
    id = randomUUID(),
    ownerId,
    created = new Date(),
    updated = new Date(),
    type,
    size = 0,
  }) {
    if (!ownerId) {
      throw new Error('ownerId is required');
    } else {
      this.ownerId = ownerId;
    }

    if (!type) {
      throw new Error('type is required');
    } else {
      let content = contentType.parse(type);
      if (content.type == 'text/plain') {
        this.type = type;
      } else {
        throw new Error('Unsupported Media Type');
      }
    }

    if (typeof size != 'number') {
      throw new Error('size must be a number');
    } else {
      if (size >= 0) {
        this.size = size;
      } else {
        throw new Error('size cannot be negative');
      }
    }

    this.id = id;
    this.created = created;
    this.updated = updated;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns {Promise<Array<Fragment>>}
   */
  static async byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns {Promise<Fragment>}
   */
  static async byId(ownerId, id) {
    if (!(await readFragment(ownerId, id))) {
      throw new Error('Fragment cannot be found');
    }
    return readFragment(ownerId, id);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns {Promise<void>}
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns {Promise<void>}
   */
  save() {
    this.updated = null;
    this.updated = new Date();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns {Promise<void>}
   */
  async setData(data) {
    this.updated = null;
    this.updated = new Date();
    this.size = data.length;
    if (data) {
      return writeFragmentData(this.ownerId, this.id, data);
    } else {
      throw new Error('setData must receive a Buffer');
    }
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.includes('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    return [this.mimeType];
  }

  /**
   * Returns true if content type is supported
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    if (contentType.parse(value).type == 'text/plain') {
      return true;
    } else {
      return false;
    }
  }
}

module.exports.Fragment = Fragment;
