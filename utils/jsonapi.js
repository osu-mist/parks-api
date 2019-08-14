/**
 * @summary Generate JSON API serializer options
 * @function
 * @param {[Object]} serializerArgs JSON API serializer arguments
 * @returns {Object} JSON API serializer options
 */
const serializerOptions = (serializerArgs) => {
  const {
    identifierField,
    resourceKeys,
    topLevelSelfLink,
    keyForAttribute,
  } = serializerArgs;

  const options = {
    pluralizeType: false,
    attributes: resourceKeys,
    owner: {
      ref: 'ownerId',
    },
    id: identifierField,
    keyForAttribute: keyForAttribute || 'camelCase',
    topLevelLinks: { self: topLevelSelfLink },
    relationshipLinks: { link: 'testlink123' },
    ignoreRelationshipData: false,
  };

  return options;
};

module.exports = { serializerOptions };
