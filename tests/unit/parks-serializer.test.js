const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');

const { /* getDefinition, */ testSingleResource /* , testMultipleResources */} = require('./test-util.js');
const testData = require('./test-data');

const parksSerializer = appRoot.require('api/v1/serializers/parks-serializer');

chai.should();
chai.use(chaiAsPromised);
// const { expect } = chai;

describe('Test parks-serializer', () => {
  const { rawParks } = testData;
  const {
    serializePark,
    // serializeParks,
    structuredPark,
    // structuredParks,
  } = parksSerializer;
  const resourceType = 'park';

  it('serializePark should form a single JSON result as defined in openapi', () => {
    const serializedPark = serializePark(rawParks[0]);
    const relationships = [
      {
        relationshipType: 'owner',
        relationshipFields: {
          id: rawParks[0].ownerId,
          type: 'owner',
        },
      },
    ];
    testSingleResource(
      serializedPark,
      resourceType,
      rawParks[0].id,
      _.omit(structuredPark(rawParks[0]), ['id', 'ownerId', 'owner']),
      relationships,
    );
  });
  /*
  it('serializeParks should form a multiple JSON result as defined in openapi', () => {
    const parkResourceDef = getDefinition('ParkResource');
    const serializedParks = serializeParks(rawParks);
    testMultipleResources(serializedParks, rawParks, resourceType, 'id');
    _.forEach(serializedParks.data, (value) => {
      expect(value).to.have.all.keys(_.keys(parkResourceDef));
      expect(value.attributes).to.have.all.keys(_.keys(parkResourceDef.attributes.properties));
    });
  });
  */
});
