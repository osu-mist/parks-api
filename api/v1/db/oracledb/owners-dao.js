const appRoot = require('app-root-path');
const _ = require('lodash');

const conn = appRoot.require('api/v1/db/oracledb/connection');
const { serializeOwner, serializeOwners } = require('../../serializers/owners-serializer');

const sqlSnippet = 'SELECT ID AS "id", NAME AS "ownerName" FROM OWNERS WHERE 1 = 1';
/**
 * @summary Get owners
 * @param {object} queries owner body object
 * @returns {Promise<object>} Promise object represents an owner or return undefined if term
 *                            is not found
 */
const getOwners = async (queries) => {
  const sqlQuery = sqlSnippet;
  const connection = await conn.getConnection();
  try {
    const { rows } = await connection.execute(sqlQuery);
    const serializedOwners = serializeOwners(rows, queries);
    return serializedOwners;
  } finally {
    connection.close();
  }
};

/**
 * @param {string} id Unique owner ID
 * @returns {Promise<object>} Promise object represents a specific owner or return undefined if term
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
      const serializedOwner = serializeOwner(rows[0]);
      return serializedOwner;
    }
  } finally {
    connection.close();
  }
};

/**
 * @summary Post owner (not implemented yet)
 * @param {object} ownerBody owner body object
 * @returns {Promise<object>} Promise object represents a specific owner or return undefined if term
 *                            is not found
 */
const postOwner = async ownerBody => ownerBody;

/**
 * @summary Delete owner by Id
 * @param {string} id owner Id
 * @returns {Promise<object>} Promise object represents a specific owner or return undefined if term
 *                            is not found
 */
const deleteOwnerById = async (id) => {
  const sqlParams = {
    ownerId: id,
  };
  const sqlQuery = 'DELETE FROM OWNERS WHERE ID = :ownerId';
  const connection = await conn.getConnection();
  try {
    const result = await connection.execute(sqlQuery, sqlParams, { autoCommit: true });
    if (result.rowsAffected === 0) return undefined;
    return result;
  } finally {
    connection.close();
  }
};

module.exports = {
  getOwners,
  getOwnerById,
  postOwner,
  deleteOwnerById,
};
