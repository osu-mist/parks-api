const appRoot = require('app-root-path');
const _ = require('lodash');

const conn = appRoot.require('api/v1/db/oracledb/connection');
const { serializeOwner, serializeOwners } = require('../../serializers/owners-serializer');

const sqlSnippet = 'SELECT ID AS "id", NAME AS "ownerName" FROM OWNERS WHERE 1 = 1';
/**
 * @summary Get owners
 * @param {object} queries park body object
 * @returns {Promise<object>} Promise object represents an owner or return undefined if term
 *                            is not found
 */
const getOwners = async (queries) => {
  const sqlQuery = sqlSnippet;
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
 * @param {string} id Unique park ID
 * @returns {Promise<object>} Promise object represents a specific park or return undefined if term
 *                            is not found
 */
const getOwnerById = async (id) => {
  const sqlParams = {
    ownerId: id,
  };
  const sqlQuery = `${sqlSnippet} AND ID = :ownerId`;
  const connection = await conn.getConnection();
  try {
    const { rows } = await connection.execute(sqlQuery, sqlParams);
    if (_.isEmpty(rows)) {
      return undefined;
    }
    if (rows.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const serializedPark = serializeOwner(rows[0]);
      return serializedPark;
    }
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


module.exports = { getOwners, getOwnerById, postOwner };
