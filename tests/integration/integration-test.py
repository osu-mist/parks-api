import json
import logging
import unittest
import yaml

from prance import ResolvingParser

import utils

ERR_OBJ = 'ErrorObject'
PARK_RES = 'ParkResource'
OWNER_RES = 'OwnerResource'


class integration_tests(unittest.TestCase):
    @classmethod
    def setup(cls, config_path, openapi_path):
        with open(config_path) as config_file:
            config = json.load(config_file)
            cls.base_url = utils.setup_base_url(config)
            cls.session = utils.setup_session(config)
            cls.test_cases = config['test_cases']
            cls.local_test = config['local_test']

        with open(openapi_path) as openapi_file:
            openapi = yaml.load(openapi_file, Loader=yaml.SafeLoader)
            if 'swagger' in openapi:
                backend = 'flex'
            elif 'openapi' in openapi:
                backend = 'openapi-spec-validator'
            else:
                exit('Error: could not determine openapi document version')

        parser = ResolvingParser(openapi_path, backend=backend)
        cls.openapi = parser.specification

    @classmethod
    def cleanup(cls):
        cls.session.close()

    # Test GET /parks
    def test_get_all_parks(self, endpoint='/parks'):
        utils.test_endpoint(self, endpoint, 'ParkResource', 200)

        # Test filter[amenities][all] and filter[amenities][some]
        valid_amenities = self.test_cases['valid_amenities']
        invalid_amenities = self.test_cases['invalid_amenities']
        utils.test_amenity_filter_params(self, endpoint, 'all',
                                         valid_amenities, invalid_amenities)
        utils.test_amenity_filter_params(self, endpoint, 'some',
                                         valid_amenities, invalid_amenities)

        # Test filter[city]
        valid_cities = self.test_cases['valid_cities']
        invalid_cities = self.test_cases['invalid_cities']
        utils.test_filter_params(self, endpoint, 'city', valid_cities,
                                 invalid_cities)

        # Test filter[zip]
        valid_zips = self.test_cases['valid_zips']
        invalid_zips = self.test_cases['invalid_zips']
        utils.test_filter_params(self, endpoint, 'zip', valid_zips,
                                 invalid_zips)

        # Test filter[state]
        valid_states = self.test_cases['valid_states']
        invalid_states = self.test_cases['invalid_states']
        utils.test_filter_params(self, endpoint, 'state', valid_states,
                                 invalid_states)

    # Test GET parks/{id}
    def test_get_park_by_id(self):
        valid_park_ids = self.test_cases['valid_park_ids']
        invalid_park_ids = self.test_cases['invalid_park_ids']
        for park_id in valid_park_ids:
            response = utils.test_endpoint(self, f'/parks/{park_id}', PARK_RES,
                                           200)
            actual_id = response.json()['data']['id']
            self.assertEqual(actual_id, park_id)
        for park_id in invalid_park_ids:
            utils.test_endpoint(self, f'/parks/{park_id}', ERR_OBJ, 404)

    # Test GET owners/{ownerId}/parks
    def test_get_parks_by_owner_id(self):
        valid_owner_ids = self.test_cases['valid_owner_ids']
        for owner_id in valid_owner_ids:
            response = utils.test_endpoint(self, f'/owners/{owner_id}/parks',
                                           PARK_RES, 200)
            response_data = response.json()['data']
            for park in response_data:
                actual_id = park['relationships']['owner']['data']['id']
                self.assertEqual(actual_id, owner_id)

    # Test GET owners
    def test_get_all_owners(self):
        utils.test_endpoint(self, '/owners', OWNER_RES, 200)

    # Test GET owner by ID
    def test_get_owner_by_id(self):
        valid_owner_ids = self.test_cases['valid_owner_ids']
        invalid_owner_ids = self.test_cases['invalid_owner_ids']
        for owner_id in valid_owner_ids:
            response = utils.test_endpoint(self, f'/owners/{owner_id}',
                                           OWNER_RES, 200)
            actual_id = response.json()['data']['id']
            self.assertEqual(actual_id, owner_id)
        for owner_id in invalid_owner_ids:
            response = utils.test_endpoint(self, f'/owners/{owner_id}',
                                           ERR_OBJ, 404)


if __name__ == '__main__':
    arguments, argv = utils.parse_arguments()

    # Setup logging level
    if arguments.debug:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    integration_tests.setup(arguments.config_path, arguments.openapi_path)
    unittest.main(argv=argv)
    integration_tests.cleanup()
