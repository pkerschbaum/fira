#!/bin/bash

# add admin user for realm fira
/opt/jboss/keycloak/bin/add-user-keycloak.sh -r fira -u ${KEYCLOAK_USER} -p ${KEYCLOAK_PASSWORD}
# start the server
/opt/jboss/tools/docker-entrypoint.sh -b 0.0.0.0