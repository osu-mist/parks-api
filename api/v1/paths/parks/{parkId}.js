const appRoot = require('app-root-path');

const parksDao = require('../../db/oracledb/parks-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');

/**
 * @summary Get park by unique ID
 * @type RequestHandler
 */
const get = async (req, res) => {
  try {
    const { parkId } = req.params;
    const result = await parksDao.getParkById(parkId);
    if (!result) {
      return errorBuilder(res, 404, 'A park with the specified ID was not found.');
    }
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

/**
 * @summary patch park
 * @type RequestHandler
 */
const patch = async (req, res) => {
  try {
    const { body, params: { parkId } } = req;
    if (body.data.id !== parkId) {
      return errorBuilder(res, 409, 'ID in patch body does not match ID in path.');
    }
    const result = await parksDao.patchParkById(parkId, body);
    if (!result) {
      return errorBuilder(res, 404, 'A park with the specified ID was not found.');
    }
    return res.send(result);
  } catch (err) {
    if (err.errorNum === 2291) {
      return errorBuilder(res, 404, 'An owner with the specified ID was not found');
    }
    return errorHandler(res, err);
  }
};

/**
 * @summary Post park
 * @type RequestHandler
 */
const deletePark = async (req, res) => {
  try {
    const { parkId } = req.params;
    const result = await parksDao.deleteParkById(parkId);
    if (!result) {
      return errorBuilder(res, 404, 'A park with the specified ID was not found.');
    }
    return res.status(204).send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

module.exports = { get, patch, delete: deletePark };
