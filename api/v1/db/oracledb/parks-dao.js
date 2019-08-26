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
const tidyKeyName = keyName => keyName.replace(/filter|\]|\[/g, '');

// converts amenities from query params to sql snippet
const parseAmenities = (amenitiesArray, mode) => {
  const sqlParams = _.reduce(amenitiesArray, (accumulator, value, index) => {
    const openapiDefs = openapi.definitions;
    const enums = openapiDefs.ParkResource.properties.attributes.properties.amenities.items.enum;
    const sqlAmenity = _.snakeCase(value).toUpperCase();
    if (enums.includes(value)) {
      if (index === 0) return `${sqlAmenity} = 1`;
      return `${accumulator} ${mode === 'all' ? 'AND' : 'OR'} ${sqlAmenity} = 1`;
    }
    throw new Error('Unexpected amenity name');
  }, '');
  return `AND (${sqlParams})`;
};

/**
 * @param {object} queries queries object containing queries for endpoint
 * @returns {Promise<object[]>} Promise object represents a list of parks
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

/**
 * @summary Post parks
 * @param {object} parkBody park body object
 * @returns {Promise<object>} Promise object represents a specific park or return undefined if term
 *                            is not found
 */
/*
const postParks = async (parkBody) => {
  const { attributes } = parkBody.data;
  const { amenities, location } = attributes;
  const sqlQuery = `
    INSERT INTO PARKS (NAME, STREET_ADDRESS, CITY, STATE, ZIP, LATITUDE, LONGITUDE, OWNER_ID,
    BALLFIELD, BARBEQUE_GRILLS, BASKETBALL_COURTS, BIKE_PATHS, BOAT_RAMPS, DOGS_ALLOWED,
    DRINKING_WATER, FISHING, HIKING_TRAILS, HORSESHOES, NATURAL_AREA, OFFLEASH_DOG_PARK,
    OPEN_FIELDS, PICNIC_SHELTERS, PICNIC_TABLES, PLAY_AREA, RESTROOMS, SCENIC_VIEW_POINT,
    SOCCER_FIELDS, TENNIS_COURTS, VOLLEYBALL) VALUES (
      ${attributes.name},
      ${location.streetAddress},
      ${location.city},
      ${location.state},
      ${location.zip},
      ${location.latitude},
      ${location.longitude},
      ${parkBody.relationships.owner.data.id},
      ${amenities.ballfield ? 1 : 0},
      ${amenities.barbequeGrills ? 1 : 0},
      ${amenities.basketballCourts ? 1 : 0},
      ${amenities.bikePaths ? 1 : 0},
      ${amenities.boatRamps ? 1 : 0},
      ${amenities.dogsAllowed ? 1 : 0},
      ${amenities.drinkingWater ? 1 : 0},
      ${amenities.fishing ? 1 : 0},
      ${amenities.hikingTrails ? 1 : 0},
      ${amenities.horseshoes ? 1 : 0},
      ${amenities.naturalArea ? 1 : 0},
      ${amenities.offleashDogPark ? 1 : 0},
      ${amenities.openFields ? 1 : 0},
      ${amenities.picnicShelters ? 1 : 0},
      ${amenities.picnicTables ? 1 : 0},
      ${amenities.playArea ? 1 : 0},
      ${amenities.restrooms ? 1 : 0},
      ${amenities.scenicViewPoint ? 1 : 0},
      ${amenities.soccerFields ? 1 : 0},
      ${amenities.tennisCourts ? 1 : 0},
      ${amenities.volleyball ? 1 : 0},
      )
  `;
  const sqlParams = {
    body: parkBody,
  };
  const connection = await conn.getConnection();
  try {
    const { rows } = await connection.execute(sqlQuery, sqlParams);
  } finally {
    connection.close();
  }
};
*/
module.exports = { getParks, getParkById /* , postParks */};
