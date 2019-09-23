const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiExclude = require('chai-exclude');
const _ = require('lodash');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const parksSerializer = appRoot.require('api/v1/serializers/parks-serializer');
const { createConnStub } = require('./test-util');
const {
  fakeId,
  fakeParkPostBody,
  fakeParkPatchBody,
  testCases,
} = require('./test-data');

chai.should();
chai.use(chaiExclude);
chai.use(chaiAsPromised);
const { expect } = chai;

let parksDao;
const {
  singleResultInList,
  multiResult,
  emptyResultInList,
  singleResult,
  emptyResult,
  noRowsAffected,
  rowAffected,
  noOutId,
  emptyBody,
  undefinedBody,
  undefinedId,
  idDoesNotExist,
} = testCases;

describe('Test parks-dao', () => {
  beforeEach(() => {
    const serializeParkStub = sinon.stub(parksSerializer, 'serializePark');
    const serializeParksStub = sinon.stub(parksSerializer, 'serializeParks');
    serializeParkStub.returnsArg(0);
    serializeParksStub.returnsArg(0);

    parksDao = proxyquire(`${appRoot}/api/v1/db/oracledb/parks-dao`, {
      '../../serializers/parks-serializer': {
        serializePark: serializeParkStub,
        serializeParks: serializeParksStub,
      },
    });
  });
  afterEach(() => sinon.restore());

  describe('Test getParks', () => {
    const testCaseList = [singleResultInList, multiResult, emptyResultInList];
    _.forEach(testCaseList, ({ testCase, expectedResult, description }) => {
      it(`getParks should be fulfilled with ${description}`, () => {
        createConnStub({ rows: testCase });
        const result = parksDao.getParks({});
        return result.should.eventually.be.fulfilled.and.deep.equal(expectedResult);
      });
    });

    it('getParks should be rejected when improper query params are passed in', () => {
      createConnStub();
      const expectedError = 'Cannot read property \'filter[amenities][all]\' of undefined';
      const result = parksDao.getParks(undefined);
      return result.should.eventually.be.rejectedWith(Error, expectedError);
    });
  });

  describe('Test getParkById', () => {
    const testCaseList = [singleResult, emptyResult];
    _.forEach(testCaseList, ({ testCase, expectedResult, description }) => {
      it(`getParkById should be fulfilled with ${description}`, () => {
        createConnStub({ rows: testCase });
        const result = parksDao.getParkById(fakeId);
        return result.should.eventually.be.fulfilled.and.deep.equal(expectedResult);
      });
    });

    it('getParkById should be rejected when multiple values are returned', () => {
      const error = 'Expect a single object but got multiple results';
      createConnStub({ rows: multiResult.testCase });
      const result = parksDao.getParkById(fakeId);
      return result.should.eventually.be.rejectedWith(Error, error);
    });
  });

  describe('Test postPark', () => {
    it('postPark with improper body should be rejected', () => {
      createConnStub();

      const result = parksDao.postParks('badBody');
      return result.should.eventually.be.rejected.and.be.an.instanceOf(TypeError);
    });

    it('postPark should be fulfilled with singleResult', () => {
      const connStub = createConnStub({ outBinds: { outId: [1] }, rowsAffected: 1 });
      connStub.executeStub.onSecondCall().returns({ rows: [{}] });
      const result = parksDao.postParks(fakeParkPostBody);
      return result.should.eventually.be.fulfilled.and.deep.equal({});
    });

    it('postPark should be rejected when outId is not returned', () => {
      createConnStub(noOutId.testCase);
      const result = parksDao.postParks(fakeParkPostBody);
      return result.should.eventually.be.rejectedWith(Error, noOutId.expectedError);
    });
  });

  describe('Test deletePark', () => {
    const testCaseList = [rowAffected, noRowsAffected];
    _.forEach(testCaseList, ({ testCase, expectedResult, description }) => {
      it(`deletePark should be fulfilled with ${description}`, () => {
        createConnStub(testCase);
        const result = parksDao.deleteParkById(fakeId);
        return result.should.eventually.be.fulfilled.and.deep.equal(expectedResult);
      });
    });
  });

  describe('Test patchPark', () => {
    it('patchPark with improper body should be rejected', () => {
      createConnStub();
      const result = parksDao.patchParkById(fakeId, 'badBody');
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(Error);
    });
    const testCaseList = [singleResult, noRowsAffected];
    _.forEach(testCaseList, ({ testCase, expectedResult, description }) => {
      it(`patchPark should be fulfilled with ${description}`, () => {
        createConnStub({ rows: testCase });
        const result = parksDao.patchParkById(fakeId, fakeParkPatchBody);
        return result.should.eventually.be.fulfilled.and.deep.equal(expectedResult);
      });
    });
  });

  describe('Test getParksByOwnerId', () => {
    const fulfilledCaseList = [multiResult, singleResultInList];
    _.forEach(fulfilledCaseList, ({ testCase, expectedResult, description }) => {
      it(`getParksByOwnerId should be fulfulled with ${description}`, () => {
        const connStub = createConnStub({ rows: [{ 'COUNT(1)': '1' }] });
        connStub.executeStub.onSecondCall().returns({ rows: testCase });
        const result = parksDao.getParksByOwnerId(fakeId);
        return result.should.eventually.be.fulfilled.and.deep.equal(expectedResult);
      });
    });

    const rejectedCaseList = [undefinedId, idDoesNotExist];
    _.forEach(rejectedCaseList, ({ testCase, expectedResult, description }) => {
      it(`getParksByOwnerId should return undefined ${description}`, () => {
        createConnStub({ rows: [{ 'COUNT(1)': '0' }] });
        const result = parksDao.getParksByOwnerId(testCase);
        return result.should.eventually.be.fulfilled.and.deep.equal(expectedResult);
      });
    });
  });

  describe('Test getPatchSqlQuery', () => {
    const testCaseList = [emptyBody, undefinedBody];
    _.forEach(testCaseList, ({ testCase, expectedResult, description }) => {
      it(`getPatchSqlQuery should return undefined ${description}`, () => {
        const result = parksDao.getPatchSqlQuery(testCase);
        return expect(result).to.equal(expectedResult);
      });
    });
  });
});
