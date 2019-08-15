const appRoot = require('app-root-path');

const parksDao = require('../../db/oracledb/parks-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');

/**
 * @summary Get park by unique ID
 */
const get = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await parksDao.getParkById(id);
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
 * @summary patch parks
 */
const patch = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await parksDao.getParkById(id);
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
 */
const deletePark = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await parksDao.getParkById(id);
    if (!result) {
      errorBuilder(res, 404, 'A park with the specified ID was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

module.exports = { get, patch, delete: deletePark };
