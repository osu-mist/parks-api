const appRoot = require('app-root-path');

const parksDao = require('../../../db/oracledb/parks-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');

/**
 * @summary patch owner
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response
 */
const get = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const result = await parksDao.getParkByOwnerId(ownerId);
    if (!result) {
      return errorBuilder(res, 404, 'An owner with the specified ID was not found.');
    }
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};
module.exports = { get };
