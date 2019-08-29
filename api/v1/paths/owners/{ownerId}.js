const appRoot = require('app-root-path');

const ownersDao = require('../../db/oracledb/owners-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');

/**
 * @summary Get owner by unique ID
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} sends result form dao unless an error is caught
 */
const get = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const result = await ownersDao.getOwnerById(ownerId);
    if (!result) {
      return errorBuilder(res, 404, 'An owner with the specified ID was not found.');
    }
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

/**
 * @summary patch owner
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response
 */
const patch = async (req, res) => {
  try {
    const { body, params: { ownerId } } = req;
    if (body.data.id !== ownerId) {
      return errorBuilder(res, 409, ['ID in patch body does not match ID in path.']);
    }
    const result = await ownersDao.patchOwnerById(ownerId, body);
    if (!result) {
      return errorBuilder(res, 404, 'An owner with the specified ID was not found.');
    }
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

/**
 * @summary Post owner
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response
 */
const deleteOwner = async (req, res) => ({ req, res });

module.exports = { get, patch, delete: deleteOwner };
