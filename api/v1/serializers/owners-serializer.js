const appRoot = require('app-root-path');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { apiBaseUrl, resourcePathLink, paramsLink } = appRoot.require('utils/uri-builder');

const ownerResourceProp = openapi.definitions.OwnerResource.properties;
const ownerResourceType = ownerResourceProp.type.enum[0];
const ownerResourceKeys = _.keys(ownerResourceProp.attributes.properties);
const ownerResourcePath = 'owners';
const ownerResourceUrl = resourcePathLink(apiBaseUrl, ownerResourcePath);

/**
 * @summary Serialize ownerResources to JSON API
 * @function
 * @param {object[]} rawOwners Raw data rows from data source
 * @param {object} query Query parameters
 * @returns {object} Serialized ownerResources object
 */
const serializeOwners = (rawOwners, query) => {
  const topLevelSelfLink = paramsLink(ownerResourceUrl, query);
  const serializerArgs = {
    identifierField: 'id',
    resourceKeys: ownerResourceKeys,
    resourcePath: ownerResourcePath,
    topLevelSelfLink,
    enableDataLinks: true,
  };
  return new JsonApiSerializer(
    ownerResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawOwners);
};

/**
 * @summary Serialize ownerResource to JSON API
 * @function
 * @param {object} rawOwner Raw data row from data source
 * @returns {object} Serialized ownerResource object
 */
const serializeOwner = (rawOwner) => {
  const topLevelSelfLink = resourcePathLink(ownerResourceUrl, rawOwner.id);
  const serializerArgs = {
    identifierField: 'id',
    resourceKeys: ownerResourceKeys,
    resourcePath: ownerResourcePath,
    topLevelSelfLink,
    enableDataLinks: true,
  };
  return new JsonApiSerializer(
    ownerResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawOwner);
};
module.exports = { serializeOwners, serializeOwner };
