const appRoot = require('app-root-path');
const _ = require('lodash');
const oracledb = require('oracledb');

const conn = appRoot.require('api/v1/db/oracledb/connection');
const { apiBaseUrl, resourcePathLink } = appRoot.require('utils/uri-builder');
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
 * @summary Post owner
 * @param {object} ownerBody owner body object
 * @returns {Promise<object>} Promise object represents a specific owner or return undefined if term
 *                            is not found
 */
const postOwner = async (ownerBody) => {
  const { attributes } = ownerBody.data;
  const sqlBinds = {
    ownerName: attributes.ownerName,
    outId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };
  const sqlQuery = `
    INSERT INTO OWNERS (NAME) 
    VALUES (:ownerName)
    RETURNING ID INTO :outId
  `;
  if (_.values(sqlBinds).includes('')) return undefined;
  const connection = await conn.getConnection();
  try {
    const rawOwners = await connection.execute(sqlQuery, sqlBinds, { autoCommit: true });
    const result = await getOwnerById(rawOwners.outBinds.outId[0]);
    result.links.self = resourcePathLink(apiBaseUrl, 'owners');
    return result;
  } finally {
    connection.close();
  }
};


module.exports = { getOwners, getOwnerById, postOwner };
