#!/bin/bash

# wait for keycloak server to start
./wait-for-it.sh "${KEYCLOAK_HOST_BASE}" --timeout=300

# start the server (in production mode)
# don't use any "npm run *" commands here to avoid problems with child-process, signal handling, graceful shutdown
# see https://dev.to/nodepractices/docker-best-practices-with-node-js-4ln4
node dist/fira-appsvc/src/main
