# Template of Integration Test ![python](https://img.shields.io/badge/python-3.7-blue.svg)

This directory contains template files that run integration tests against the API.

## Configuration

### Test on local instance

1. Start the API which should be tested locally.
2. copy
[configuration-example.json](./configuration-example.json) as `configuration.json`  and modify it as necessary. For example:

    ```json
    "local_test": true,
    "api": {
        "local_base_url": "https://localhost:8080/api/v1",
        ...
    },
    "auth": {
        "basic_auth": {
            "username": <username>,
            "password": <password>
        },
        ...
    },
    ...
    ```

## Usage

1. Install dependencies via pip:

    ```shell
    $ pip install -r requirements.txt
    ```

2. Run the integration test:

    ```shell
    $ python integration-test.py -v --config path/to/configuration.json --openapi path/to/openapi.yaml
    ```