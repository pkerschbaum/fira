#!/bin/sh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build postgres_fira pgadmin keycloak "$@"