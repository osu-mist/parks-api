const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiExclude = require('chai-exclude');
const config = require('config');
const _ = require('lodash');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

sinon.replace(config, 'get', () => ({ oracledb: {} }));
const { createConnStub } = require('./test-util');
const {
  fakeId,
  // fakeOwnerPostBody,
  // fakeOwnerPatchBody,
  testCases,
  // truthyList,
  // falseyList,
  // fakeBody,
} = require('./test-data');

const ownersSerializer = appRoot.require('api/v1/serializers/owners-serializer');

chai.should();
chai.use(chaiExclude);
chai.use(chaiAsPromised);

let ownersDao;

describe('Test owners-dao', () => {
  beforeEach(() => {
    const serializeOwnerStub = sinon.stub(ownersSerializer, 'serializeOwner');
    const serializeOwnersStub = sinon.stub(ownersSerializer, 'serializeOwners');
    serializeOwnerStub.returnsArg(0);
    serializeOwnersStub.returnsArg(0);

    ownersDao = proxyquire(`${appRoot}/api/v1/db/oracledb/owners-dao`, {
      '../../serializers/owners-serializer': {
        serializeOwner: serializeOwnerStub,
        serializeOwners: serializeOwnersStub,
      },
    });
  });
  afterEach(() => sinon.restore());

  describe('Test getOwners', () => {
    const testCaseList = [testCases.singleResult, testCases.multiResult, testCases.emptyResult];
    _.forEach(testCaseList, ({ testCase, description }) => {
      it(`getOwners should be fulfilled with ${description}`, () => {
        createConnStub({ rows: testCase });
        const result = ownersDao.getOwners(fakeId);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(testCase);
      });
    });
  });

  describe('Test getOwnerById', () => {
    const testCaseList = [testCases.singleResult, testCases.emptyResult];
    _.forEach(testCaseList, ({ testCase, description }) => {
      it(`getOwnerById should be fulfilled with ${description}`, () => {
        createConnStub({ rows: testCase });
        const result = ownersDao.getOwnerById(fakeId);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(testCase[0]);
      });
    });

    it('getOwnerById should be rejected when multiple values are returned', () => {
      const { testCase } = testCases.multiResult;
      const error = 'Expect a single object but got multiple results';

      createConnStub({ rows: testCase });

      const result = ownersDao.getOwnerById(fakeId);
      return result.should.eventually.be.rejectedWith(Error, error);
    });
  });

  /*
  describe('Test postOwner', () => {
    const testCase = testCases.singleResult;
    it(`postOwner should be fulfilled with ${testCase.description}`, () => {
      createConnStub()
    });
  })
  */
});
