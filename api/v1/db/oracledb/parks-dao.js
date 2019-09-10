const appRoot = require('app-root-path');
const _ = require('lodash');
const oracledb = require('oracledb');

const conn = appRoot.require('api/v1/db/oracledb/connection');
const { openapi } = appRoot.require('utils/load-openapi');
const { apiBaseUrl, resourcePathLink } = appRoot.require('utils/uri-builder');
const { serializeParks, serializePark } = require('../../serializers/parks-serializer');

const getParameters = openapi.paths['/parks'].get.parameters;
const { definitions } = openapi;
const amenityEnum = definitions.ParkResource.properties.attributes.properties.amenities.items.enum;

const getParkSql = `
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
    const sqlAmenity = _.snakeCase(value).toUpperCase();
    if (amenityEnum.includes(value)) {
      if (index === 0) return `${sqlAmenity} = 1`;
      return `${accumulator} ${mode === 'all' ? 'AND' : 'OR'} ${sqlAmenity} = 1`;
    }
    throw new Error('Unexpected amenity name');
  }, '');
  return `AND (${sqlParams})`;
};

// parses amenities for use in post parks sql query
const postAmenitiesSqlHelper = amenities => _.reduce(amenityEnum, (accumulator, value, index) => {
  const returnString = `${accumulator} ${amenities.includes(amenityEnum[index]) ? 1 : 0}`;
  if (index === amenityEnum.length - 1) {
    return returnString;
  }
  return `${returnString},`;
}, '');

// generates sql query for patchParks
const getPatchSqlQuery = (body) => {
  const { attributes: { location, amenities, name }, relationships } = body.data;
  const patchFields = [];
  if (name) patchFields.push('NAME = :name');
  if (relationships.owner.data.id) patchFields.push('OWNER_ID = :ownerId');
  _.forEach(location, (value, key) => {
    patchFields.push(`${_.snakeCase(key).toUpperCase()} = :${key}`);
  });
  _.forEach(amenityEnum, (value) => {
    patchFields.push(`${_.snakeCase(value).toUpperCase()} = ${amenities.includes(value) ? 1 : 0}`);
  });
  const sqlQuery = `
    UPDATE PARKS SET
    ${patchFields.join(', ')}
    WHERE ID = :id
`;
  return sqlQuery;
};

// generates sql binds for patchParks
const getPatchSqlBinds = (body) => {
  const { attributes: { location, name }, relationships, id } = body.data;
  const sqlBinds = {};
  _.forEach(location, (value, key) => {
    sqlBinds[key] = value;
  });
  sqlBinds.id = id;
  sqlBinds.ownerId = relationships.owner.data.id;
  sqlBinds.name = name;
  return sqlBinds;
};


/**
 * @param {object} queries queries object containing queries for endpoint
 * @returns {Promise<object[]>} Promise object represents a list of parks
 */
const getParks = async (queries) => {
  const sqlBinds = {};

  // add parameters in request to the sql query not including amenities filters
  _.forEach(getParameters, (key) => {
    if (queries[key.name] && !key.name.includes('amenities')) {
      sqlBinds[tidyKeyName(key.name)] = queries[key.name];
    }
  });
  const queryParams = `
    ${queries['filter[amenities][some]'] ? parseAmenities(queries['filter[amenities][some]'], 'some') : ''}
    ${queries['filter[amenities][all]'] ? parseAmenities(queries['filter[amenities][all]'], 'all') : ''}
    ${sqlBinds.name ? 'AND NAME = :name' : ''}
    ${sqlBinds.city ? 'AND CITY = :city' : ''}
    ${sqlBinds.state ? 'AND STATE = :state' : ''}
    ${sqlBinds.zip ? 'AND ZIP = :zip' : ''}
  `;
  const sqlQuery = `${getParkSql}${queryParams}`;
  const connection = await conn.getConnection();
  try {
    const { rows } = await connection.execute(sqlQuery, sqlBinds);
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
  const sqlBinds = {
    parkId: id,
  };
  const queryParams = `
    AND ID = :parkId
  `;
  const sqlQuery = `${getParkSql}${queryParams}`;
  const connection = await conn.getConnection();
  try {
    const { rows } = await connection.execute(sqlQuery, sqlBinds);
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
const postParks = async (parkBody) => {
  const { attributes, relationships } = parkBody.data;
  const { amenities, location } = attributes;
  const sqlBinds = {
    name: attributes.name,
    streetAddress: location.streetAddress,
    city: location.city,
    state: location.state,
    zip: location.zip,
    latitude: location.latitude,
    longitude: location.longitude,
    ownerId: relationships.owner.data.id,
    outId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };
  const sqlQuery = `
    INSERT INTO PARKS (
      NAME,
      STREET_ADDRESS,
      CITY,
      STATE,
      ZIP,
      LATITUDE,
      LONGITUDE,
      OWNER_ID,
      BALLFIELD,
      BARBEQUE_GRILLS,
      BASKETBALL_COURTS,
      BIKE_PATHS,
      BOAT_RAMPS,
      DOGS_ALLOWED,
      DRINKING_WATER,
      FISHING,
      HIKING_TRAILS,
      HORSESHOES,
      NATURAL_AREA,
      OFFLEASH_DOG_PARK,
      OPEN_FIELDS,
      PICNIC_SHELTERS,
      PICNIC_TABLES,
      PLAY_AREA,
      RESTROOMS,
      SCENIC_VIEW_POINT,
      SOCCER_FIELDS,
      TENNIS_COURTS,
      VOLLEYBALL
    ) 
    VALUES (
      :name, :streetAddress, :city, :state, :zip, :latitude, :longitude, :ownerId,
      ${postAmenitiesSqlHelper(amenities)}
    )
    RETURNING ID INTO :outId
  `;
  const connection = await conn.getConnection();
  try {
    const rawParks = await connection.execute(sqlQuery, sqlBinds, { autoCommit: true });
    const result = await getParkById(rawParks.outBinds.outId[0]);
    result.links.self = resourcePathLink(apiBaseUrl, 'parks');
    return result;
  } finally {
    connection.close();
  }
};

/**
 * @param {string} id Unique park ID
 * @returns {Promise<object>} Promise object represents a specific park or return undefined if term
 *                            is not found
 */
const deleteParkById = async (id) => {
  const sqlParams = {
    parkId: id,
  };
  const sqlQuery = 'DELETE FROM PARKS WHERE ID = :parkId';
  const connection = await conn.getConnection();
  try {
    const result = await connection.execute(sqlQuery, sqlParams, { autoCommit: true });
    if (result.rowsAffected === 0) return undefined;
    return result;
  } finally {
    connection.close();
  }
};

/**
 * @summary Patch parks
 * @param {string} id The id of the pack to be patched
 * @param {object} body park body object with fields to be patched
 * @returns {Promise<object>} Promise object represents a specific park or return undefined if term
 *                            is not found
 */
const patchParkById = async (id, body) => {
  const sqlBinds = getPatchSqlBinds(body);
  const sqlQuery = getPatchSqlQuery(body);
  const connection = await conn.getConnection();
  try {
    const rawPark = await connection.execute(sqlQuery, sqlBinds, { autoCommit: true });
    if (rawPark.rowsAffected === 0) return rawPark;
    const result = getParkById(id);
    return result;
  } finally {
    connection.close();
  }
};

/**
 * @summary Get park by owner Id
 * @param {string} id Unique owner ID
 * @returns {Promise<object>} Promise object represents a specific owner or return undefined if term
 *                            is not found
 */
const getParksByOwnerId = async (id) => {
  const sqlBinds = { ownerId: id };
  const sqlQuery = `${getParkSql} AND OWNER_ID = :ownerId`;
  const connection = await conn.getConnection();
  try {
    // check if owner exists
    const ownerTest = await connection.execute('SELECT COUNT(1) FROM OWNERS WHERE ID = :ownerId', sqlBinds);
    if (_.isEmpty(ownerTest.rows)) return undefined;
    const { rows } = await connection.execute(sqlQuery, sqlBinds);
    const serializedParks = serializeParks(rows);
    serializedParks.links.self = `${apiBaseUrl}/owners/${id}/parks`;
    return serializedParks;
  } finally {
    connection.close();
  }
};

module.exports = {
  getParks,
  getParkById,
  postParks,
  deleteParkById,
  patchParkById,
  getParksByOwnerId,
};
