const appRoot = require('app-root-path');
const config = require('config');
const _ = require('lodash');

const { serializeParks, serializePark } = require('../../serializers/parks-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');

const { endpointUri } = config.get('server');

/**
 * @summary Return a list of parks
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of parks
 */
const getParks = async () => {
  const connection = await conn.getConnection();
  try {
    const { rawParks } = await connection.execute('SELECT * FROM PARKS');
    const serializedParks = serializeParks(rawParks, endpointUri);
    return serializedParks;
  } finally {
    connection.close();
  }
};

/**
 * @summary Return a specific park by unique ID
 * @function
 * @param {string} id Unique park ID
 * @returns {Promise<Object>} Promise object represents a specific park or return undefined if term
 *                            is not found
 */
const getParkById = async () => {
  const connection = await conn.getConnection();
  try {
    const { rawParks } = await connection.execute('SELECT * FROM PARKS');

    if (_.isEmpty(rawParks)) {
      return undefined;
    }
    if (rawParks.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const [rawPark] = rawParks;
      const serializedPark = serializePark(rawPark);
      return serializedPark;
    }
  } finally {
    connection.close();
  }
};

module.exports = { getParks, getParkById };
