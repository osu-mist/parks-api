const appRoot = require('app-root-path');
// const config = require('config');
const _ = require('lodash');

const { serializeParks, serializePark } = require('../../serializers/parks-serializer');

const { openapi } = appRoot.require('utils/load-openapi');
const getParameters = openapi.paths['/parks'].get.parameters;

const conn = appRoot.require('api/v1/db/oracledb/connection');

// const { endpointUri } = config.get('server');

/**
 * @summary Return a list of parks
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of parks
 */
const getParks = async (queries) => {
  const connection = await conn.getConnection();
  const sqlParams = {};

  // function removes 'filter', '[', and ']' from parameter names to be made sql-readable
  function tidyKeyName(keyName) {
    const filterIndex = keyName.indexOf('filter');
    if (filterIndex !== -1) {
      keyName = keyName.slice(filterIndex + 6);
    }
    keyName = keyName.split('[').join('');
    keyName = keyName.split(']').join('');
    const newKeyName = keyName;
    return newKeyName;
  }

  // iterate through parameters and add parameters in request to the sql query
  _.forEach(getParameters, (key) => {
    if (queries[key.name]) {
      const newKeyName = tidyKeyName(key.name);
      sqlParams[newKeyName] = queries[key.name];
    }
  });

  const sqlQuery = `
    SELECT ID AS "id",
    NAME AS "name",
    STREET_ADDRESS AS "streetAddress",
    CITY AS "city",
    STATE AS "state",
    ZIP AS "zip",
    LATITUDE AS "latitude",
    LONGITUDE AS "longitude",
    OWNER_ID AS "ownerId",
    BALLFIELD AS "ballfield",
    BBQ AS "bbq",
    BASKETBALL AS "basketball",
    BIKE_PATHS AS "bikePaths",
    BOAT_RAMPS AS "boatRamps",
    DOGS_ALLOWED AS "dogsAllowed",
    DRINKING_WATER AS "drinkingWater",
    FISHING AS "fishing",
    HIKING AS "hiking",
    HORSESHOES AS "horseshoes",
    NATURAL_AREA AS "naturalArea",
    DOG_PARK AS "dogPark",
    FIELDS AS "fields",
    SHELTERS AS "shelters",
    TABLES AS "tables",
    PLAY_AREA AS "playArea",
    RESTROOMS AS "restrooms",
    SCENIC_VIEW AS "scenicView",
    SOCCER AS "soccer",
    TENNIS AS "tennis",
    VOLLEYBALL AS "volleyball"
    FROM PARKS
    WHERE 1=1
    ${sqlParams.name ? 'AND NAME = :name' : ''}
    ${sqlParams.city ? 'AND CITY = :city' : ''}
    ${sqlParams.state ? 'AND STATE = :state' : ''}
    ${sqlParams.zip ? 'AND ZIP = :zip' : ''}
  `;

  try {
    const { rows } = await connection.execute(sqlQuery, sqlParams);
    const serializedParks = serializeParks(rows, queries);
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

/*
const postParks = async () => {
  const connection = await conn.getConnection();
  try {
    const { rawParks } = await connection.execute();
  } finally {
    connection.close();
  }
};
*/

module.exports = { getParks, getParkById /* , postParks */ };
