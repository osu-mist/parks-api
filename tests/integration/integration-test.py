import json
import logging
import unittest
import yaml

from prance import ResolvingParser

import utils


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
        valid_amenities = self.test_cases['valid_amenities']
        invalid_amenities = self.test_cases['invalid_amenities']

        # Test filter[amenities][all]
        for amenities in valid_amenities:
            params = {'filter[amenities][all]': amenities}
            response = utils.test_endpoint(self, endpoint, 'ParkResource', 200,
                                           query_params=params)
            response_data = response.json()['data']
            for resource in response_data:
                actual_amenities = resource['attributes']['amenities']
                for amenity in amenities.split(','):
                    self.assertIn(amenity, actual_amenities)
        for amenities in invalid_amenities:
            params = {'filter[amenities][all]': amenities}
            utils.test_endpoint(self, endpoint, 'ErrorObject', 400,
                                query_params=params)

        # Test filter[amenities][some]
        for amenities in valid_amenities:
            amen_list = amenities.split(',')
            params = {'filter[amenities][some]': amenities}
            response = utils.test_endpoint(self, endpoint, 'ParkResource', 200,
                                           query_params=params)
            response_data = response.json()['data']
            for resource in response_data:
                actual_amenities = resource['attributes']['amenities']
                self.assertTrue(
                    # asserts if at least one item in amen_list is also in
                    # actual_amenities
                    any(True for x in actual_amenities if x in amen_list)
                )
        for amenities in invalid_amenities:
            params = {'filter[amenities][all]': amenities}
            utils.test_endpoint(self, endpoint, 'ErrorObject', 400,
                                query_params=params)

        # Test filter[city]
        valid_cities = self.test_cases['valid_cities']
        invalid_cities = self.test_cases['invalid_cities']
        for city in valid_cities:
            params = {'filter[city]': city}
            response = utils.test_endpoint(self, endpoint, 'ParkResource', 200,
                                           query_params=params)
            response_data = response.json()['data']
            for resource in response_data:
                actual_city = resource['attributes']['location']['city']
                self.assertEqual(actual_city, city)
        for city in invalid_cities:
            params = {'filter[city]': city}
            response = utils.test_endpoint(self, endpoint, 'ParkResource', 200,
                                           query_params=params)
            response_data = response.json()['data']
            self.assertFalse(response_data)

        # Test filter[zip]
        valid_zips = self.test_cases['valid_zips']
        invalid_zips = self.test_cases['invalid_zips']
        for zip_code in valid_zips:
            params = {'filter[zip]': zip_code}
            response = utils.test_endpoint(self, endpoint, 'ParkResource', 200,
                                           query_params=params)
            response_data = response.json()['data']
            for resource in response_data:
                actual_zip = resource['attributes']['location']['zip']
                self.assertEqual(actual_zip, zip_code)
        for zip_code in invalid_zips:
            params = {'filter[zip]': zip_code}
            response = utils.test_endpoint(self, endpoint, 'ParkResource', 200,
                                           query_params=params)
            response_data = response.json()['data']
            self.assertFalse(response_data)

        # Test filter[state]
        valid_states = self.test_cases['valid_states']
        invalid_states = self.test_cases['invalid_states']
        for state in valid_states:
            params = {'filter[state]': state}
            response = utils.test_endpoint(self, endpoint, 'ParkResource', 200,
                                           query_params=params)
            response_data = response.json()['data']
            for resource in response_data:
                actual_state = resource['attributes']['location']['state']
                self.assertEqual(actual_state, state)
        for state in invalid_states:
            params = {'filter[state]': state}
            utils.test_endpoint(self, endpoint, 'ErrorObject', 400,
                                query_params=params)

    # Test GET parks/{id}
    def test_get_park_by_id(self):
        valid_park_ids = self.test_cases['valid_park_ids']
        invalid_park_ids = self.test_cases['invalid_park_ids']
        for park_id in valid_park_ids:
            response = utils.test_endpoint(self, f'/parks/{park_id}',
                                           'ParkResource', 200)
            actual_id = response.json()['data']['id']
            self.assertEqual(actual_id, park_id)
        for parkId in invalid_park_ids:
            response = utils.test_endpoint(self, f'/parks/{parkId}',
                                           'ErrorObject', 404)

    # Test GET owners/{ownerId}/parks
    def test_get_park_by_owner_id(self):
        valid_owner_ids = self.test_cases['valid_owner_ids']
        invalid_owner_ids = self.test_cases['invalid_owner_ids']
        for owner_id in valid_owner_ids:
            response = utils.test_endpoint(self,
                                           f'/owners/{owner_id}/parks',
                                           'ParkResource', 200)
            response_data = response.json()['data']
            for park in response_data:
                actual = park['relationships']['owner']['data']['id']
                self.assertEqual(actual, owner_id)
        for owner_id in invalid_owner_ids:
            utils.test_endpoint(self, f'/owners/{owner_id}/parks',
                                'ErrorObject', 404)

    # Test GET owners
    def test_get_all_owners(self):
        utils.test_endpoint(self, '/owners', 'OwnerResource', 200)

    # Test GET owner by ID
    def test_get_owner_by_id(self):
        valid_owner_ids = self.test_cases['valid_owner_ids']
        invalid_owner_ids = self.test_cases['invalid_owner_ids']
        for owner_id in valid_owner_ids:
            response = utils.test_endpoint(self,
                                           f'/owners/{owner_id}',
                                           'OwnerResource', 200)
            actual_id = response.json()['data']['id']
            self.assertEqual(actual_id, owner_id)
        for owner_id in invalid_owner_ids:
            response = utils.test_endpoint(self,
                                           f'/owners/{owner_id}',
                                           'ErrorObject', 404)


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
