const appRoot = require('app-root-path');

const conn = appRoot.require('api/v1/db/oracledb/connection');
const { serializeOwners } = require('../../serializers/owners-serializer');

/**
 * @summary Get owners
 * @param {object} queries park body object
 * @returns {Promise<object>} Promise object represents an owner or return undefined if term
 *                            is not found
 */
const getOwners = async (queries) => {
  const sqlQuery = 'SELECT ID AS "id", NAME AS "ownerName" FROM OWNERS';
  const connection = await conn.getConnection();
  try {
    const { rows } = await connection.execute(sqlQuery);
    const serializedParks = serializeOwners(rows, queries);
    return serializedParks;
  } finally {
    connection.close();
  }
};

/**
 * @summary Post owner
 * @param {object} ownerBody park body object
 * @returns {Promise<object>} Promise object represents a specific park or return undefined if term
 *                            is not found
 */
const postOwner = async ownerBody => ownerBody;


module.exports = { getOwners, postOwner };
