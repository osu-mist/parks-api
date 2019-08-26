const appRoot = require('app-root-path');

const parksDao = require('../../db/oracledb/parks-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');

/**
 * @summary Get park by unique ID
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} sends result from dao unless an error is caught
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
 * @summary patch parks
 * @param {object} req request object
 * @param {object} res response object
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
 * @summary Post parks
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} sends result from dao unless an error is caught
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
