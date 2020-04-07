#!/bin/sh
docker-compose -f docker-compose.k6.yml down --volumes "$@"