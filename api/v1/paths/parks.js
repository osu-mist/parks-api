const appRoot = require('app-root-path');

const parksDao = require('../db/oracledb/parks-dao');

const { errorHandler, errorBuilder } = appRoot.require('errors/errors');

/**
 * @summary Get parks
 * @type RequestHandler
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
 * @type RequestHandler
 */
const post = async (req, res) => {
  try {
    const result = await parksDao.postParks(req.body);
    if (!result) return errorBuilder(res, 400, ['Values may not be an empty string']);
    res.set('Location', result.data.links.self);
    return res.status(201).send(result);
  } catch (err) {
    if (err.errorNum === 2291) {
      return errorBuilder(res, 404, 'Owner ID not found');
    }
    return errorHandler(res, err);
  }
};

module.exports = { get, post };
