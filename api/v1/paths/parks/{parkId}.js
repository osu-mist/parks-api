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
    const { parkId } = req.params;
    const result = await parksDao.getParkById(parkId);
    if (!result) {
      errorBuilder(res, 404, 'A park with the specified ID was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
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
