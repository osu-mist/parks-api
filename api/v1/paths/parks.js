const appRoot = require('app-root-path');

const parksDao = require('../db/oracledb/parks-dao');

const { errorHandler } = appRoot.require('errors/errors');

/**
 * @summary Get parks
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} sends result from dao unless an error is caught
 */
const get = async (req, res) => {
  try {
    const result = await parksDao.getParks(req.query);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

/**
 * @summary Post parks
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} sends result from dao unless an error is caught
 */
const post = async (req, res) => {
  try {
    const result = await parksDao.postParks(req.body);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

module.exports = { get, post };
