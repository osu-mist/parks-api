const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiExclude = require('chai-exclude');
const config = require('config');
const _ = require('lodash');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

sinon.replace(config, 'get', () => ({ oracledb: {} }));

const ownersSerializer = appRoot.require('api/v1/serializers/owners-serializer');
const { createConnStub } = require('./test-util');
const {
  fakeId,
  fakeOwnerPostBody,
  fakeOwnerPatchBody,
  testCases,
} = require('./test-data');

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
    const { singleResultInList, multiResult, emptyResultInList } = testCases;
    const testCaseList = [singleResultInList, multiResult, emptyResultInList];
    _.forEach(testCaseList, ({ testCase, expectedResult, description }) => {
      it(`getOwners should be fulfilled with ${description}`, () => {
        createConnStub({ rows: testCase });
        const result = ownersDao.getOwners(fakeId);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });
  });

  describe('Test getOwnerById', () => {
    const testCaseList = [testCases.singleResult, testCases.emptyResult];
    _.forEach(testCaseList, ({ testCase, expectedResult, description }) => {
      it(`getOwnerById should be fulfilled with ${description}`, () => {
        createConnStub({ rows: testCase });
        const result = ownersDao.getOwnerById(fakeId);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
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

  describe('Test postOwner', () => {
    it('postOwner with improper body should be rejected', () => {
      createConnStub();

      const result = ownersDao.postOwner('badBody');
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(TypeError);
    });

    it('postOwner should be fulfilled with singleResult', () => {
      createConnStub({ rows: [{}], outBinds: { outId: 1 } });
      const result = ownersDao.postOwner(fakeOwnerPostBody);
      return result.should
        .eventually.be.fulfilled
        .and.deep.equal({});
    });

    it('postOwner should be rejected when outId is not returned', () => {
      createConnStub(testCases.noOutId);
      const result = ownersDao.postOwner(fakeOwnerPostBody);
      return result.should
        .eventually.be.rejectedWith(Error, testCases.noOutId.expectedError);
    });
  });

  describe('Test deleteOwner', () => {
    const testCaseList = [testCases.rowAffected, testCases.noRowsAffected];
    _.forEach(testCaseList, ({ testCase, expectedResult, description }) => {
      it(`deleteOwner should be fulfilled with ${description}`, () => {
        createConnStub(testCase);
        const result = ownersDao.deleteOwnerById(fakeId);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });
  });

  describe('Test patchOwner', () => {
    it('patchOwner with improper body should be rejected', () => {
      createConnStub();

      const result = ownersDao.patchOwnerById(fakeId, 'badBody');
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(Error);
    });
    const testCaseList = [testCases.singleResult, testCases.noRowsAffected];
    _.forEach(testCaseList, ({ testCase, expectedResult, description }) => {
      it(`patchOwner should be fulfilled with ${description}`, () => {
        createConnStub({ rows: testCase });
        const result = ownersDao.patchOwnerById(fakeId, fakeOwnerPatchBody);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });
  });
});
