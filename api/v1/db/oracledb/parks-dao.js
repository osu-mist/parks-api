const appRoot = require('app-root-path');
const _ = require('lodash');

const conn = appRoot.require('api/v1/db/oracledb/connection');
const { openapi } = appRoot.require('utils/load-openapi');
const { serializeParks, serializePark } = require('../../serializers/parks-serializer');

const getParameters = openapi.paths['/parks'].get.parameters;

const sql = `
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
  BARBEQUE_GRILLS AS "barbequeGrills",
  BASKETBALL_COURTS AS "basketballCourts",
  BIKE_PATHS AS "bikePaths",
  BOAT_RAMPS AS "boatRamps",
  DOGS_ALLOWED AS "dogsAllowed",
  DRINKING_WATER AS "drinkingWater",
  FISHING AS "fishing",
  HIKING_TRAILS AS "hikingTrails",
  HORSESHOES AS "horseshoes",
  NATURAL_AREA AS "naturalArea",
  OFFLEASH_DOG_PARK AS "offleashDogPark",
  OPEN_FIELDS AS "openFields",
  PICNIC_SHELTERS AS "picnicShelters",
  PICNIC_TABLES AS "picnicTables",
  PLAY_AREA AS "playArea",
  RESTROOMS AS "restrooms",
  SCENIC_VIEW_POINT AS "scenicViewPoint",
  SOCCER_FIELDS AS "soccerFields",
  TENNIS_COURTS AS "tennisCourts",
  VOLLEYBALL AS "volleyball"
  FROM PARKS
  WHERE 1 = 1
`;

// removes 'filter', '[', and ']' from parameter names to match sql column names
const tidyKeyName = (keyName) => {
  keyName = keyName.replace('filter', '').replace('[', '').replace(']', '');
  return keyName;
};

const parseAmenities = (amenitiesArray, mode) => {
  const amenEnum = openapi.definitions.ParkResource.properties.attributes.properties.amenities.enum;
  let sqlParams = '';
  for (let i = 0; i < _.size(amenitiesArray); i += 1) {
    const sqlAmenity = _.snakeCase(amenitiesArray[i]).toUpperCase();
    if (amenEnum.includes(amenitiesArray[i])) {
      if (i === 0) {
        sqlParams = `${sqlParams} ${sqlAmenity} = 1`;
      } else {
        sqlParams = `${sqlParams} ${mode === 'all' ? 'AND' : 'OR'} ${sqlAmenity} = 1`;
      }
    }
  }
  sqlParams = `AND (${sqlParams})`;
  return sqlParams;
};

/**
 * @returns {Promise<object[]>} Promise object represents a list of parks
 * @param {object}
 */
const getParks = async (queries) => {
  const sqlParams = {};

  // add parameters in request to the sql query not including amenities filters
  _.forEach(getParameters, (key) => {
    if (queries[key.name] && !key.name.includes('amenities')) {
      sqlParams[tidyKeyName(key.name)] = queries[key.name];
    }
  });
  const queryParams = `
    ${queries['filter[amenities][some]'] ? parseAmenities(queries['filter[amenities][some]'], 'some') : ''}
    ${queries['filter[amenities][all]'] ? parseAmenities(queries['filter[amenities][all]'], 'all') : ''}
    ${sqlParams.name ? 'AND NAME = :name' : ''}
    ${sqlParams.city ? 'AND CITY = :city' : ''}
    ${sqlParams.state ? 'AND STATE = :state' : ''}
    ${sqlParams.zip ? 'AND ZIP = :zip' : ''}
  `;
  const sqlQuery = `${sql}${queryParams}`;
  const connection = await conn.getConnection();
  try {
    const { rows } = await connection.execute(sqlQuery, sqlParams);
    const serializedParks = serializeParks(rows, queries);
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
const getParkById = async (id) => {
  const sqlParams = {
    parkId: id,
  };
  const queryParams = `
    AND ID = :parkId
  `;
  const sqlQuery = `${sql}${queryParams}`;
  const connection = await conn.getConnection();
  try {
    const { rows } = await connection.execute(sqlQuery, sqlParams);
    if (_.isEmpty(rows)) {
      return undefined;
    }
    if (rows.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const serializedPark = serializePark(rows[0]);
      return serializedPark;
    }
  } finally {
    connection.close();
  }
};

/* not implemented yet
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
