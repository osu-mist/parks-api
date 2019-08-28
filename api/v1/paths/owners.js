const appRoot = require('app-root-path');

const ownersDao = require('../db/oracledb/owners-dao');

const { errorHandler } = appRoot.require('errors/errors');

/**
 * @summary Get owners
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} sends result from dao unless an error is caught
 */
const get = async (req, res) => {
  try {
    const result = await ownersDao.getOwners(req.query);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

/**
 * @summary Post owners
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} sends result from dao unless an error is caught
 */
const post = async (req, res) => ({ req, res });

module.exports = { get, post };
