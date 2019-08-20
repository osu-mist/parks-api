const appRoot = require('app-root-path');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { apiBaseUrl, resourcePathLink, paramsLink } = appRoot.require('utils/uri-builder');

const parkResourceProp = openapi.definitions.ParkResource.properties;
const parkResourceType = parkResourceProp.type.enum[0];
const parkResourceKeys = _.keys(parkResourceProp.attributes.properties);
parkResourceKeys.push('owner'); // for relationships to work correctly
const parkResourcePath = 'parks';
const parkResourceUrl = resourcePathLink(apiBaseUrl, parkResourcePath);

const getAmenitiesArray = (rawPark) => {
  const amenList = openapi.definitions.ParkResource.properties.attributes.properties.amenities.enum;
  const amenitiesArray = _.filter(amenList, value => rawPark[value] === '1');
  return amenitiesArray;
};

const structuredPark = (rawPark) => {
  const locationInfo = _.pick(rawPark, ['streetAddress', 'city', 'state', 'zip', 'latitude', 'longitude']);
  const ownerInfo = {
    ownerId: rawPark.ownerId,
    type: 'owner',
  };
  return {
    id: rawPark.id,
    name: rawPark.name,
    location: locationInfo,
    amenities: getAmenitiesArray(rawPark),
    owner: ownerInfo,
  };
};

const structuredParks = rawParks => _.map(rawParks, structuredPark);

/**
 * @summary Serialize parkResources to JSON API
 * @function
 * @param {object[]} rawParks Raw data rows from data source
 * @param {object} query Query parameters
 * @returns {object} Serialized parkResources object
 */
const serializeParks = (rawParks, query) => {
  const topLevelSelfLink = paramsLink(parkResourceUrl, query);
  const parkOwnerRelationships = {
    owner: {
      ref: 'ownerId',
    },
  };
  const serializerArgs = {
    identifierField: 'id',
    resourceKeys: parkResourceKeys,
    resourcePath: parkResourcePath,
    topLevelSelfLink,
    enableDataLinks: true,
    relationships: parkOwnerRelationships,
  };

  return new JsonApiSerializer(
    parkResourceType,
    serializerOptions(serializerArgs),
  ).serialize(structuredParks(rawParks));
};

/**
 * @summary Serialize parkResource to JSON API
 * @function
 * @param {object} rawPark Raw data row from data source
 * @returns {object} Serialized parkResource object
 */
const serializePark = (rawPark) => {
  const topLevelSelfLink = resourcePathLink(parkResourceUrl, rawPark.id);
  const parkOwnerRelationships = {
    owner: {
      ref: 'ownerId',
    },
  };
  const serializerArgs = {
    identifierField: 'id',
    resourceKeys: parkResourceKeys,
    resourcePath: parkResourcePath,
    topLevelSelfLink,
    enableDataLinks: true,
    relationships: parkOwnerRelationships,
  };
  return new JsonApiSerializer(
    parkResourceType,
    serializerOptions(serializerArgs),
  ).serialize(structuredPark(rawPark));
};
module.exports = { serializeParks, serializePark };
