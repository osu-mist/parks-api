const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
// const chaiSubset = require('chai-subset');
const _ = require('lodash');

const { getDefinition, testSingleResource, testMultipleResources } = require('./test-util.js');
const testData = require('./test-data');

const ownersSerializer = appRoot.require('api/v1/serializers/owners-serializer');

chai.should();
chai.use(chaiAsPromised);
// chai.use(chaiSubset);
const { expect } = chai;

describe('Test owners-serializer', () => {
  const { rawOwners } = testData;
  const { serializeOwner, serializeOwners } = ownersSerializer;
  const resourceType = 'owner';

  it('serializeOwner should form a single JSON result as defined in openapi', () => {
    const serializedOwner = serializeOwner(rawOwners[0]);
    testSingleResource(serializedOwner,
      resourceType,
      rawOwners[0].id,
      _.omit(rawOwners[0], ['id']));
  });

  it('serializeOwners should form a multiple JSON result as defined in openapi', () => {
    const ownerResourceDef = getDefinition('OwnerResource');
    const serializedOwners = serializeOwners(rawOwners);
    testMultipleResources(serializedOwners, rawOwners, resourceType, 'id');
    _.forEach(serializedOwners.data, (value) => {
      expect(value).to.have.all.keys(_.keys(ownerResourceDef));
      expect(value.attributes).to.have.all.keys(_.keys(ownerResourceDef.attributes.properties));
    });
  });

  /*
  it('serializeOwner should be rejected if given null arguments', () => {
    expect(serializeOwner(null)).to.throw(Error, 'Cannot read property \'id\' of null');
  });

  it('serializeOwners should be rejected if given null arguments', () => {
    const serializedOwners = serializeOwners(null);
    expect(serializedOwners.data).to.be.null;
  });
  */
});
