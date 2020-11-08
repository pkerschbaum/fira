#!/bin/bash

# wait for postgres_keycloak DB to start
./wait-for-it.sh "${DB_ADDR}:5432" --timeout=300

# add admin user for realm fira
/opt/jboss/keycloak/bin/add-user-keycloak.sh -r fira -u ${KEYCLOAK_ADMIN_USER} -p ${KEYCLOAK_ADMIN_PASSWORD}
# start the server
/opt/jboss/tools/docker-entrypoint.sh -b 0.0.0.0