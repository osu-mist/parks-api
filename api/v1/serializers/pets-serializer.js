const appRoot = require('app-root-path');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { paginate } = appRoot.require('utils/paginator');
const { apiBaseUrl, resourcePathLink, paramsLink } = appRoot.require('utils/uri-builder');

const petResourceProp = openapi.definitions.PetResource.properties;
const petResourceType = petResourceProp.type.enum[0];
const petResourceKeys = _.keys(petResourceProp.attributes.properties);
const petResourcePath = 'pets';
const petResourceUrl = resourcePathLink(apiBaseUrl, petResourcePath);

/**
 * Serialize petResources to JSON API
 *
 * @param {object[]} rawPets Raw data rows from data source
 * @param {object} query Query parameters
 * @returns {object} Serialized petResources object
 */
const serializePets = (rawPets, query) => {
  // Add pagination links and meta information to options if pagination is enabled
  const pageQuery = {
    size: query['page[size]'],
    number: query['page[number]'],
  };

  const pagination = paginate(rawPets, pageQuery);
  pagination.totalResults = rawPets.length;
  rawPets = pagination.paginatedRows;

  const topLevelSelfLink = paramsLink(petResourceUrl, query);
  const serializerArgs = {
    identifierField: 'id',
    resourceKeys: petResourceKeys,
    pagination,
    resourcePath: petResourcePath,
    topLevelSelfLink,
    query: _.omit(query, 'page[size]', 'page[number]'),
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    petResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawPets);
};

/**
 * Serialize petResource to JSON API
 *
 * @param {object} rawPet Raw data row from data source
 * @returns {object} Serialized petResource object
 */
const serializePet = (rawPet) => {
  const topLevelSelfLink = resourcePathLink(petResourceUrl, rawPet.id);
  const serializerArgs = {
    identifierField: 'id',
    resourceKeys: petResourceKeys,
    resourcePath: petResourcePath,
    topLevelSelfLink,
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    petResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawPet);
};
module.exports = { serializePets, serializePet };
