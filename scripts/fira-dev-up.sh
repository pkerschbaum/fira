#!/bin/sh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build postgres_fira keycloak postgres_keycloak pgadmin "$@"