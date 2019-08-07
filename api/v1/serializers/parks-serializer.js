const appRoot = require('app-root-path');
const decamelize = require('decamelize');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { paginate } = appRoot.require('utils/paginator');
const { apiBaseUrl, resourcePathLink, paramsLink } = appRoot.require('utils/uri-builder');

const parkResourceProp = openapi.definitions.ParkResource.properties;
const parkResourceType = parkResourceProp.type.enum[0];
const parkResourceKeys = _.keys(parkResourceProp.attributes.properties);
const parkResourcePath = 'parks';
const parkResourceUrl = resourcePathLink(apiBaseUrl, parkResourcePath);

/**
 * The column name getting from database is usually UPPER_CASE.
 * This block of code is to make the camelCase keys defined in openapi.yaml be
 * UPPER_CASE so that the serializer can correctly match the corresponding columns
 * from the raw data rows.
 */
_.forEach(parkResourceKeys, (key, index) => {
  parkResourceKeys[index] = decamelize(key).toUpperCase();
});

/**
 * @summary Serialize parkResources to JSON API
 * @function
 * @param {[Object]} rawParks Raw data rows from data source
 * @param {Object} query Query parameters
 * @returns {Object} Serialized parkResources object
 */
const serializeParks = (rawParks, query) => {
  /**
   * Add pagination links and meta information to options if pagination is enabled
   */
  const pageQuery = {
    size: query['page[size]'],
    number: query['page[number]'],
  };

  const pagination = paginate(rawParks, pageQuery);
  pagination.totalResults = rawParks.length;
  rawParks = pagination.paginatedRows;

  const topLevelSelfLink = paramsLink(parkResourceUrl, query);
  const serializerArgs = {
    identifierField: 'ID',
    resourceKeys: parkResourceKeys,
    pagination,
    resourcePath: parkResourcePath,
    topLevelSelfLink,
    query: _.omit(query, 'page[size]', 'page[number]'),
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    parkResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawParks);
};

/**
 * @summary Serialize parkResource to JSON API
 * @function
 * @param {Object} rawPark Raw data row from data source
 * @returns {Object} Serialized parkResource object
 */
const serializePark = (rawPark) => {
  const topLevelSelfLink = resourcePathLink(parkResourceUrl, rawPark.ID);
  const serializerArgs = {
    identifierField: 'ID',
    resourceKeys: parkResourceKeys,
    resourcePath: parkResourcePath,
    topLevelSelfLink,
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    parkResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawPark);
};
module.exports = { serializeParks, serializePark };
