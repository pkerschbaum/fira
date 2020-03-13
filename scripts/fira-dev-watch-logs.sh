#!/bin/sh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f --tail 50