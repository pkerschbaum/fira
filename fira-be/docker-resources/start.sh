#!/bin/bash

# wait for keycloak server to start
./wait-for-it.sh "${KEYCLOAK_HOST_BASE}" --timeout=300

# start the server (in production mode)
npm run start:prod
