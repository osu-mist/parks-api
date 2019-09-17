const fakeBaseUrl = 'v1';
const fakeId = 'fakeId';

const testCases = {
  singleResultInList: {
    testCase: [{}],
    expectedResult: [{}],
    description: 'a single result',
  },
  singleResult: {
    testCase: [{}],
    expectedResult: {},
    description: 'a single result',
  },
  multiResult: {
    testCase: [{}, {}],
    expectedResult: [{}, {}],
    description: 'multiple results',
  },
  emptyResult: {
    testCase: [],
    expectedResult: undefined,
    description: 'no results',
  },
  emptyResultInList: {
    testCase: [],
    expectedResult: [],
    description: 'no results',
  },
  noOutId: {
    testCase: [],
    expectedError: 'Cannot read property \'outId\' of undefined',
    description: 'outId is not returned',
  },
  noOutIdResponse: {
    testCase: { outBinds: { outId: fakeId } },
    expectedError: 'Cannot read property \'length\' of undefined',
    description: 'outId is returned without an additional response',
  },
  noRowsAffected: {
    testCase: { rowsAffected: 0 },
    expectedResult: undefined,
    description: 'with 0 rows affected',
  },
  rowAffected: {
    testCase: { rowsAffected: 1 },
    expectedResult: { rowsAffected: 1 },
    description: 'with 1 row affected',
  },
};

const rawParks = [{

}];

const rawOwners = [
  {
    id: fakeId,
    ownerName: 'ketchup',
  },
  {
    id: fakeId,
    ownerName: 'mustard',
  },
];

const fakeOwnerPatchBody = {
  data: {
    id: fakeId,
    type: 'owner',
    attributes: {
      ownerName: 'fakeName',
    },
  },
};

const fakeOwnerPostBody = {
  data: {
    type: 'owner',
    attributes: {
      ownerName: 'fakeName',
    },
  },
};

const fakeParkPatchBody = {

};

const fakeParkPostBody = {

};

module.exports = {
  fakeParkPatchBody,
  fakeParkPostBody,
  fakeOwnerPostBody,
  fakeOwnerPatchBody,
  rawOwners,
  rawParks,
  testCases,
  fakeId,
  fakeBaseUrl,
};
