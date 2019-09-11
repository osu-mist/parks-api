const fakeId = 'fakeId';
const truthyList = [
  0,
  1,
  'a',
  'abc',
  '0',
  'false',
  [],
  [1, 2, 3],
  {
    a: 'b',
  },
  {},
  () => {},
];

const falseyList = [
  false,
  '',
  null,
  undefined,
  NaN,
];

const testCases = {
  singleResult: {
    testCase: [{}],
    description: 'a single result',
  },
  multiResult: {
    testCase: [{}, {}],
    description: 'multiple results',
  },
  emptyResult: {
    testCase: [],
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

};

const rawParks = [{

}];

const rawOwners = [{

}];

const serializedPark = {

};

const serializedParks = {
};

const serializedOwner = {
};

const serializedOwners = {

};

const fakeOwnerPatchBody = {

};
const fakeOwnerPostBody = {

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
  serializedOwners,
  serializedOwner,
  serializedParks,
  serializedPark,
  rawOwners,
  rawParks,
  testCases,
  falseyList,
  truthyList,
  fakeId,
};
