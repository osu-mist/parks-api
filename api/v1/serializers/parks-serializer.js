const appRoot = require('app-root-path');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { apiBaseUrl, resourcePathLink, paramsLink } = appRoot.require('utils/uri-builder');

const parkResourceProp = openapi.definitions.ParkResource.properties;
const parkResourceType = parkResourceProp.type.enum[0];
const parkResourceKeys = _.keys(parkResourceProp.attributes.properties);
const parkResourcePath = 'parks';
const parkResourceUrl = resourcePathLink(apiBaseUrl, parkResourcePath);

const getAmenitiesArray = (rawPark) => {
  const amenitiesArray = [];
  const listOfAmenities = ['ballfield', 'bbq', 'basketball', 'bikePaths',
    'boatRamps', 'dogsAllowed', 'drinkingWater', 'fishing', 'hiking',
    'horseshoes', 'naturalArea', 'dogPark', 'fields', 'shelters', 'tables',
    'playArea', 'restrooms', 'scenicView', 'soccer', 'tennis', 'volleyball',
  ];
  let i = 0;
  for (i; i < listOfAmenities.length; i += 1) {
    const amenity = listOfAmenities[i];
    if (rawPark[amenity] === '1') {
      amenitiesArray.push(amenity);
    }
  }
  return amenitiesArray;
};

const structuredPark = (rawPark) => {
  const locationInfo = {
    streetAddress: rawPark.streetAddress,
    city: rawPark.city,
    state: rawPark.state,
    zip: rawPark.zip,
    latitude: rawPark.latitude,
    longitude: rawPark.longitude,
  };
  return {
    id: rawPark.id,
    name: rawPark.name,
    location: locationInfo,
    amenities: getAmenitiesArray(rawPark),
  };
};

const structuredParks = (rawParks) => {
  const parks = [];
  let index = 0;
  while (rawParks[index]) {
    parks[index] = structuredPark(rawParks[index]);
    index += 1;
  }
  return parks;
};

/**
 * @summary Serialize parkResources to JSON API
 * @function
 * @param {[Object]} rawParks Raw data rows from data source
 * @param {Object} query Query parameters
 * @returns {Object} Serialized parkResources object
 */
const serializeParks = (rawParks, query) => {
  const topLevelSelfLink = paramsLink(parkResourceUrl, query);
  const serializerArgs = {
    identifierField: 'id',
    resourceKeys: parkResourceKeys,
    resourcePath: parkResourcePath,
    topLevelSelfLink,
    enableDataLinks: true,
  };
  return new JsonApiSerializer(
    parkResourceType,
    serializerOptions(serializerArgs),
  ).serialize(structuredParks(rawParks));
};

/**
 * @summary Serialize parkResource to JSON API
 * @function
 * @param {Object} rawPark Raw data row from data source
 * @returns {Object} Serialized parkResource object
 */
const serializePark = (rawPark) => {
  const topLevelSelfLink = resourcePathLink(parkResourceUrl, rawPark.id);
  const serializerArgs = {
    identifierField: 'id',
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
