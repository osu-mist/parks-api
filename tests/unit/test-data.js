const fakeBaseUrl = 'v1';
const fakeId = 'fakeId';

const testCases = {
  singleResultInList: {
    testCase: [{}],
    expectedResult: [{}],
    description: 'a single result in an array',
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
  undefinedId: {
    testCase: undefined,
    expectedResult: undefined,
    description: 'if the id is not defined',
  },
  idDoesNotExist: {
    testCase: fakeId,
    expectedResult: undefined,
    description: 'if there is no owner with the matching ID',
  },
};

const rawParks = [
  {
    id: fakeId,
    name: 'Ketchup park',
    streetAddress: '1234 Condiment Lane',
    city: 'Salem',
    state: 'OR',
    zip: '97333',
    latitude: '44.552283',
    longitude: '-123.269906',
    ownerId: '21',
    ballfield: '0',
    barbequeGrills: '0',
    basketballCourts: '1',
    bikePaths: '0',
    boatRamps: '0',
    dogsAllowed: '1',
    drinkingWater: '0',
    fishing: '0',
    hikingTrails: '0',
    horseshoes: '0',
    naturalArea: '1',
    offleashDogPark: '0',
    openFields: '0',
    picnicShelters: '0',
    picnicTables: '0',
    playArea: '0',
    restrooms: '0',
    scenicViewPoint: '0',
    soccerFields: '0',
    tennisCourts: '0',
    volleyball: '0',
  },
  {
    id: fakeId,
    name: 'Mustard Park',
    streetAddress: '1235 Condiment Lane',
    city: 'Corvallis',
    state: 'OR',
    zip: '97333',
    latitude: '44.552283',
    longitude: '-123.269906',
    ownerId: '21',
    ballfield: '0',
    barbequeGrills: '0',
    basketballCourts: '1',
    bikePaths: '0',
    boatRamps: '0',
    dogsAllowed: '1',
    drinkingWater: '0',
    fishing: '0',
    hikingTrails: '0',
    horseshoes: '0',
    naturalArea: '1',
    offleashDogPark: '0',
    openFields: '0',
    picnicShelters: '0',
    picnicTables: '0',
    playArea: '0',
    restrooms: '0',
    scenicViewPoint: '0',
    soccerFields: '0',
    tennisCourts: '0',
    volleyball: '0',
  },
];

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
