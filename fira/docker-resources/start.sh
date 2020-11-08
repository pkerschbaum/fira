#!/bin/bash

# wait for keycloak server and postgres_fira DB to start
./wait-for-it.sh "${KEYCLOAK_HOST_BASE}" --timeout=300
./wait-for-it.sh "${FIRA_PERSISTENT_DB_HOST}:${FIRA_PERSISTENT_DB_PORT}" --timeout=300

# start the server (in production mode)
# don't use any "npm run *" commands here to avoid problems with child-process, signal handling, graceful shutdown
# see https://dev.to/nodepractices/docker-best-practices-with-node-js-4ln4
node dist/fira-appsvc/src/main
