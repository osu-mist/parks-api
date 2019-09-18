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
  emptyBody: {
    testCase: {},
    expectedResult: undefined,
    description: 'if the body is empty',
  },
  undefinedBody: {
    testCase: undefined,
    expectedResult: undefined,
    description: 'if the body is not defined',
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
  data: {
    type: 'park',
    id: '1234',
    attributes: {
      name: 'Test',
      location: {
        streetAddress: '1200 SW Avery Park Dr.',
        city: 'Corvallis',
        state: 'OR',
        zip: 97333,
        latitude: 44.552283,
        longitude: -123.269906,
      },
      amenities: [
        'dogsAllowed',
        'basketballCourts',
      ],
    },
    relationships: {
      owner: {
        data: {
          type: 'owner',
          id: '21',
        },
      },
    },
  },
};

const fakeParkPostBody = {
  data: {
    type: 'park',
    attributes: {
      name: 'Test',
      location: {
        streetAddress: '1200 SW Avery Park Dr.',
        city: 'Corvallis',
        state: 'OR',
        zip: 97333,
        latitude: 44.552283,
        longitude: -123.269906,
      },
      amenities: [
        'dogsAllowed',
        'basketballCourts',
      ],
    },
    relationships: {
      owner: {
        data: {
          type: 'owner',
          id: '21',
        },
      },
    },
  },
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
